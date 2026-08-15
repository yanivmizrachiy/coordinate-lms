import { hydrateDigitalCanonicalAnswers } from './digitalCanonicalAnswers';
import { hydrateDigitalCoordinateSafePredicate } from './digitalCoordinateSafePredicate';
import { hydrateDigitalDeterministicAnswers } from './digitalDeterministicAnswers';
import { hydrateDigitalExplanationChoices } from './digitalExplanationChoices';
import { hydrateDigitalGeometryAnswers } from './digitalGeometryAnswers';
import { hydrateDigitalGraphAnswers } from './digitalGraphAnswers';
import { hydrateDigitalLifePredicates } from './digitalLifePredicates';
import { hydrateDigitalLinearFacts } from './digitalLinearFacts';
import { hydrateDigitalOneStepAnswers } from './digitalOneStepAnswers';
import { hydrateDigitalPredicates } from './digitalPredicates';
import { hydrateDigitalRectanglePredicates } from './digitalRectanglePredicates';
import { hydrateDigitalRuleAnswers } from './digitalRuleAnswers';
import { hydrateDigitalSegmentPredicates } from './digitalSegmentPredicates';
import { hydrateGridPointPickers } from './gridPointPicker';
import type { AnswerKey } from './types';

function parseAnswers(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function answerFromAria(target: HTMLElement): string[] {
  const aria = target.getAttribute('aria-label')?.trim() || '';
  const match = aria.match(/(?:מקום\s+)?להשלמת\s+(?:המילה|האות|המספר)\s+(.+)$/);
  return match?.[1]?.trim() ? [match[1].trim()] : [];
}

export function hydrateExplicitAuthoringAnswers(root: ParentNode): () => void {
  for (const target of root.querySelectorAll<HTMLElement>('.word-blank[aria-label]')) {
    if (target.dataset['lmsAnswers']) continue;
    const answers = answerFromAria(target);
    if (answers.length > 0) target.dataset['lmsAnswers'] = JSON.stringify(answers);
  }

  hydrateDigitalCanonicalAnswers(root);
  hydrateDigitalRuleAnswers(root);
  hydrateDigitalGeometryAnswers(root);
  hydrateDigitalGraphAnswers(root);
  hydrateDigitalDeterministicAnswers(root);
  hydrateDigitalLinearFacts(root);
  hydrateDigitalOneStepAnswers(root);
  const cleanupExplanations = hydrateDigitalExplanationChoices(root);
  const cleanupCoordinateSafe = hydrateDigitalCoordinateSafePredicate(root);
  const cleanupPredicates = hydrateDigitalPredicates(root);
  const cleanupSegments = hydrateDigitalSegmentPredicates(root);
  const cleanupRectangles = hydrateDigitalRectanglePredicates(root);
  const cleanupLife = hydrateDigitalLifePredicates(root);
  const cleanupPointPickers = hydrateGridPointPickers(root);

  return () => {
    cleanupPointPickers();
    cleanupLife();
    cleanupRectangles();
    cleanupSegments();
    cleanupPredicates();
    cleanupCoordinateSafe();
    cleanupExplanations();
  };
}

export function implicitAnswerKey(pageNumber: number): AnswerKey {
  if (typeof document === 'undefined') return {};
  const prefix = 'p' + String(pageNumber) + '-q';
  const key: AnswerKey = {};

  for (const target of document.querySelectorAll<HTMLElement>('[data-lms-qid]')) {
    const qid = target.dataset['lmsQid'];
    if (!qid || !qid.startsWith(prefix)) continue;
    const explicit = parseAnswers(target.dataset['lmsAnswers']);
    const inferred = explicit.length > 0 ? explicit : answerFromAria(target);
    if (inferred.length > 0) key[qid] = inferred;
  }

  return key;
}
