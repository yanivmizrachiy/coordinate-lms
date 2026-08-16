import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  EQUAL_POSITIVE_COORDINATE_POINT,
  equalPositiveCoordinatePointMatches,
  freePointPredicateRuleForCoverage,
  hydrateDigitalFreePointPredicates,
} from '../src/lms/digitalFreePointPredicates';

function canonicalPage58Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 58);
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

describe('free equal-coordinate point predicate', () => {
  it('accepts any positive point with x equal to y', () => {
    expect(equalPositiveCoordinatePointMatches(['1', '1'])).toBe(true);
    expect(equalPositiveCoordinatePointMatches(['3,5', '3,5'])).toBe(true);
    expect(
      answersMatch('6|6', [`predicate:${EQUAL_POSITIVE_COORDINATE_POINT}`]),
    ).toBe(true);
  });

  it('rejects origin, axis points, unequal coordinates, and negative coordinates', () => {
    expect(equalPositiveCoordinatePointMatches(['0', '0'])).toBe(false);
    expect(equalPositiveCoordinatePointMatches(['4', '0'])).toBe(false);
    expect(equalPositiveCoordinatePointMatches(['2', '3'])).toBe(false);
    expect(equalPositiveCoordinatePointMatches(['-2', '-2'])).toBe(false);
  });

  it('binds exactly the chosen point pair to one runtime proxy', () => {
    const root = canonicalPage58Root();
    const cleanup = hydrateDigitalFreePointPredicates(root);
    const group = `${EQUAL_POSITIVE_COORDINATE_POINT}-free-point`;
    expect(
      root.querySelectorAll(
        `.lms-group-proxy[data-lms-group="${group}"]`,
      ),
    ).toHaveLength(1);
    expect(
      root.querySelectorAll(
        `[data-lms-group="${group}"]:not(.lms-group-proxy)`,
      ),
    ).toHaveLength(2);
    cleanup();
  });

  it('connects exactly p58-q6 and p58-q7 to coverage', () => {
    expect(freePointPredicateRuleForCoverage(58, 'p58-q6')).toBe(
      EQUAL_POSITIVE_COORDINATE_POINT,
    );
    expect(freePointPredicateRuleForCoverage(58, 'p58-q7')).toBe(
      EQUAL_POSITIVE_COORDINATE_POINT,
    );
    expect(freePointPredicateRuleForCoverage(58, 'p58-q5')).toBeNull();
    expect(freePointPredicateRuleForCoverage(58, 'p58-q8')).toBeNull();
  });
});
