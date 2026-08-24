import { describe, expect, it } from 'vitest';
import { remainingCreditFraction } from '../src/lms/scoring';

describe('remaining credit after attempts', () => {
  it('keeps full credit before a checked mistake', () => {
    expect(remainingCreditFraction({ attempts: 0, correct: false })).toBe(1);
  });

  it('leaves 75 percent after the first wrong attempt', () => {
    expect(remainingCreditFraction({ attempts: 1, correct: false })).toBe(0.75);
  });

  it('leaves 50 percent after correction 1 is also wrong', () => {
    expect(remainingCreditFraction({ attempts: 2, correct: false })).toBe(0.5);
  });

  it('leaves 25 percent after correction 2 is also wrong', () => {
    expect(remainingCreditFraction({ attempts: 3, correct: false })).toBe(0.25);
  });

  it('leaves no credit after correction 3 is wrong and locks', () => {
    expect(remainingCreditFraction({ attempts: 4, correct: false, locked: true })).toBe(0);
  });

  it('preserves the earned credit when the learner corrects the answer', () => {
    expect(remainingCreditFraction({ attempts: 1, correct: true })).toBe(1);
    expect(remainingCreditFraction({ attempts: 2, correct: true })).toBe(0.75);
    expect(remainingCreditFraction({ attempts: 3, correct: true })).toBe(0.5);
    expect(remainingCreditFraction({ attempts: 4, correct: true })).toBe(0.25);
  });
});
