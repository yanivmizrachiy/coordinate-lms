const MAX_ANSWER_LENGTH = 120;

function numericValue(raw: string): number | null {
  const value = raw
    .trim()
    .replace(/,/g, '.')
    .replace(/\u00a0/g, ' ')
    .replace(/½/g, ' 1/2')
    .replace(/¼/g, ' 1/4')
    .replace(/¾/g, ' 3/4')
    .replace(/\s+/g, ' ');

  const mixed = value.match(/^([+-]?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed?.[1] && mixed[2] && mixed[3]) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (denominator === 0 || numerator >= denominator) return null;
    return whole < 0
      ? whole - numerator / denominator
      : whole + numerator / denominator;
  }

  const fraction = value.match(/^([+-]?\d+)\/(\d+)$/);
  if (fraction?.[1] && fraction[2]) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    return denominator === 0 ? null : numerator / denominator;
  }

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isAllowedExpectedAnswer(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= MAX_ANSWER_LENGTH &&
    !/[\u0000-\u001f\u007f]/.test(trimmed) &&
    !/[<>]/.test(trimmed)
  );
}

export function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFKC')
    .trim()
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[־–—]/g, '-')
    .replace(/[׳']/g, '')
    .replace(/[״"]/g, '')
    .replace(/[.,;:!?()[\]{}]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .toLocaleLowerCase('he');
}

function isHebrewWordLike(value: string): boolean {
  return value.length >= 3 && /^[\u05D0-\u05EA-]+$/.test(value);
}

/**
 * Bounded Damerau-Levenshtein distance for harmless spelling tolerance.
 * This is intentionally used only for Hebrew word-like answers — never for
 * numbers, ordered data or set answers — so mathematical meaning stays strict.
 */
function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i]![0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0]![j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        best = Math.min(best, matrix[i - 2]![j - 2]! + 1);
      }
      matrix[i]![j] = best;
    }
  }

  return matrix[a.length]![b.length]!;
}

function harmlessHebrewVariant(actual: string, expected: string): boolean {
  if (!isHebrewWordLike(actual) || !isHebrewWordLike(expected)) return false;
  const longest = Math.max(actual.length, expected.length);
  const allowed = longest >= 8 ? 2 : 1;
  return editDistance(actual, expected) <= allowed;
}

export function answersMatch(raw: string, expected: readonly string[]): boolean {
  if (!isAllowedExpectedAnswer(raw)) return false;

  const rawNumber = numericValue(raw);
  const normalized = normalizeAnswer(raw);

  return expected.some((candidate) => {
    if (!isAllowedExpectedAnswer(candidate)) return false;
    if (candidate.startsWith('set:')) {
      const expectedTokens = candidate
        .slice(4)
        .split(',')
        .map((token) => token.trim().toLocaleLowerCase('he'))
        .filter(Boolean);
      if (
        expectedTokens.length < 2 ||
        !expectedTokens.every((token) => /^[a-z]+$/i.test(token))
      ) {
        return false;
      }
      const actualTokens = (raw.match(/[a-z]+/gi) || []).map((token) =>
        token.toLocaleLowerCase('he'),
      );
      return (
        actualTokens.length === expectedTokens.length &&
        new Set(actualTokens).size === actualTokens.length &&
        [...actualTokens].sort().join(',') ===
          [...expectedTokens].sort().join(',')
      );
    }

    const candidateNumber = numericValue(candidate);
    if (rawNumber !== null && candidateNumber !== null) {
      return Math.abs(rawNumber - candidateNumber) < 1e-12;
    }

    const expectedNormalized = normalizeAnswer(candidate);
    if (expectedNormalized === normalized) return true;

    return harmlessHebrewVariant(normalized, expectedNormalized);
  });
}
