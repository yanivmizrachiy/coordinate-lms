/* ===========================================================================
   coordinateMath — pure, dependency-free helpers for the first quadrant.
   Every invariant the workbook and games rely on lives here and is unit-tested,
   so pages and puzzles can be validated automatically (see tests/).
   Conventions (locked by the pedagogy):
     • An ordered pair is (x, y): x first, y second.
     • x axis is horizontal, y axis is vertical.
     • First quadrant only: x >= 0 and y >= 0.
     • Movement: right +x, left -x, up +y, down -y  (ימינה/שמאלה/למעלה/למטה).
   =========================================================================== */

export interface Point {
  x: number;
  y: number;
}

/** Movement directions, keyed by their Hebrew verb-of-motion. */
export type Direction = 'right' | 'left' | 'up' | 'down';

export const HEBREW_DIRECTION: Record<string, Direction> = {
  'ימינה': 'right',
  'שמאלה': 'left',
  'למעלה': 'up',
  'למטה': 'down',
};

export interface Move {
  dir: Direction;
  steps: number;
}

export const point = (x: number, y: number): Point => ({ x, y });

export const eqPoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

/** A point belongs to the first quadrant (axes included) when both coords ≥ 0. */
export const isFirstQuadrant = (p: Point): boolean => p.x >= 0 && p.y >= 0;

export const isOrigin = (p: Point): boolean => p.x === 0 && p.y === 0;

/** On the x axis ⇔ y = 0. */
export const onXAxis = (p: Point): boolean => p.y === 0;

/** On the y axis ⇔ x = 0. */
export const onYAxis = (p: Point): boolean => p.x === 0;

export const sameX = (a: Point, b: Point): boolean => a.x === b.x;
export const sameY = (a: Point, b: Point): boolean => a.y === b.y;

/** Apply a single movement. Right/left change x; up/down change y. */
export function move(p: Point, dir: Direction, steps = 1): Point {
  switch (dir) {
    case 'right': return { x: p.x + steps, y: p.y };
    case 'left': return { x: p.x - steps, y: p.y };
    case 'up': return { x: p.x, y: p.y + steps };
    case 'down': return { x: p.x, y: p.y - steps };
  }
}

/** Final point after a sequence of moves. */
export function applyPath(start: Point, moves: readonly Move[]): Point {
  return moves.reduce((p, m) => move(p, m.dir, m.steps), start);
}

/** Every stop along a path, including the start and the final point. */
export function pathStops(start: Point, moves: readonly Move[]): Point[] {
  const stops: Point[] = [start];
  let current = start;
  for (const m of moves) {
    current = move(current, m.dir, m.steps);
    stops.push(current);
  }
  return stops;
}

/**
 * Which axis a segment is parallel to.
 *  • same y for both endpoints → parallel to the x axis (horizontal)
 *  • same x for both endpoints → parallel to the y axis (vertical)
 * Returns null for a diagonal or a zero-length segment.
 */
export function segmentParallelToAxis(a: Point, b: Point): 'x' | 'y' | null {
  if (eqPoint(a, b)) return null;
  if (a.y === b.y) return 'x';
  if (a.x === b.x) return 'y';
  return null;
}

/** Length of an axis-parallel segment (undefined for diagonals). */
export function axisAlignedLength(a: Point, b: Point): number | undefined {
  if (a.y === b.y) return Math.abs(a.x - b.x);
  if (a.x === b.x) return Math.abs(a.y - b.y);
  return undefined;
}

/** The fourth corner of an axis-aligned rectangle given three corners. */
export function missingRectCorner(a: Point, b: Point, c: Point): Point {
  // For an axis-aligned rectangle the missing corner's x is the coordinate that
  // appears exactly once among the three known x's; same for y.
  const xs = [a.x, b.x, c.x];
  const ys = [a.y, b.y, c.y];
  const oddOne = (vals: number[]): number => {
    const counts = new Map<number, number>();
    for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
    for (const [v, n] of counts) if (n === 1) return v;
    return vals[0] as number;
  };
  return { x: oddOne(xs), y: oddOne(ys) };
}

export interface Rect { x0: number; y0: number; x1: number; y1: number; }

/** Normalised axis-aligned rectangle from any two opposite corners. */
export function rectFromCorners(a: Point, b: Point): Rect {
  return {
    x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y),
    x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y),
  };
}
export const rectWidth = (r: Rect): number => r.x1 - r.x0;
export const rectHeight = (r: Rect): number => r.y1 - r.y0;
export const rectPerimeter = (r: Rect): number => 2 * (rectWidth(r) + rectHeight(r));
export const rectArea = (r: Rect): number => rectWidth(r) * rectHeight(r);

/** Parse a Hebrew move phrase like "3 ימינה" / "4 למעלה" into a Move. */
export function parseHebrewMove(phrase: string): Move | null {
  const m = phrase.trim().match(/(\d+)\s*(ימינה|שמאלה|למעלה|למטה)|(ימינה|שמאלה|למעלה|למטה)\s*(\d+)/);
  if (!m) return null;
  const steps = Number(m[1] ?? m[4]);
  const word = (m[2] ?? m[3]) as string;
  const dir = HEBREW_DIRECTION[word];
  if (!dir || !Number.isFinite(steps)) return null;
  return { dir, steps };
}
