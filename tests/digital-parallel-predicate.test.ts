import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';
import { evaluateDigitalGroupRule } from '../src/lms/digitalPredicates';

describe('parallel-through-(3,4) predicate', () => {
  it('accepts any new horizontal point first and any new vertical point second', () => {
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['7', '4', '3', '8'])).toBe(true);
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['0', '4', '3', '0'])).toBe(true);
  });

  it('rejects wrong axes, the original point, and negative coordinates', () => {
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['7', '5', '3', '8'])).toBe(false);
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['7', '4', '2', '8'])).toBe(false);
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['3', '4', '3', '8'])).toBe(false);
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['7', '4', '3', '4'])).toBe(false);
    expect(evaluateDigitalGroupRule('parallel-through-3-4-points', ['-1', '4', '3', '8'])).toBe(false);
  });

  it('runs through the ordinary answer matcher', () => {
    expect(answersMatch('7|4|3|8', ['predicate:parallel-through-3-4-points'])).toBe(true);
    expect(answersMatch('7|5|3|8', ['predicate:parallel-through-3-4-points'])).toBe(false);
  });
});
