import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  DESCRIBED_SQUARE_OTHER_VERTICES,
  describedSquareOtherVerticesMatch,
  hydrateDigitalSquareVertexPredicate,
  squareVertexPredicateRuleForCoverage,
} from '../src/lms/digitalSquareVertexPredicate';

function canonicalPage57Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 57);
  expect(page).toBeDefined();
  const { document, window } = parseHTML(`<div id="root">${page!.html}</div>`);
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

describe('described square vertex predicate', () => {
  it('accepts the three remaining vertices in any order', () => {
    expect(
      describedSquareOtherVerticesMatch(['(4,2)', '(4,5)', '(1,5)']),
    ).toBe(true);
    expect(
      describedSquareOtherVerticesMatch(['1,5', '4,2', '4,5']),
    ).toBe(true);
    expect(
      answersMatch(
        '(1,5)|(4,5)|(4,2)',
        [`predicate:${DESCRIBED_SQUARE_OTHER_VERTICES}`],
      ),
    ).toBe(true);
  });

  it('rejects duplicates, a wrong vertex, and malformed coordinates', () => {
    expect(
      describedSquareOtherVerticesMatch(['(4,2)', '(4,2)', '(1,5)']),
    ).toBe(false);
    expect(
      describedSquareOtherVerticesMatch(['(4,2)', '(4,5)', '(2,5)']),
    ).toBe(false);
    expect(
      describedSquareOtherVerticesMatch(['A', '(4,5)', '(1,5)']),
    ).toBe(false);
  });

  it('binds exactly the three described-square text blanks to one proxy', () => {
    const root = canonicalPage57Root();
    const cleanup = hydrateDigitalSquareVertexPredicate(root);
    const group = `${DESCRIBED_SQUARE_OTHER_VERTICES}-page57`;
    expect(
      root.querySelectorAll(
        `.lms-group-proxy[data-lms-group="${group}"]`,
      ),
    ).toHaveLength(1);
    expect(
      root.querySelectorAll(
        `[data-lms-group="${group}"]:not(.lms-group-proxy)`,
      ),
    ).toHaveLength(3);
    cleanup();
  });

  it('connects exactly p57-q7 through p57-q9 to coverage', () => {
    for (let q = 7; q <= 9; q += 1) {
      expect(squareVertexPredicateRuleForCoverage(57, `p57-q${q}`)).toBe(
        DESCRIBED_SQUARE_OTHER_VERTICES,
      );
    }
    expect(squareVertexPredicateRuleForCoverage(57, 'p57-q6')).toBeNull();
    expect(squareVertexPredicateRuleForCoverage(57, 'p57-q10')).toBeNull();
  });
});
