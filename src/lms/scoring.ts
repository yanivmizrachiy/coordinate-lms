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
  return 0.5;
}

/**
 * Maximum credit that can still be earned after the attempts already used.
 * A wrong first check leaves 75%, a wrong second check leaves 50%, and a
 * third wrong check locks the answer at 0. A correct answer keeps the credit
 * it earned on the attempt where it became correct.
 */
export function remainingCreditFraction(item: QuestionAttempt): number {
  if (item.correct) return earnedCreditFraction(item);
  if (item.locked || item.attempts >= 3) return 0;
  if (item.attempts <= 0) return 1;
  if (item.attempts === 1) return 0.75;
  return 0.5;
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
