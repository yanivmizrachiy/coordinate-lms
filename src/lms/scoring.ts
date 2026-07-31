import { LMS_CONFIG } from './config';

export interface QuestionAttempt {
  attempts: number;
  correct: boolean;
  locked?: boolean;
  weight?: number;
}

function questionCredit(item: QuestionAttempt): number {
  if (!item.correct) return 0;
  if (item.attempts <= 1) return 1;
  if (item.attempts === 2) return 0.75;
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
      sum + questionCredit(item) * (item.weight ?? 1),
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
