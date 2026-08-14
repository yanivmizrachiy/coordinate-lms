import { describe, expect, it } from 'vitest';
import {
  acceptImmediateCorrectAnswer,
  armExplicitAnswerCheck,
} from '../src/lms/liveFeedback';
import type { QuestionProgress } from '../src/lms/types';

function progress(answer: string): QuestionProgress {
  return {
    answer,
    attempts: 0,
    correct: false,
    locked: false,
  };
}

describe('explicit per-answer checking', () => {
  it('does not grade or consume an attempt while the learner only types', () => {
    const item = progress('5');

    expect(acceptImmediateCorrectAnswer(item, ['5'])).toBe(false);
    expect(item.attempts).toBe(0);
    expect(item.correct).toBe(false);
    expect(item.locked).toBe(false);
  });

  it('accepts a correct answer only after the nearby check control is armed', () => {
    const item = progress('5');

    armExplicitAnswerCheck();
    expect(acceptImmediateCorrectAnswer(item, ['5'])).toBe(true);
    expect(item.attempts).toBe(1);
    expect(item.correct).toBe(true);
    expect(item.locked).toBe(false);
  });

  it('counts explicit wrong checks and locks only on the third wrong attempt', () => {
    const item = progress('4');

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      armExplicitAnswerCheck();
      expect(acceptImmediateCorrectAnswer(item, ['5'])).toBe(true);
      expect(item.attempts).toBe(attempt);
      expect(item.correct).toBe(false);
      expect(item.locked).toBe(attempt === 3);
    }
  });
});
