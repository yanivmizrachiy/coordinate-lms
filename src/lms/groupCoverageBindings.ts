import type { DigitalGroupRule } from './digitalPredicates';

/**
 * Some runtime predicates grade several visible fields atomically from context
 * that lives at card level. The per-target coverage report cannot see that
 * surrounding context, so these reviewed bindings connect the stable canonical
 * target IDs to the exact runtime predicate that already grades the group.
 *
 * This file adds no answers and no alternate grading logic.
 */
export function canonicalGroupRuleForCoverage(
  pageNumber: number,
  targetId: string,
): DigitalGroupRule | null {
  if (pageNumber !== 54) return null;

  if (/^p54-q[1-4]$/.test(targetId)) {
    return 'rectangle-missing-opposite-corners';
  }

  if (/^p54-q(?:[7-9]|1[0-4])$/.test(targetId)) {
    return 'rectangle-from-corner-4x3';
  }

  return null;
}
