import { describe, expect, it } from 'vitest';
import { evaluateDigitalGroupRule } from '../src/lms/digitalPredicates';
import {
  HORIZONTAL_LENGTH_FOUR_WITH_WORK,
  horizontalLengthFourWithWorkMatches,
  segmentPredicateRuleForCoverage,
} from '../src/lms/digitalSegmentPredicates';

describe('learner-created axis-parallel segment predicates', () => {
  it('routes two learner-created points with the same y to the shared-y predicate', () => {
    const context = 'כתבו שתי נקודות משלכם שיש להן שיעור y זהה: ([…],[…]) ו־([…],[…]).';
    expect(segmentPredicateRuleForCoverage(context, 'ordered-pair-coordinate'))
      .toBe('same-y-coordinate-pairs');
    expect(evaluateDigitalGroupRule('same-y-coordinate-pairs', ['1', '4', '8', '4'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-y-coordinate-pairs', ['1', '4', '8', '5'])).toBe(false);
  });

  it('routes EF parallel to y to the shared-x predicate', () => {
    const context = 'סמנו על המערכת שבסעיף א קטע EF המקביל לציר y, וכתבו את שיעורי קצותיו: E([…],[…]) F([…],[…]).';
    expect(segmentPredicateRuleForCoverage(context, 'ordered-pair-coordinate'))
      .toBe('same-x-coordinate-pairs');
    expect(evaluateDigitalGroupRule('same-x-coordinate-pairs', ['3', '1', '3', '6'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-x-coordinate-pairs', ['3', '1', '4', '6'])).toBe(false);
  });

  it('accepts any horizontal KL of length four with consistent subtraction and result', () => {
    expect(
      horizontalLengthFourWithWorkMatches(['1', '3', '5', '3', '5 − 1', '4', '4']),
    ).toBe(true);
    expect(
      horizontalLengthFourWithWorkMatches(['5', '3', '1', '3', '5-1', '4', '4']),
    ).toBe(true);
    expect(
      horizontalLengthFourWithWorkMatches(['0.5', '2', '4.5', '2', '4.5 − 0.5', '4', '4']),
    ).toBe(true);
  });

  it('rejects a vertical segment, wrong length, backwards subtraction, or wrong result', () => {
    expect(
      horizontalLengthFourWithWorkMatches(['2', '1', '2', '5', '2 − 2', '0', '0']),
    ).toBe(false);
    expect(
      horizontalLengthFourWithWorkMatches(['1', '3', '6', '3', '6 − 1', '5', '5']),
    ).toBe(false);
    expect(
      horizontalLengthFourWithWorkMatches(['1', '3', '5', '3', '1 − 5', '4', '4']),
    ).toBe(false);
    expect(
      horizontalLengthFourWithWorkMatches(['1', '3', '5', '3', '5 − 1', '3', '4']),
    ).toBe(false);
  });

  it('binds all seven canonical page-47 response targets to the grouped rule', () => {
    for (let q = 16; q <= 22; q += 1) {
      expect(
        segmentPredicateRuleForCoverage(
          '',
          q <= 19 ? 'ordered-pair-coordinate' : 'text:number',
          47,
          `p47-q${q}`,
        ),
      ).toBe(HORIZONTAL_LENGTH_FOUR_WITH_WORK);
    }
    expect(
      segmentPredicateRuleForCoverage('', 'text:number', 47, 'p47-q15'),
    ).toBeNull();
  });
});
