import type { PageDraft, QuestionProgress } from './types';

function cloneProgress(progress: QuestionProgress): QuestionProgress {
  return { ...progress };
}

/**
 * Clear only answers the learner is still allowed to edit in the current run.
 * Checked-attempt history, correct work and locked work are deliberately kept.
 */
export function clearEditableAnswers(draft: PageDraft, now = Date.now()): PageDraft {
  const questions: Record<string, QuestionProgress> = {};

  for (const [qid, progress] of Object.entries(draft.questions)) {
    const next = cloneProgress(progress);
    if (!next.correct && !next.locked) next.answer = '';
    questions[qid] = next;
  }

  return {
    ...draft,
    questions,
    updatedAt: Math.max(now, draft.updatedAt),
  };
}

/**
 * Start a genuinely new run after final submission. The previous PageResult is
 * intentionally not part of PageDraft and therefore remains untouched.
 */
export function freshPageRun(draft: PageDraft, now = Date.now()): PageDraft {
  const startedAt = Math.max(now, draft.updatedAt + 1);

  return {
    uid: draft.uid,
    pageNumber: draft.pageNumber,
    startedAt,
    updatedAt: startedAt,
    activeSeconds: 0,
    questions: {},
    submitted: false,
    ...(draft.guestSessionId ? { guestSessionId: draft.guestSessionId } : {}),
    maxAttemptCount: 0,
  };
}
