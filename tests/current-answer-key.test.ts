import { describe, expect, it } from 'vitest';
import { canonicalAnswerKeyForCurrentPage } from '../src/lms/currentAnswerKey';
import {
  currentTargetIdForLegacy,
  legacyPageNumberForCurrent,
} from '../src/lms/legacyWorkbookMap';
import { provenAnswerKey } from '../src/lms/provenAnswerKey';

describe('current runtime answer-key mapping', () => {
  it('maps current page 62 to legacy page 61 instead of applying legacy page 62 directly', () => {
    expect(legacyPageNumberForCurrent(62)).toBe(61);

    const current = canonicalAnswerKeyForCurrentPage(62);
    const legacyDelivery = provenAnswerKey(61);
    const currentQ1 = currentTargetIdForLegacy('p61-q1');

    expect(currentQ1).toBe('p62-q1');
    expect(current[currentQ1!]).toEqual(legacyDelivery['p61-q1']);

    // Legacy page 62 is a different worksheet (park map) and has q16=4.
    // That old qid must never leak onto current delivery page 62, where the
    // digital group proxy becomes q16 at runtime.
    expect(provenAnswerKey(62)['p62-q16']).toEqual(['4']);
    expect(current['p62-q16']).toBeUndefined();
  });

  it('keeps unchanged pages mapped to their own current qids', () => {
    const current = canonicalAnswerKeyForCurrentPage(10);
    expect(Object.keys(current).every((qid) => qid.startsWith('p10-q'))).toBe(true);
  });
});
