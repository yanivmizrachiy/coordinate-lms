import { LMS_CONFIG } from './config';

export interface QuestionAttempt {
  attempts: number;
  correct: boolean;
  locked?: boolean;
  weight?: number;
}

export function earnedCreditFraction(item: QuestionAttempt): number {
  if (!item.correct) return 0;
  if (item.attempts <= 1) return 1;
  if (item.attempts === 2) return 0.75;
  if (item.attempts === 3) return 0.5;
  return 0.25;
}

/**
 * Maximum credit that can still be earned after checked mistakes.
 * The learner gets one first checked attempt plus three correction
 * opportunities: 100% -> 75% -> 50% -> 25%. A fourth wrong check exhausts
 * the third correction and locks the unresolved target at 0.
 */
export function remainingCreditFraction(item: QuestionAttempt): number {
  if (item.correct) return earnedCreditFraction(item);
  if (item.locked || item.attempts >= LMS_CONFIG.maxAttempts) return 0;
  if (item.attempts <= 0) return 1;
  if (item.attempts === 1) return 0.75;
  if (item.attempts === 2) return 0.5;
  return 0.25;
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
