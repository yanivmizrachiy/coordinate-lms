import { describe, expect, it } from 'vitest';
import { acceptImmediateCorrectAnswer } from '../src/lms/liveFeedback';
import type { QuestionProgress } from '../src/lms/types';

function progress(answer: string, attempts = 0): QuestionProgress {
  return {
    answer,
    attempts,
    correct: false,
    locked: false,
  };
}

describe('positive-only immediate LMS feedback', () => {
  it('does not consume an attempt for an incorrect partial answer', () => {
    const item = progress('רא');

    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(false);
    expect(item.attempts).toBe(0);
    expect(item.correct).toBe(false);
  });

  it('marks a first correct answer immediately and records one attempt', () => {
    const item = progress('ראשית');

    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(true);
    expect(item.attempts).toBe(1);
    expect(item.correct).toBe(true);
  });

  it('uses the next attempt after an earlier checked mistake', () => {
    const item = progress('ציר x', 1);

    expect(
      acceptImmediateCorrectAnswer(item, ['x', 'ציר x']),
    ).toBe(true);
    expect(item.attempts).toBe(2);
    expect(item.correct).toBe(true);
  });

  it('does not change a locked answer', () => {
    const item = progress('ראשית', 3);
    item.locked = true;

    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(false);
    expect(item.attempts).toBe(3);
    expect(item.correct).toBe(false);
  });
});
