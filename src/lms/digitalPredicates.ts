export type DigitalGroupRule = 'distinct-coordinate-pairs';

function finiteNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function evaluateDigitalGroupRule(
  rule: DigitalGroupRule,
  values: readonly string[],
): boolean {
  if (rule === 'distinct-coordinate-pairs') {
    if (values.length !== 4) return false;
    const numbers = values.map(finiteNumber);
    if (numbers.some((value) => value === null)) return false;
    const [x1, y1, x2, y2] = numbers as [number, number, number, number];

    // The canonical task asks for two points whose x-values differ AND whose
    // y-values differ. There is no single model answer: every pair satisfying
    // the mathematical predicate is correct.
    return x1 !== x2 && y1 !== y2;
  }

  return false;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * Adds LMS-only mathematical metadata to canonical worksheet targets.
 * It never edits the printable source. Matching is based on the stable
 * canonical prompt text, not a page number, so page insertion/reordering does
 * not silently bind the rule to another question.
 */
export function hydrateDigitalPredicates(root: ParentNode): void {
  for (const card of root.querySelectorAll<HTMLElement>('.q-card')) {
    const heading = normalizedText(card.querySelector('h3'));
    if (
      !heading.includes('תנו דוגמה לשתי נקודות') ||
      !heading.includes('ערך ה־x שלהן שונה') ||
      !heading.includes('שיעור ה־y שלהן שונה')
    ) {
      continue;
    }

    const targets = Array.from(
      card.querySelectorAll<HTMLElement>('.pair-blank'),
    );
    if (targets.length !== 4) continue;

    const groupId = 'distinct-coordinate-pairs';
    for (const target of targets) {
      target.dataset['lmsGroup'] = groupId;
      target.dataset['lmsGroupRule'] = 'distinct-coordinate-pairs';
    }
  }
}
