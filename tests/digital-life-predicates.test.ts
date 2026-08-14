import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';
import {
  DELIVERY_SAME_STREET_WITH_DISTANCE_WORK,
  HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
  PHONE_SAME_COLUMN_WITH_DISTANCE,
  deliverySameStreetWithDistanceWorkMatches,
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

  it('accepts any new delivery address on restaurant street with consistent subtraction and length', () => {
    expect(
      deliverySameStreetWithDistanceWorkMatches(['6', '1', '6 − 1', '5', '5']),
    ).toBe(true);
    expect(
      deliverySameStreetWithDistanceWorkMatches(['0', '1', '1 − 0', '1', '1']),
    ).toBe(true);
    expect(
      answersMatch(
        '6|1|6 − 1|5|5',
        [`predicate:${DELIVERY_SAME_STREET_WITH_DISTANCE_WORK}`],
      ),
    ).toBe(true);
  });

  it('rejects another street, restaurant itself, backwards subtraction, wrong length, and off-grid address', () => {
    expect(
      deliverySameStreetWithDistanceWorkMatches(['6', '2', '6 − 1', '5', '5']),
    ).toBe(false);
    expect(
      deliverySameStreetWithDistanceWorkMatches(['1', '1', '1 − 1', '0', '0']),
    ).toBe(false);
    expect(
      deliverySameStreetWithDistanceWorkMatches(['6', '1', '1 − 6', '5', '5']),
    ).toBe(false);
    expect(
      deliverySameStreetWithDistanceWorkMatches(['6', '1', '6 − 1', '4', '5']),
    ).toBe(false);
    expect(
      deliverySameStreetWithDistanceWorkMatches(['9', '1', '9 − 1', '8', '8']),
    ).toBe(false);
  });

  it('binds exactly the dependent canonical life targets', () => {
    for (let q = 15; q <= 17; q += 1) {
      expect(lifePredicateRuleForCoverage(59, `p59-q${q}`))
        .toBe(PHONE_SAME_COLUMN_WITH_DISTANCE);
    }
    for (let q = 13; q <= 15; q += 1) {
      expect(lifePredicateRuleForCoverage(60, `p60-q${q}`))
        .toBe(HALL_SEAT_ABOVE_NOA_WITH_DISTANCE);
    }
    for (let q = 11; q <= 15; q += 1) {
      expect(lifePredicateRuleForCoverage(62, `p62-q${q}`))
        .toBe(DELIVERY_SAME_STREET_WITH_DISTANCE_WORK);
    }
    expect(lifePredicateRuleForCoverage(59, 'p59-q14')).toBeNull();
    expect(lifePredicateRuleForCoverage(60, 'p60-q12')).toBeNull();
    expect(lifePredicateRuleForCoverage(62, 'p62-q10')).toBeNull();
  });
});
