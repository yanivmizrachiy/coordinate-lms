import { describe, it, expect } from 'vitest';
import {
  point, eqPoint, isFirstQuadrant, isOrigin, onXAxis, onYAxis, sameX, sameY,
  move, applyPath, pathStops, segmentParallelToAxis, axisAlignedLength,
  missingRectCorner, rectFromCorners, rectPerimeter, rectArea, parseHebrewMove,
} from '../src/lib/coordinateMath';

describe('ordered pairs & quadrant', () => {
  it('x is first, y is second', () => {
    const p = point(4, 3);
    expect(p.x).toBe(4);
    expect(p.y).toBe(3);
  });
  it('first quadrant includes the axes (x>=0, y>=0)', () => {
    expect(isFirstQuadrant(point(0, 0))).toBe(true);
    expect(isFirstQuadrant(point(5, 0))).toBe(true);
    expect(isFirstQuadrant(point(-1, 2))).toBe(false);
    expect(isFirstQuadrant(point(2, -1))).toBe(false);
  });
  it('axis membership', () => {
    expect(onXAxis(point(5, 0))).toBe(true);
    expect(onXAxis(point(5, 1))).toBe(false);
    expect(onYAxis(point(0, 4))).toBe(true);
    expect(onYAxis(point(2, 4))).toBe(false);
    expect(isOrigin(point(0, 0))).toBe(true);
  });
});

describe('same line', () => {
  it('same x → same vertical line; same y → same horizontal line', () => {
    expect(sameX(point(3, 1), point(3, 9))).toBe(true);
    expect(sameY(point(1, 5), point(8, 5))).toBe(true);
    expect(sameX(point(3, 1), point(4, 1))).toBe(false);
  });
});

describe('movement', () => {
  it('right increases x, left decreases x', () => {
    expect(move(point(2, 2), 'right', 3)).toEqual(point(5, 2));
    expect(move(point(5, 2), 'left', 2)).toEqual(point(3, 2));
  });
  it('up increases y, down decreases y', () => {
    expect(move(point(2, 2), 'up', 3)).toEqual(point(2, 5));
    expect(move(point(2, 5), 'down', 4)).toEqual(point(2, 1));
  });
  it('applyPath reaches the intended destination', () => {
    const dest = applyPath(point(2, 1), [
      { dir: 'right', steps: 4 }, { dir: 'up', steps: 3 },
    ]);
    expect(dest).toEqual(point(6, 4));
  });
  it('pathStops records every intermediate stop', () => {
    const stops = pathStops(point(0, 0), [{ dir: 'right', steps: 2 }, { dir: 'up', steps: 1 }]);
    expect(stops).toEqual([point(0, 0), point(2, 0), point(2, 1)]);
  });
  it('parses Hebrew move phrases', () => {
    expect(parseHebrewMove('3 ימינה')).toEqual({ dir: 'right', steps: 3 });
    expect(parseHebrewMove('4 למעלה')).toEqual({ dir: 'up', steps: 4 });
    expect(parseHebrewMove('שמאלה 2')).toEqual({ dir: 'left', steps: 2 });
  });
});

describe('segments, rectangles, area & perimeter', () => {
  it('parallel-to-axis detection', () => {
    expect(segmentParallelToAxis(point(2, 1), point(6, 1))).toBe('x');
    expect(segmentParallelToAxis(point(4, 1), point(4, 5))).toBe('y');
    expect(segmentParallelToAxis(point(1, 1), point(3, 4))).toBeNull();
  });
  it('axis-aligned length', () => {
    expect(axisAlignedLength(point(2, 1), point(6, 1))).toBe(4);
    expect(axisAlignedLength(point(4, 1), point(4, 5))).toBe(4);
    expect(axisAlignedLength(point(1, 1), point(3, 4))).toBeUndefined();
  });
  it('missing rectangle corner', () => {
    expect(missingRectCorner(point(2, 2), point(7, 2), point(7, 5))).toEqual(point(2, 5));
    expect(missingRectCorner(point(1, 1), point(6, 1), point(6, 4))).toEqual(point(1, 4));
  });
  it('perimeter & area of an axis-aligned rectangle', () => {
    const r = rectFromCorners(point(2, 1), point(7, 5));
    expect(rectPerimeter(r)).toBe(2 * (5 + 4));
    expect(rectArea(r)).toBe(5 * 4);
  });
  it('eqPoint', () => {
    expect(eqPoint(point(1, 2), point(1, 2))).toBe(true);
    expect(eqPoint(point(1, 2), point(2, 1))).toBe(false);
  });
});
