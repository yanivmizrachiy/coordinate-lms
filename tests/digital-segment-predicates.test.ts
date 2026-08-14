import { describe, expect, it } from 'vitest';
import { evaluateDigitalGroupRule } from '../src/lms/digitalPredicates';
import { segmentPredicateRuleForCoverage } from '../src/lms/digitalSegmentPredicates';

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
});
