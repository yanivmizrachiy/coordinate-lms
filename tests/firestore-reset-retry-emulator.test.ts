import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const PROJECT_ID = 'demo-coordinate-lms';
const UID = 'reset-student';
const NOW = 1_800_000_000_000;

let environment: RulesTestEnvironment;

function db() {
  return environment.authenticatedContext(UID, { email: `${UID}@example.test` }).firestore();
}

function submittedDraft() {
  return {
    uid: UID,
    pageNumber: 2,
    startedAt: NOW,
    updatedAt: NOW + 20,
    activeSeconds: 45,
    questions: {
      'q-1': { answer: '4', attempts: 2, correct: true, locked: true },
    },
    submitted: true,
    score: 75,
    maxAttemptCount: 2,
  };
}

function freshDraft() {
  return {
    uid: UID,
    pageNumber: 2,
    startedAt: NOW + 30,
    updatedAt: NOW + 30,
    activeSeconds: 0,
    questions: {},
    submitted: false,
    maxAttemptCount: 0,
  };
}

function firstResult() {
  return {
    uid: UID,
    pageNumber: 2,
    score: 80,
    bestScore: 80,
    latestScore: 80,
    startedAt: NOW,
    submittedAt: NOW + 20,
    activeSeconds: 45,
    attempts: { 'q-1': 2 },
    answers: { 'q-1': '4' },
    maxAttemptCount: 2,
    submissionId: 'first-run',
  };
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

afterAll(async () => {
  await environment.cleanup();
});

describe('explicit page restart authorization', () => {
  it('allows only a submitted draft to become a genuinely fresh run', async () => {
    const reference = doc(db(), 'students', UID, 'drafts', 'page-2');
    await assertSucceeds(setDoc(reference, submittedDraft()));
    await assertSucceeds(setDoc(reference, freshDraft()));

    const stored = (await assertSucceeds(getDoc(reference))).data();
    expect(stored?.submitted).toBe(false);
    expect(stored?.questions).toEqual({});
    expect(stored?.activeSeconds).toBe(0);
    expect(stored?.maxAttemptCount).toBe(0);
    expect(stored).not.toHaveProperty('score');
  });

  it('does not let an in-progress run refund attempts or move its start boundary', async () => {
    const reference = doc(db(), 'students', UID, 'drafts', 'page-2');
    const inProgress = { ...submittedDraft(), submitted: false };
    delete (inProgress as Partial<typeof inProgress>).score;
    await assertSucceeds(setDoc(reference, inProgress));
    await assertFails(setDoc(reference, freshDraft()));
  });

  it('rejects a fake restart that carries score or old answer state', async () => {
    const reference = doc(db(), 'students', UID, 'drafts', 'page-2');
    await assertSucceeds(setDoc(reference, submittedDraft()));

    await assertFails(setDoc(reference, { ...freshDraft(), score: 75 }));
    await assertFails(setDoc(reference, {
      ...freshDraft(),
      questions: {
        'q-1': { answer: '4', attempts: 1, correct: true, locked: false },
      },
      maxAttemptCount: 1,
    }));
  });

  it('accepts a later submission from the fresh run while preserving best score', async () => {
    const reference = doc(db(), 'students', UID, 'results', 'page-2');
    await assertSucceeds(setDoc(reference, firstResult()));

    const later = {
      ...firstResult(),
      score: 60,
      latestScore: 60,
      bestScore: 80,
      startedAt: NOW + 30,
      submittedAt: NOW + 50,
      activeSeconds: 12,
      attempts: { 'q-1': 1 },
      maxAttemptCount: 1,
      submissionId: 'second-run',
    };
    await assertSucceeds(setDoc(reference, later));

    const stored = (await assertSucceeds(getDoc(reference))).data();
    expect(stored?.latestScore).toBe(60);
    expect(stored?.bestScore).toBe(80);
    expect(stored?.submissionId).toBe('second-run');
  });

  it('rejects a later submission that rewrites history or lowers same-policy best', async () => {
    const reference = doc(db(), 'students', UID, 'results', 'page-2');
    await assertSucceeds(setDoc(reference, firstResult()));

    await assertFails(setDoc(reference, {
      ...firstResult(),
      score: 60,
      latestScore: 60,
      bestScore: 60,
      startedAt: NOW + 30,
      submittedAt: NOW + 50,
      submissionId: 'second-run',
    }));

    await assertFails(setDoc(reference, {
      ...firstResult(),
      score: 90,
      latestScore: 90,
      bestScore: 90,
      startedAt: NOW + 10,
      submittedAt: NOW + 50,
      submissionId: 'second-run-too-early',
    }));
  });
});
