import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  SUSPECT_X_FIVE_LABEL_PAIR,
  hydrateDigitalSuspectPredicate,
  suspectPredicateRuleForCoverage,
  suspectXFiveLabelPairMatches,
} from '../src/lms/digitalSuspectPredicate';

function canonicalPage45Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 45);
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

describe('page 45 suspect clue predicate', () => {
  it('accepts exactly B and C in either order', () => {
    expect(suspectXFiveLabelPairMatches(['B', 'C'])).toBe(true);
    expect(suspectXFiveLabelPairMatches(['c', 'b'])).toBe(true);
    expect(
      answersMatch('C|B', [`predicate:${SUSPECT_X_FIVE_LABEL_PAIR}`]),
    ).toBe(true);
  });

  it('rejects duplicates and labels that do not satisfy x=5', () => {
    expect(suspectXFiveLabelPairMatches(['B', 'B'])).toBe(false);
    expect(suspectXFiveLabelPairMatches(['A', 'B'])).toBe(false);
    expect(suspectXFiveLabelPairMatches(['C', 'F'])).toBe(false);
    expect(suspectXFiveLabelPairMatches(['B'])).toBe(false);
  });

  it('binds only the two first-clue letter blanks to one proxy', () => {
    const root = canonicalPage45Root();
    const cleanup = hydrateDigitalSuspectPredicate(root);
    const group = `${SUSPECT_X_FIVE_LABEL_PAIR}-page45`;
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

  it('connects exactly p45-q2 and p45-q3 to coverage', () => {
    expect(suspectPredicateRuleForCoverage(45, 'p45-q2')).toBe(
      SUSPECT_X_FIVE_LABEL_PAIR,
    );
    expect(suspectPredicateRuleForCoverage(45, 'p45-q3')).toBe(
      SUSPECT_X_FIVE_LABEL_PAIR,
    );
    expect(suspectPredicateRuleForCoverage(45, 'p45-q1')).toBeNull();
    expect(suspectPredicateRuleForCoverage(45, 'p45-q4')).toBeNull();
  });
});
