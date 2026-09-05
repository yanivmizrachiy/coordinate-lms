import { describe, expect, it } from 'vitest';
import { clearEditableAnswers, freshPageRun } from '../src/lms/pageRun';
import type { PageDraft } from '../src/lms/types';

const submittedDraft = (): PageDraft => ({
  uid: 'student-1',
  pageNumber: 7,
  startedAt: 100,
  updatedAt: 200,
  activeSeconds: 45,
  questions: {
    a: { answer: 'x', attempts: 1, correct: true, locked: false },
    b: { answer: 'wrong', attempts: 2, correct: false, locked: false },
    c: { answer: 'stuck', attempts: 4, correct: false, locked: true },
  },
  submitted: true,
  score: 63,
  scorePolicyVersion: 2,
  scoreComputedAt: 200,
  maxAttemptCount: 4,
});

describe('page run controls', () => {
  it('clears only editable answers without refunding attempts or unlocking resolved work', () => {
    const original = submittedDraft();
    original.submitted = false;
    const cleared = clearEditableAnswers(original, 250);

    expect(cleared.questions.a).toEqual(original.questions.a);
    expect(cleared.questions.b).toEqual({
      answer: '',
      attempts: 2,
      correct: false,
      locked: false,
    });
    expect(cleared.questions.c).toEqual(original.questions.c);
    expect(cleared.maxAttemptCount).toBe(4);
    expect(cleared.submitted).toBe(false);
  });

  it('starts a clean new run after submission without carrying the prior score into the draft', () => {
    const fresh = freshPageRun(submittedDraft(), 300);

    expect(fresh.uid).toBe('student-1');
    expect(fresh.pageNumber).toBe(7);
    expect(fresh.startedAt).toBe(300);
    expect(fresh.updatedAt).toBe(300);
    expect(fresh.activeSeconds).toBe(0);
    expect(fresh.questions).toEqual({});
    expect(fresh.submitted).toBe(false);
    expect(fresh.maxAttemptCount).toBe(0);
    expect(fresh.score).toBeUndefined();
    expect(fresh.scorePolicyVersion).toBeUndefined();
    expect(fresh.scoreComputedAt).toBeUndefined();
  });

  it('keeps the active guest-session marker when a guest retries the same page', () => {
    const guest = { ...submittedDraft(), uid: 'guest', guestSessionId: 'guest-session-1' };
    expect(freshPageRun(guest, 300).guestSessionId).toBe('guest-session-1');
  });
});
