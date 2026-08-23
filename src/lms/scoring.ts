import { LMS_CONFIG } from './config';

export interface QuestionAttempt {
  attempts: number;
  correct: boolean;
  locked?: boolean;
  weight?: number;
}

/**
 * Credit for a target when it becomes correct on checked attempt N.
 * This is the single code owner of the 100% -> 75% -> 50% -> 25% curve.
 */
const CREDIT_BY_ATTEMPT = [1, 0.75, 0.5, 0.25] as const;

function creditForAttempt(attempts: number): number {
  const index = Math.max(0, Math.min(CREDIT_BY_ATTEMPT.length - 1, attempts - 1));
  return CREDIT_BY_ATTEMPT[index] ?? 0;
}

export function earnedCreditFraction(item: QuestionAttempt): number {
  if (!item.correct) return 0;
  return creditForAttempt(Math.max(1, item.attempts));
}

/**
 * Maximum credit that can still be earned after checked mistakes.
 * The learner gets one first checked attempt plus three correction
 * opportunities. A fourth wrong check exhausts the third correction and locks
 * the unresolved target at 0.
 */
export function remainingCreditFraction(item: QuestionAttempt): number {
  if (item.correct) return earnedCreditFraction(item);
  if (item.locked || item.attempts >= LMS_CONFIG.maxAttempts) return 0;
  return creditForAttempt(item.attempts + 1);
}

export function calculatePageScore(
  items: QuestionAttempt[],
  submitted = true,
): number {
  if (!submitted || items.length === 0) return 0;

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight ?? 1),
    0,
  );

  const earnedWeight = items.reduce(
    (sum, item) =>
      sum + earnedCreditFraction(item) * (item.weight ?? 1),
    0,
  );

  const rawScore = Math.round(
    (earnedWeight / totalWeight) * LMS_CONFIG.maxScore,
  );

  return Math.max(
    LMS_CONFIG.minScore,
    Math.min(LMS_CONFIG.maxScore, rawScore),
  );
}
