import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';
import {
  HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
  PHONE_SAME_COLUMN_WITH_DISTANCE,
  hallSeatAboveNoaWithDistanceMatches,
  lifePredicateRuleForCoverage,
  phoneSameColumnWithDistanceMatches,
} from '../src/lms/digitalLifePredicates';

describe('real-life point choice predicates', () => {
  it('accepts a new phone icon in Maps column with its derived vertical distance', () => {
    expect(phoneSameColumnWithDistanceMatches(['1', '4', '2'])).toBe(true);
    expect(phoneSameColumnWithDistanceMatches(['1', '0', '2'])).toBe(true);
    expect(
      answersMatch('1|4|2', [`predicate:${PHONE_SAME_COLUMN_WITH_DISTANCE}`]),
    ).toBe(true);
  });

  it('rejects another column, the Maps position itself, a wrong distance, and off-grid points', () => {
    expect(phoneSameColumnWithDistanceMatches(['2', '4', '2'])).toBe(false);
    expect(phoneSameColumnWithDistanceMatches(['1', '2', '0'])).toBe(false);
    expect(phoneSameColumnWithDistanceMatches(['1', '4', '3'])).toBe(false);
    expect(phoneSameColumnWithDistanceMatches(['1', '7', '5'])).toBe(false);
  });

  it('accepts a free seat above Noa and checks the row difference', () => {
    expect(hallSeatAboveNoaWithDistanceMatches(['5', '3', '2'])).toBe(true);
    expect(hallSeatAboveNoaWithDistanceMatches(['1', '6', '5'])).toBe(true);
    expect(
      answersMatch('5|3|2', [`predicate:${HALL_SEAT_ABOVE_NOA_WITH_DISTANCE}`]),
    ).toBe(true);
  });

  it('rejects Noa row/below, occupied seats above, wrong distance, and off-grid points', () => {
    expect(hallSeatAboveNoaWithDistanceMatches(['5', '1', '0'])).toBe(false);
    expect(hallSeatAboveNoaWithDistanceMatches(['2', '4', '3'])).toBe(false);
    expect(hallSeatAboveNoaWithDistanceMatches(['7', '4', '3'])).toBe(false);
    expect(hallSeatAboveNoaWithDistanceMatches(['5', '3', '3'])).toBe(false);
    expect(hallSeatAboveNoaWithDistanceMatches(['9', '3', '2'])).toBe(false);
  });

  it('binds exactly the six dependent canonical targets', () => {
    for (let q = 15; q <= 17; q += 1) {
      expect(lifePredicateRuleForCoverage(59, `p59-q${q}`))
        .toBe(PHONE_SAME_COLUMN_WITH_DISTANCE);
    }
    for (let q = 13; q <= 15; q += 1) {
      expect(lifePredicateRuleForCoverage(60, `p60-q${q}`))
        .toBe(HALL_SEAT_ABOVE_NOA_WITH_DISTANCE);
    }
    expect(lifePredicateRuleForCoverage(59, 'p59-q14')).toBeNull();
    expect(lifePredicateRuleForCoverage(60, 'p60-q12')).toBeNull();
  });
});
