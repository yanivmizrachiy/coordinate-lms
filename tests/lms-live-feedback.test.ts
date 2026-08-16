import { describe, expect, it } from 'vitest';
import {
  acceptImmediateCorrectAnswer,
  armExplicitAnswerCheck,
} from '../src/lms/liveFeedback';
import type { QuestionProgress } from '../src/lms/types';

function progress(answer: string, attempts = 0): QuestionProgress {
  return {
    answer,
    attempts,
    correct: false,
    locked: false,
  };
}

describe('explicit per-answer LMS feedback', () => {
  it('does not consume an attempt or reveal correctness while typing', () => {
    const item = progress('ראשית');

    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(false);
    expect(item.attempts).toBe(0);
    expect(item.correct).toBe(false);
    expect(item.locked).toBe(false);
  });

  it('marks a correct answer only after the nearby check control is requested', () => {
    const item = progress('ראשית');

    armExplicitAnswerCheck();
    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(true);
    expect(item.attempts).toBe(1);
    expect(item.correct).toBe(true);
    expect(item.locked).toBe(false);
  });

  it('uses the next attempt after an earlier explicit wrong check', () => {
    const item = progress('לא נכון', 1);
    item.answer = 'ציר x';

    armExplicitAnswerCheck();
    expect(
      acceptImmediateCorrectAnswer(item, ['x', 'ציר x']),
    ).toBe(true);
    expect(item.attempts).toBe(2);
    expect(item.correct).toBe(true);
    expect(item.locked).toBe(false);
  });

  it('counts explicit wrong checks and locks only on the third wrong attempt', () => {
    const item = progress('4');

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      armExplicitAnswerCheck();
      expect(
        acceptImmediateCorrectAnswer(item, ['5']),
      ).toBe(true);
      expect(item.attempts).toBe(attempt);
      expect(item.correct).toBe(false);
      expect(item.locked).toBe(attempt === 3);
    }
  });

  it('does not mutate a locked answer even if a stale check request arrives', () => {
    const item = progress('ראשית', 3);
    item.locked = true;

    armExplicitAnswerCheck();
    expect(
      acceptImmediateCorrectAnswer(item, ['ראשית']),
    ).toBe(true);
    expect(item.attempts).toBe(3);
    expect(item.correct).toBe(false);
    expect(item.locked).toBe(true);
  });
});
