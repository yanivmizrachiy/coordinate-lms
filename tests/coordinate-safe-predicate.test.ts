import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  AXIS_POINT_MOVED_UP_FOUR,
  axisPointMovedUpFourMatches,
  coordinateSafePredicateRuleForCoverage,
  hydrateDigitalCoordinateSafePredicate,
} from '../src/lms/digitalCoordinateSafePredicate';

function canonicalPage42Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 42);
  expect(page).toBeDefined();
  const { document, window } = parseHTML(
    `<div id="root">${page!.html}</div>`,
  );
  Object.assign(globalThis, {
    Node: window.Node,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
    Event: window.Event,
    document,
    window,
  });
  const root = document.querySelector<HTMLElement>('#root');
  expect(root).not.toBeNull();
  return root!;
}

describe('page 42 dependent coordinate predicate', () => {
  it('accepts every legal G on x-axis and derives the moved point and distance', () => {
    expect(axisPointMovedUpFourMatches(['3', '0', '3', '4', '4'])).toBe(true);
    expect(axisPointMovedUpFourMatches(['0', '0', '0', '4', '4'])).toBe(true);
    expect(axisPointMovedUpFourMatches(['8', '0', '8', '4', '4'])).toBe(true);
    expect(
      answersMatch('5|0|5|4|4', [`predicate:${AXIS_POINT_MOVED_UP_FOUR}`]),
    ).toBe(true);
  });

  it('rejects off-axis, changed x, wrong rise, wrong distance, and off-grid x', () => {
    expect(axisPointMovedUpFourMatches(['3', '1', '3', '5', '5'])).toBe(false);
    expect(axisPointMovedUpFourMatches(['3', '0', '4', '4', '4'])).toBe(false);
    expect(axisPointMovedUpFourMatches(['3', '0', '3', '5', '5'])).toBe(false);
    expect(axisPointMovedUpFourMatches(['3', '0', '3', '4', '3'])).toBe(false);
    expect(axisPointMovedUpFourMatches(['9', '0', '9', '4', '4'])).toBe(false);
  });

  it('binds the five dependent fields to one runtime proxy', () => {
    const root = canonicalPage42Root();
    const cleanup = hydrateDigitalCoordinateSafePredicate(root);
    const proxies = Array.from(
      root.querySelectorAll<HTMLElement>(
        `.lms-group-proxy[data-lms-group="${AXIS_POINT_MOVED_UP_FOUR}-page42"]`,
      ),
    );
    expect(proxies).toHaveLength(1);
    expect(
      root.querySelectorAll(
        `[data-lms-group="${AXIS_POINT_MOVED_UP_FOUR}-page42"]:not(.lms-group-proxy)`,
      ),
    ).toHaveLength(5);
    expect(proxies[0]!.dataset['lmsAnswers']).toBe(
      JSON.stringify([`predicate:${AXIS_POINT_MOVED_UP_FOUR}`]),
    );
    cleanup();
  });

  it('connects exactly p42-q12 through p42-q16 to coverage', () => {
    for (let q = 12; q <= 16; q += 1) {
      expect(coordinateSafePredicateRuleForCoverage(42, `p42-q${q}`)).toBe(
        AXIS_POINT_MOVED_UP_FOUR,
      );
    }
    expect(coordinateSafePredicateRuleForCoverage(42, 'p42-q11')).toBeNull();
    expect(coordinateSafePredicateRuleForCoverage(42, 'p42-q17')).toBeNull();
  });
});
