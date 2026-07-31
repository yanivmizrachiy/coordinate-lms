import { describe, it, expect } from 'vitest';
import {
  backCoverPos, bookShift, clampPos, colophonPos, lastOpenSpread, pageAtPos,
  pagesAtSpread, posOfSpread, spreadOfPos, visiblePagesAtSpread,
} from '../src/lib/spreads';

/* The spread model is the flipbook's arithmetic: which page sits on which half,
   in a HEBREW book — evens on the right, odds on the left, the leaf turning to
   the right. It came from the zaviyot project with its tests' intent; these are
   ours against our totals (79 = cover + contents + 77 pages). */

const TOTAL = 79;

describe('the flipbook spread model', () => {
  it('closed front shows page 1 alone on the left half', () => {
    expect(pagesAtSpread(0, TOTAL)).toEqual({ right: { kind: 'none' }, left: { kind: 'page', page: 1 } });
    expect(bookShift(0, TOTAL)).toBe(0.5);
  });

  it('an open spread seats the even page on the right and the odd on the left', () => {
    expect(pagesAtSpread(1, TOTAL)).toEqual({ right: { kind: 'page', page: 2 }, left: { kind: 'page', page: 3 } });
    expect(pagesAtSpread(10, TOTAL)).toEqual({ right: { kind: 'page', page: 20 }, left: { kind: 'page', page: 21 } });
  });

  it('the last open spread closes an odd book with a blank verso and the colophon', () => {
    const last = lastOpenSpread(TOTAL);
    expect(pagesAtSpread(last, TOTAL)).toEqual({ right: { kind: 'blank' }, left: { kind: 'back-inner' } });
    // …and the final pages still sit together on the spread before it.
    expect(pagesAtSpread(last - 1, TOTAL)).toEqual({ right: { kind: 'page', page: 78 }, left: { kind: 'page', page: 79 } });
  });

  it('past the colophon there is only the closed back cover', () => {
    const last = lastOpenSpread(TOTAL) + 1;
    expect(pagesAtSpread(last, TOTAL)).toEqual({ right: { kind: 'back-cover' }, left: { kind: 'none' } });
    expect(bookShift(last, TOTAL)).toBe(-0.5);
  });

  it('pos and spread agree in both directions for every position', () => {
    for (let pos = 1; pos <= backCoverPos(TOTAL); pos++) {
      const s = spreadOfPos(pos, TOTAL);
      const back = posOfSpread(s, TOTAL);
      // The representative pos of a spread must map back to the same spread.
      expect(spreadOfPos(back, TOTAL)).toBe(s);
    }
  });

  it('single-page mode walks cover → pages → colophon → back cover', () => {
    expect(pageAtPos(1, TOTAL)).toEqual({ kind: 'page', page: 1 });
    expect(pageAtPos(TOTAL, TOTAL)).toEqual({ kind: 'page', page: TOTAL });
    expect(pageAtPos(colophonPos(TOTAL), TOTAL)).toEqual({ kind: 'back-inner' });
    expect(pageAtPos(backCoverPos(TOTAL), TOTAL)).toEqual({ kind: 'back-cover' });
  });

  it('clampPos never leaves the book', () => {
    expect(clampPos(-5, TOTAL)).toBe(1);
    expect(clampPos(999, TOTAL)).toBe(backCoverPos(TOTAL));
  });

  it('an odd total gets a blank verso before the colophon, like real print', () => {
    const odd = 77;
    const last = lastOpenSpread(odd);
    expect(pagesAtSpread(last, odd)).toEqual({ right: { kind: 'blank' }, left: { kind: 'back-inner' } });
    // …and the spread before it still shows real pages.
    expect(pagesAtSpread(last - 1, odd).right).toEqual({ kind: 'page', page: 2 * (last - 1) });
  });

  it('visible page numbers come sorted and only for real pages', () => {
    expect(visiblePagesAtSpread(0, TOTAL)).toEqual([1]);
    expect(visiblePagesAtSpread(3, TOTAL)).toEqual([6, 7]);
    expect(visiblePagesAtSpread(lastOpenSpread(TOTAL) + 1, TOTAL)).toEqual([]);
  });
});
