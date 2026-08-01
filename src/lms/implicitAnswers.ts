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
 * Reads answers that the canonical worksheet already states explicitly:
 * - data-lms-answers added by interactive grid/choice hydrators
 * - authoring aria labels such as "מקום להשלמת המילה אופקי"
 *
 * It deliberately does not guess from surrounding prose. Ambiguous or open
 * questions still require a reviewed teacher answer key.
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
