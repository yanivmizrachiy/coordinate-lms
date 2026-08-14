import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';
import { evaluateDigitalGroupRule } from '../src/lms/digitalPredicates';

describe('digital mathematical predicates', () => {
  it('accepts any two first-quadrant points whose x and y values both differ', () => {
    expect(
      evaluateDigitalGroupRule(
        'distinct-coordinate-pairs',
        ['1', '2', '4', '5'],
      ),
    ).toBe(true);
    expect(
      evaluateDigitalGroupRule(
        'distinct-coordinate-pairs',
        ['0', '6', '8', '0'],
      ),
    ).toBe(true);
  });

  it('rejects equal x, equal y, incomplete, nonnumeric, or negative coordinates', () => {
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '1', '2', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '5', '7', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '5', '', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['A', '5', '7', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['-1', '5', '7', '3'])).toBe(false);
  });

  it('integrates the group predicate with the normal LMS answer matcher', () => {
    expect(
      answersMatch(
        '1|2|4|5',
        ['predicate:distinct-coordinate-pairs'],
      ),
    ).toBe(true);
    expect(
      answersMatch(
        '1|2|1|5',
        ['predicate:distinct-coordinate-pairs'],
      ),
    ).toBe(false);
  });
});
