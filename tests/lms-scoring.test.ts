import { describe, expect, it } from 'vitest';
import { LMS_CONFIG } from '../src/lms/config';
import {
  calculatePageScore,
  equalQuestionTargetWeights,
} from '../src/lms/scoring';

describe('LMS page scoring', () => {
  it('keeps every scored page within the required 0–100 range', () => {
    expect(LMS_CONFIG.minScore).toBe(0);
    expect(LMS_CONFIG.maxScore).toBe(100);
    expect(LMS_CONFIG.maxAttempts).toBe(4);
    expect(calculatePageScore([{ attempts: 4, correct: false, locked: true }])).toBe(0);
    expect(calculatePageScore([{ attempts: 1, correct: true }])).toBe(100);
  });

  it('reduces credit after each checked mistake', () => {
    expect(calculatePageScore([{ attempts: 1, correct: true }])).toBe(100);
    expect(calculatePageScore([{ attempts: 2, correct: true }])).toBe(75);
    expect(calculatePageScore([{ attempts: 3, correct: true }])).toBe(50);
    expect(calculatePageScore([{ attempts: 4, correct: true }])).toBe(25);
  });

  it('supports weighted questions without leaving the score range', () => {
    const score = calculatePageScore([
      { attempts: 1, correct: true, weight: 2 },
      { attempts: 2, correct: true, weight: 1 },
      { attempts: 4, correct: false, locked: true, weight: 1 },
    ]);
    expect(score).toBe(69);
    expect(score).toBeGreaterThanOrEqual(LMS_CONFIG.minScore);
    expect(score).toBeLessThanOrEqual(LMS_CONFIG.maxScore);
  });

  it('splits 100 equally between real questions, not raw answer blanks', () => {
    const weights = equalQuestionTargetWeights([
      ['q1-a', 'q1-b', 'q1-c', 'q1-d'],
      ['q2-a'],
    ]);

    expect(weights.get('q1-a')).toBeCloseTo(0.25);
    expect(weights.get('q1-d')).toBeCloseTo(0.25);
    expect(weights.get('q2-a')).toBe(1);

    const score = calculatePageScore([
      { attempts: 1, correct: true, weight: weights.get('q1-a') },
      { attempts: 1, correct: true, weight: weights.get('q1-b') },
      { attempts: 1, correct: true, weight: weights.get('q1-c') },
      { attempts: 1, correct: true, weight: weights.get('q1-d') },
      { attempts: 4, correct: false, locked: true, weight: weights.get('q2-a') },
    ]);

    // Old blank-based scoring would give 80. Question-based scoring gives 50/100.
    expect(score).toBe(50);
  });

  it('keeps correction credit inside the question share of an eight-question page', () => {
    const groups = Array.from({ length: 8 }, (_, index) => [`q${index + 1}`]);
    const weights = equalQuestionTargetWeights(groups);
    const score = calculatePageScore([
      { attempts: 2, correct: true, weight: weights.get('q1') },
      ...groups.slice(1).map(([qid]) => ({
        attempts: 4,
        correct: false,
        locked: true,
        weight: weights.get(qid),
      })),
    ]);

    // 75% of one 12.5-point question = 9.375, rounded only at page total.
    expect(score).toBe(9);
  });

  it('returns zero when no credit was earned or no scored questions exist', () => {
    expect(calculatePageScore([{ attempts: 4, correct: false, locked: true }])).toBe(0);
    expect(calculatePageScore([])).toBe(0);
    expect(calculatePageScore([], false)).toBe(0);
    expect(calculatePageScore([{ attempts: 1, correct: true, weight: 0 }])).toBe(0);
  });
});
