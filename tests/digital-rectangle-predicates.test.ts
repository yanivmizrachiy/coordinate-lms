import { describe, expect, it } from 'vitest';
import {
  OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK,
  ownAxisAlignedRectangleWithWorkMatches,
  rectanglePredicateRuleForCoverage,
} from '../src/lms/digitalRectanglePredicates';
import { answersMatch } from '../src/lms/answerValidation';

const validHorizontal = [
  '1', '1', '6', '1', '6', '4', '1', '4',
  '6 − 1', '5', '5',
  '4 − 1', '3', '3',
  '16', '15',
];

const validVerticalFirst = [
  '2', '1', '2', '5', '7', '5', '7', '1',
  '5 − 1', '4', '4',
  '7 − 2', '5', '5',
  '18', '20',
];

describe('learner-created rectangle predicate', () => {
  it('accepts different valid non-square rectangles with consistent work', () => {
    expect(ownAxisAlignedRectangleWithWorkMatches(validHorizontal)).toBe(true);
    expect(ownAxisAlignedRectangleWithWorkMatches(validVerticalFirst)).toBe(true);
    expect(
      answersMatch(
        validHorizontal.join('|'),
        [`predicate:${OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK}`],
      ),
    ).toBe(true);
  });

  it('rejects a square, wrong vertex order, out-of-grid coordinates, and inconsistent calculations', () => {
    const square = [...validHorizontal];
    square.splice(0, 8, '1', '1', '4', '1', '4', '4', '1', '4');
    expect(ownAxisAlignedRectangleWithWorkMatches(square)).toBe(false);

    const wrongOrder = [...validHorizontal];
    wrongOrder.splice(0, 8, '1', '1', '6', '4', '6', '1', '1', '4');
    expect(ownAxisAlignedRectangleWithWorkMatches(wrongOrder)).toBe(false);

    const outsideGrid = [...validHorizontal];
    outsideGrid[2] = '9';
    outsideGrid[4] = '9';
    expect(ownAxisAlignedRectangleWithWorkMatches(outsideGrid)).toBe(false);

    const backwardsWork = [...validHorizontal];
    backwardsWork[8] = '1 − 6';
    expect(ownAxisAlignedRectangleWithWorkMatches(backwardsWork)).toBe(false);

    const wrongArea = [...validHorizontal];
    wrongArea[15] = '16';
    expect(ownAxisAlignedRectangleWithWorkMatches(wrongArea)).toBe(false);
  });

  it('binds all sixteen dependent page-53 targets and no neighboring target', () => {
    for (let q = 13; q <= 28; q += 1) {
      expect(rectanglePredicateRuleForCoverage(53, `p53-q${q}`))
        .toBe(OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK);
    }
    expect(rectanglePredicateRuleForCoverage(53, 'p53-q12')).toBeNull();
    expect(rectanglePredicateRuleForCoverage(54, 'p54-q13')).toBeNull();
  });
});
