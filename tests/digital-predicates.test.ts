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
    // B=(5,0): G is on x-axis and right of B.
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['6', '0'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['5', '0'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-on-x-right-of-5', ['7', '1'])).toBe(false);

    // P=(2,5), R=(5,6): S is right of P and below R.
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['3', '5'])).toBe(true);
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['2', '5'])).toBe(false);
    expect(evaluateDigitalGroupRule('point-right-of-2-below-6', ['3', '6'])).toBe(false);
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
    expect(answersMatch('9', ['predicate:nonnegative-number'])).toBe(true);
  });
});
