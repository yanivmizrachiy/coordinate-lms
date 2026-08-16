import { answersMatch } from './answerValidation';
import { LMS_CONFIG } from './config';
import type { QuestionProgress } from './types';

let explicitCheckArmed = false;

/** Arm exactly one learner response for an explicit inline check. */
export function armExplicitAnswerCheck(): void {
  explicitCheckArmed = true;
}

/**
 * Handles one explicitly requested answer check.
 *
 * Typing alone never grades and never consumes an attempt. The small inline
 * check control arms this function, then the existing input pipeline performs
 * the check so scoring, locking and persistence continue to use one engine.
 * Returning true means the explicit check was handled, whether correct or
 * incorrect; the caller then renders state from QuestionProgress.
 */
export function acceptImmediateCorrectAnswer(
  progress: QuestionProgress,
  expected: string[],
): boolean {
  if (!explicitCheckArmed) return false;
  explicitCheckArmed = false;

  if (progress.correct || progress.locked) return true;
  if (expected.length === 0 || !progress.answer.trim()) return false;

  progress.attempts = Math.min(
    LMS_CONFIG.maxAttempts,
    progress.attempts + 1,
  );

  if (answersMatch(progress.answer, expected)) {
    progress.correct = true;
  } else if (progress.attempts >= LMS_CONFIG.maxAttempts) {
    progress.locked = true;
  }

  return true;
}
