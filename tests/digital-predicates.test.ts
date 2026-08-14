import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';
import { evaluateDigitalGroupRule } from '../src/lms/digitalPredicates';

describe('digital mathematical predicates', () => {
  it('accepts any two first-quadrant points whose x and y values both differ', () => {
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['1', '2', '4', '5'])).toBe(true);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['0', '6', '8', '0'])).toBe(true);
  });

  it('rejects equal x, equal y, incomplete, nonnumeric, or negative coordinates', () => {
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '1', '2', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '5', '7', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['2', '5', '', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['A', '5', '7', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('distinct-coordinate-pairs', ['-1', '5', '7', '3'])).toBe(false);
  });

  it('checks axis and quadrant descriptions without choosing a model point', () => {
    expect(evaluateDigitalGroupRule('point-above-x-axis', ['0', '4'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-above-x-axis', ['4', '0'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-right-of-y-axis', ['4', '0'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-right-of-y-axis', ['0', '4'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-on-x-axis', ['7', '0'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-on-x-axis', ['7', '1'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-on-y-axis', ['0', '7'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-on-y-axis', ['1', '7'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-above-and-right', ['2', '3'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-above-and-right', ['0', '3'])).toBe(false);
  });

  it('checks relative-position constraints against canonical plotted points', () => {
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['6', '0'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['5', '0'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['7', '1'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['3', '5'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['2', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['3', '6'])).toBe(false);
  });

  it('accepts all and only learner-chosen points for the suspect and park prompts', () => {
    expect(evaluateDigitalGroupRule('point-y-equals-6', ['0', '6'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-y-equals-6', ['7', '6'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-y-equals-6', ['7', '5'])).toBe(false);

    expect(evaluateDigitalGroupRule('point-x-3-between-2-and-5', ['3', '3'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-x-3-between-2-and-5', ['3', '4'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-x-3-between-2-and-5', ['3', '2'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-x-3-between-2-and-5', ['3', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-x-3-between-2-and-5', ['4', '4'])).toBe(false);
  });

  it('checks the two equal-weight/equal-price package pairs in any order', () => {
    expect(evaluateDigitalGroupRule('same-weight-package-pairs', ['B', 'C', 'D', 'E'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-weight-package-pairs', ['E', 'D', 'C', 'B'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-weight-package-pairs', ['A', 'B', 'D', 'E'])).toBe(false);
    expect(evaluateDigitalGroupRule('same-price-package-pairs', ['A', 'B', 'D', 'F'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-price-package-pairs', ['F', 'D', 'B', 'A'])).toBe(true);
    expect(evaluateDigitalGroupRule('same-price-package-pairs', ['A', 'C', 'D', 'F'])).toBe(false);
  });

  it('checks a learner-defined y=x+k rule as one dependent response', () => {
    expect(evaluateDigitalGroupRule('custom-y-equals-x-plus-k', ['3', '0', '3', '4', '7', '3'])).toBe(true);
    expect(evaluateDigitalGroupRule('custom-y-equals-x-plus-k', ['2', '1', '3', '5', '7', '2'])).toBe(true);
    expect(evaluateDigitalGroupRule('custom-y-equals-x-plus-k', ['3', '0', '3', '4', '6', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('custom-y-equals-x-plus-k', ['3', '0', '3', '0', '3', '3'])).toBe(false);
    expect(evaluateDigitalGroupRule('custom-y-equals-x-plus-k', ['3', '-1', '2', '4', '7', '3'])).toBe(false);
  });

  it('accepts any non-negative free coordinate on an axis', () => {
    expect(evaluateDigitalGroupRule('nonnegative-number', ['0'])).toBe(true);
    expect(evaluateDigitalGroupRule('nonnegative-number', ['7.5'])).toBe(true);
    expect(evaluateDigitalGroupRule('nonnegative-number', ['-1'])).toBe(false);
  });

  it('integrates every predicate through the normal LMS answer matcher', () => {
    expect(answersMatch('1|2|4|5', ['predicate:distinct-coordinate-pairs'])).toBe(true);
    expect(answersMatch('1|2|1|5', ['predicate:distinct-coordinate-pairs'])).toBe(false);
    expect(answersMatch('8|0', ['predicate:point-on-x-axis'])).toBe(true);
    expect(answersMatch('0|8', ['predicate:point-on-x-axis'])).toBe(false);
    expect(answersMatch('7|6', ['predicate:point-y-equals-6'])).toBe(true);
    expect(answersMatch('3|4', ['predicate:point-x-3-between-2-and-5'])).toBe(true);
    expect(answersMatch('B|C|D|E', ['predicate:same-weight-package-pairs'])).toBe(true);
    expect(answersMatch('3|0|3|4|7|3', ['predicate:custom-y-equals-x-plus-k'])).toBe(true);
    expect(answersMatch('9', ['predicate:nonnegative-number'])).toBe(true);
  });
});
