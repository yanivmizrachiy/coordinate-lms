import { describe, expect, it } from 'vitest';
import { remainingCreditFraction } from '../src/lms/scoring';

describe('remaining credit after attempts', () => {
  it('keeps full credit before a checked mistake', () => {
    expect(remainingCreditFraction({ attempts: 0, correct: false })).toBe(1);
  });

  it('leaves 75 percent after the first wrong attempt', () => {
    expect(remainingCreditFraction({ attempts: 1, correct: false })).toBe(0.75);
  });

  it('leaves 50 percent after the second wrong attempt', () => {
    expect(remainingCreditFraction({ attempts: 2, correct: false })).toBe(0.5);
  });

  it('leaves no credit after a third wrong locked attempt', () => {
    expect(remainingCreditFraction({ attempts: 3, correct: false, locked: true })).toBe(0);
  });

  it('preserves the earned credit when the learner corrects the answer', () => {
    expect(remainingCreditFraction({ attempts: 1, correct: true })).toBe(1);
    expect(remainingCreditFraction({ attempts: 2, correct: true })).toBe(0.75);
    expect(remainingCreditFraction({ attempts: 3, correct: true })).toBe(0.5);
  });
});
