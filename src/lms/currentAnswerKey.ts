import { DEFAULT_ANSWER_KEYS } from './answerKey';
import {
  currentTargetIdForLegacy,
  legacyPageNumberForCurrent,
} from './legacyWorkbookMap';
import { provenAnswerKey } from './provenAnswerKey';
import type { AnswerKey } from './types';

function mapSourceToCurrent(
  source: AnswerKey,
  currentPageNumber: number,
  lookupPageNumber: number,
): AnswerKey {
  const mapped: AnswerKey = {};

  for (const [sourceTargetId, answers] of Object.entries(source)) {
    const migratedTargetId = currentTargetIdForLegacy(sourceTargetId);
    const currentTargetId = migratedTargetId ||
      (lookupPageNumber === currentPageNumber ? sourceTargetId : null);

    if (!currentTargetId?.startsWith(`p${currentPageNumber}-q`)) continue;
    mapped[currentTargetId] = answers;
  }

  return mapped;
}

/**
 * Runtime equivalent of the mapping already used by answerCoverage.ts.
 * Reviewed proofs and the old built-in key are keyed by the legacy workbook;
 * the LMS must never apply a legacy page's qids directly to a shifted current
 * page. Digital-only metadata is merged later and intentionally has precedence.
 */
export function canonicalAnswerKeyForCurrentPage(
  currentPageNumber: number,
): AnswerKey {
  const legacyPageNumber = legacyPageNumberForCurrent(currentPageNumber);
  const lookupPageNumber = legacyPageNumber ?? currentPageNumber;
  const proven = mapSourceToCurrent(
    provenAnswerKey(lookupPageNumber),
    currentPageNumber,
    lookupPageNumber,
  );
  const defaults = mapSourceToCurrent(
    DEFAULT_ANSWER_KEYS[lookupPageNumber] || {},
    currentPageNumber,
    lookupPageNumber,
  );

  // Preserve historical precedence: reviewed built-in defaults override a
  // proof if both intentionally exist for the same canonical target.
  return {
    ...proven,
    ...defaults,
  };
}
