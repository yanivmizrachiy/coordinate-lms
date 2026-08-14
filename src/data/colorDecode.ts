import { isFirstQuadrant, type Point } from '../lib/coordinateMath';

/** Canonical data used by the computerized counterpart of the printable
 * "פענוח צבעוני" page. The printable repository remains read-only; this LMS
 * copy exists so the computerized interaction can preserve the same content
 * and validate it objectively.
 */
export const decodeXMax = 6;
export const decodeYMax = 5;

export const decodeTargets: Point[] = [
  { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
  { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  { x: 3, y: 5 },
];

const keyOf = (p: Point): string => `${p.x},${p.y}`;

export function decodeSolved(colored: Iterable<string>): boolean {
  const set = new Set(colored);
  const targetKeys = decodeTargets.map(keyOf);
  return set.size === targetKeys.length && targetKeys.every((k) => set.has(k));
}

export function targetsAreFirstQuadrant(): boolean {
  return decodeTargets.every(isFirstQuadrant);
}
