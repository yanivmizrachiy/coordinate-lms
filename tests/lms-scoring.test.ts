import { describe, expect, it } from 'vitest';
import { LMS_CONFIG } from '../src/lms/config';
import { calculatePageScore } from '../src/lms/scoring';

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

  it('returns zero when no credit was earned or no scored questions exist', () => {
    expect(calculatePageScore([{ attempts: 4, correct: false, locked: true }])).toBe(0);
    expect(calculatePageScore([])).toBe(0);
    expect(calculatePageScore([], false)).toBe(0);
  });
});