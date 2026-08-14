import { hydrateDigitalPredicates } from './digitalPredicates';
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
  const match = aria.match(
    /(?:מקום\s+)?להשלמת\s+(?:המילה|האות|המספר)\s+(.+)$/,
  );

  return match?.[1]?.trim()
    ? [match[1].trim()]
    : [];
}

/**
 * Captures explicit authoring answers before the generic LMS engine replaces
 * descriptive aria-labels with sequential accessible labels such as
 * "תשובה 1". Digital-only mathematical predicates are hydrated here as well,
 * in one pre-engine preparation point; the canonical printable markup remains
 * untouched.
 */
export function hydrateExplicitAuthoringAnswers(
  root: ParentNode,
): void {
  for (const target of root.querySelectorAll<HTMLElement>(
    '.word-blank[aria-label]',
  )) {
    if (target.dataset['lmsAnswers']) continue;

    const answers = answerFromAria(target);

    if (answers.length > 0) {
      target.dataset['lmsAnswers'] = JSON.stringify(answers);
    }
  }

  hydrateDigitalPredicates(root);
}

/**
 * Reads answers that the canonical worksheet already states explicitly or that
 * the reviewed digital-only layer encodes as a deterministic mathematical
 * predicate. It never guesses from surrounding prose.
 */
export function implicitAnswerKey(
  pageNumber: number,
): AnswerKey {
  if (typeof document === 'undefined') return {};

  const prefix = 'p' + String(pageNumber) + '-q';
  const key: AnswerKey = {};

  for (const target of document.querySelectorAll<HTMLElement>(
    '[data-lms-qid]',
  )) {
    const qid = target.dataset['lmsQid'];

    if (!qid || !qid.startsWith(prefix)) continue;

    const explicit = parseAnswers(
      target.dataset['lmsAnswers'],
    );
    const inferred = explicit.length > 0
      ? explicit
      : answerFromAria(target);

    if (inferred.length > 0) {
      key[qid] = inferred;
    }
  }

  return key;
}
