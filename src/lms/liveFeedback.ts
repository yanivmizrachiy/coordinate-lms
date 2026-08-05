import { answersMatch } from './answerValidation';
import { LMS_CONFIG } from './config';
import type { QuestionProgress } from './types';

/**
 * Accepts a correct answer immediately while the learner is typing.
 *
 * Incorrect partial text is deliberately ignored here: it does not consume an
 * attempt and it is not painted red. A wrong attempt is still counted only by
 * the explicit "בדיקת תשובות" action. When the typed answer becomes correct,
 * that correction counts as the learner's next attempt and the field locks.
 */
export function acceptImmediateCorrectAnswer(
  progress: QuestionProgress,
  expected: string[],
): boolean {
  if (
    progress.correct ||
    progress.locked ||
    expected.length === 0 ||
    !progress.answer.trim() ||
    !answersMatch(progress.answer, expected)
  ) {
    return false;
  }

  progress.attempts = Math.min(
    LMS_CONFIG.maxAttempts,
    progress.attempts + 1,
  );
  progress.correct = true;
  return true;
}
