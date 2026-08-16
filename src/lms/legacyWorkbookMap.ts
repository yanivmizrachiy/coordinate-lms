/*
 * The printable workbook was reordered and expanded from 77 to 78 pages.
 * Existing reviewed LMS answers are attached to the old page identity, not to
 * the current display number. Only pages whose authored exercise survived are
 * mapped. Rebuilt printable replacements deliberately have no legacy mapping,
 * so an old game answer can never be applied to a different printed question.
 */
const CURRENT_TO_LEGACY: Readonly<Record<number, number>> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8,
  9: 10, 10: 9, 11: 11, 12: 12, 13: 13, 14: 19,
  15: 14, 16: 15, 17: 20, 18: 21, 19: 22,
  21: 16, 22: 18, 23: 17,
  24: 25, 25: 26, 26: 27,
  28: 33, 29: 34,
  30: 35, 31: 36, 32: 37, 33: 38, 34: 39, 35: 40, 36: 41,
  39: 44, 40: 45, 41: 46,
  43: 48, 44: 49,
  46: 29, 47: 30, 48: 31,
  50: 69,
  51: 23, 52: 51, 53: 52, 54: 53, 55: 54, 56: 55, 57: 56, 58: 57,
  59: 58, 60: 59, 61: 60, 62: 61, 63: 62,
  65: 63, 66: 64, 67: 65, 68: 66, 69: 67, 70: 68,
  71: 70, 72: 71, 73: 72, 74: 73, 75: 74, 76: 75, 77: 76, 78: 77,
};

const LEGACY_TO_CURRENT = new Map<number, number>(
  Object.entries(CURRENT_TO_LEGACY).map(([current, legacy]) => [legacy, Number(current)]),
);

export function legacyPageNumberForCurrent(currentPage: number): number | undefined {
  return CURRENT_TO_LEGACY[currentPage];
}

export function currentPageNumberForLegacy(legacyPage: number): number | undefined {
  return LEGACY_TO_CURRENT.get(legacyPage);
}

export function legacyTargetIdForCurrent(targetId: string): string {
  const match = /^p(\d+)-q(\d+)$/.exec(targetId);
  if (!match) return targetId;
  const legacyPage = legacyPageNumberForCurrent(Number(match[1]));
  return legacyPage ? `p${legacyPage}-q${match[2]}` : targetId;
}

export function currentTargetIdForLegacy(targetId: string): string | undefined {
  const match = /^p(\d+)-q(\d+)$/.exec(targetId);
  if (!match) return undefined;
  const currentPage = currentPageNumberForLegacy(Number(match[1]));
  return currentPage ? `p${currentPage}-q${match[2]}` : undefined;
}
