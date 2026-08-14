import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  DELIVERY_SAME_STREET_WITH_DISTANCE_WORK,
  HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
  PHONE_SAME_COLUMN_WITH_DISTANCE,
  deliverySameStreetWithDistanceWorkMatches,
  hallSeatAboveNoaWithDistanceMatches,
  hydrateDigitalLifePredicates,
  lifePredicateRuleForCoverage,
  phoneSameColumnWithDistanceMatches,
} from '../src/lms/digitalLifePredicates';

function canonicalRoot(pageNumber: number): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === pageNumber);
  expect(page).toBeDefined();
  const { document, window } = parseHTML(`<div id="root">${page!.html}</div>`);
  Object.assign(globalThis, {
    Node: window.Node,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
    document,
    window,
  });
  const root = document.querySelector<HTMLElement>('#root');
  expect(root).not.toBeNull();
  return root!;
}

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

  it('binds page 59 only to the chosen point and its final distance, not the earlier row-number question', () => {
    const root = canonicalRoot(59);
    const cleanup = hydrateDigitalLifePredicates(root);
    const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) =>
      candidate.querySelector('h3')?.textContent?.includes('הסדר קובע — גם בטלפון'),
    );
    expect(card).toBeDefined();
    const pair = Array.from(card!.querySelectorAll<HTMLElement>('.pair-blank'));
    const numbers = Array.from(
      card!.querySelectorAll<HTMLElement>('.blank[data-missing="number"]'),
    );
    expect(pair).toHaveLength(2);
    expect(numbers).toHaveLength(2);
    expect(pair.every((target) => target.dataset['lmsGroup'] === PHONE_SAME_COLUMN_WITH_DISTANCE))
      .toBe(true);
    expect(numbers[0]?.dataset['lmsGroup']).toBeUndefined();
    expect(numbers[1]?.dataset['lmsGroup']).toBe(PHONE_SAME_COLUMN_WITH_DISTANCE);
    expect(
      root.querySelectorAll(
        `.lms-group-proxy[data-lms-group="${PHONE_SAME_COLUMN_WITH_DISTANCE}"]`,
      ),
    ).toHaveLength(1);
    cleanup();
  });

  it('binds the split-line hall pair and all five delivery fields to their atomic predicates', () => {
    const hallRoot = canonicalRoot(60);
    const hallCleanup = hydrateDigitalLifePredicates(hallRoot);
    expect(
      hallRoot.querySelectorAll(
        `[data-lms-group="${HALL_SEAT_ABOVE_NOA_WITH_DISTANCE}"]:not(.lms-group-proxy)`,
      ),
    ).toHaveLength(3);
    hallCleanup();

    const deliveryRoot = canonicalRoot(62);
    const deliveryCleanup = hydrateDigitalLifePredicates(deliveryRoot);
    expect(
      deliveryRoot.querySelectorAll(
        `[data-lms-group="${DELIVERY_SAME_STREET_WITH_DISTANCE_WORK}"]:not(.lms-group-proxy)`,
      ),
    ).toHaveLength(5);
    deliveryCleanup();
  });
});
