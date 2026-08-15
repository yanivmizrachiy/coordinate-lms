import {
  AXIS_POINT_MOVED_UP_FOUR,
  axisPointMovedUpFourMatches,
} from './digitalCoordinateSafePredicate';
import {
  evaluateDigitalGroupRule,
  type DigitalGroupRule,
} from './digitalPredicates';
import {
  DELIVERY_SAME_STREET_WITH_DISTANCE_WORK,
  HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
  PHONE_SAME_COLUMN_WITH_DISTANCE,
  lifeRuleMatches,
} from './digitalLifePredicates';
import {
  OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK,
  ownAxisAlignedRectangleWithWorkMatches,
} from './digitalRectanglePredicates';
import {
  HORIZONTAL_LENGTH_FOUR_WITH_WORK,
  horizontalLengthFourWithWorkMatches,
} from './digitalSegmentPredicates';
import {
  SUSPECT_X_FIVE_LABEL_PAIR,
  suspectXFiveLabelPairMatches,
} from './digitalSuspectPredicate';

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
    .trim()
    .replace(/[־–—]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .toLocaleLowerCase('he');
}

type AxisName = 'x' | 'y';

function axisName(raw: string): AxisName | null {
  const value = normalizeAnswer(raw).replace(/[-'"׳״]/g, '');

  if (
    ['x', 'צירx', 'איקס', 'אקס', 'ציראיקס', 'ציראקס', 'ס'].includes(value)
  ) {
    return 'x';
  }

  if (
    ['y', 'צירy', 'וואי', 'ואי', 'ווי', 'צירוואי', 'צירואי', 'ט'].includes(value)
  ) {
    return 'y';
  }

  return null;
}

function axisAliasMatches(raw: string, candidate: string): boolean {
  const expectedAxis = axisName(candidate);
  if (!expectedAxis) return false;
  return axisName(raw) === expectedAxis;
}

function predicateMatches(raw: string, candidate: string): boolean {
  const ruleName = candidate.slice('predicate:'.length);
  if (ruleName === AXIS_POINT_MOVED_UP_FOUR) {
    return axisPointMovedUpFourMatches(raw.split('|'));
  }
  if (ruleName === SUSPECT_X_FIVE_LABEL_PAIR) {
    return suspectXFiveLabelPairMatches(raw.split('|'));
  }
  if (ruleName === HORIZONTAL_LENGTH_FOUR_WITH_WORK) {
    return horizontalLengthFourWithWorkMatches(raw.split('|'));
  }
  if (ruleName === OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK) {
    return ownAxisAlignedRectangleWithWorkMatches(raw.split('|'));
  }
  if (
    ruleName === PHONE_SAME_COLUMN_WITH_DISTANCE ||
    ruleName === HALL_SEAT_ABOVE_NOA_WITH_DISTANCE ||
    ruleName === DELIVERY_SAME_STREET_WITH_DISTANCE_WORK
  ) {
    return lifeRuleMatches(ruleName, raw.split('|'));
  }

  const rule = ruleName as DigitalGroupRule;
  const values = rule === 'nonnegative-number'
    ? [raw]
    : raw.split('|');
  return evaluateDigitalGroupRule(rule, values);
}

export function answersMatch(raw: string, expected: readonly string[]): boolean {
  if (!isAllowedExpectedAnswer(raw)) return false;

  const rawNumber = numericValue(raw);
  const normalized = normalizeAnswer(raw);

  return expected.some((candidate) => {
    if (!isAllowedExpectedAnswer(candidate)) return false;
    if (candidate.startsWith('predicate:')) {
      return predicateMatches(raw, candidate);
    }
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

    if (axisAliasMatches(raw, candidate)) return true;

    return normalizeAnswer(candidate) === normalized;
  });
}
