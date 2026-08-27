import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const PROJECT_ID = 'demo-coordinate-lms';
const ADMIN_EMAIL = 'yanivmiz77@gmail.com';
const STUDENT_A = 'student-a';
const STUDENT_B = 'student-b';
const NOW = 1_800_000_000_000;

let environment: RulesTestEnvironment;

function studentProfile(uid: string, email = `${uid}@example.test`) {
  return {
    uid,
    fullName: `Student ${uid}`,
    username: uid,
    email,
    role: 'student',
    createdAt: NOW,
    lastSeenAt: NOW,
  };
}

function draft(uid: string, pageNumber = 2) {
  return {
    uid,
    pageNumber,
    startedAt: NOW,
    updatedAt: NOW + 10,
    activeSeconds: 30,
    questions: {
      'q-1': { answer: '4', attempts: 1, correct: true, locked: true },
    },
    submitted: false,
    maxAttemptCount: 1,
  };
}

function result(uid: string, pageNumber = 2) {
  return {
    uid,
    pageNumber,
    score: 80,
    bestScore: 80,
    latestScore: 80,
    startedAt: NOW,
    submittedAt: NOW + 20,
    activeSeconds: 30,
    attempts: { 'q-1': 1 },
    answers: { 'q-1': '4' },
    maxAttemptCount: 1,
    submissionId: `${uid}:${pageNumber}:${NOW}`,
  };
}

function activity(uid: string, id = 'event-1') {
  return {
    id,
    uid,
    pageNumber: 2,
    type: 'answer_check',
    createdAt: NOW,
    metadata: { targetId: 'q-1' },
  };
}

function studentDb(uid: string, email = `${uid}@example.test`) {
  return environment.authenticatedContext(uid, { email }).firestore();
}

function adminDb() {
  return environment
    .authenticatedContext('teacher', { email: ADMIN_EMAIL })
    .firestore();
}

async function seedProfiles(): Promise<void> {
  await environment.withSecurityRulesDisabled(async (context) => {
    await Promise.all([
      setDoc(
        doc(context.firestore(), 'students', STUDENT_A),
        studentProfile(STUDENT_A),
      ),
      setDoc(
        doc(context.firestore(), 'students', STUDENT_B),
        studentProfile(STUDENT_B),
      ),
    ]);
  });
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

afterAll(async () => {
  await environment.cleanup();
});

describe('Firestore emulator authorization contract', () => {
  it('allows an owner profile but denies anonymous and cross-student reads', async () => {
    const ownDb = studentDb(STUDENT_A);
    await assertSucceeds(
      setDoc(
        doc(ownDb, 'students', STUDENT_A),
        studentProfile(STUDENT_A),
      ),
    );

    await assertSucceeds(getDoc(doc(ownDb, 'students', STUDENT_A)));
    await assertFails(getDoc(doc(ownDb, 'students', STUDENT_B)));
    await assertFails(
      getDoc(
        doc(
          environment.unauthenticatedContext().firestore(),
          'students',
          STUDENT_A,
        ),
      ),
    );
  });

  it('rejects impersonation, role escalation, invalid timestamps, and extra fields', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A);

    await assertFails(
      setDoc(reference, { ...studentProfile(STUDENT_A), uid: STUDENT_B }),
    );
    await assertFails(
      setDoc(reference, { ...studentProfile(STUDENT_A), role: 'admin' }),
    );
    await assertFails(
      setDoc(reference, {
        ...studentProfile(STUDENT_A),
        lastSeenAt: NOW - 1,
      }),
    );
    await assertFails(
      setDoc(reference, { ...studentProfile(STUDENT_A), injected: true }),
    );
  });

  it('allows an administrator class snapshot but denies a student-wide query', async () => {
    await seedProfiles();

    const snapshot = await assertSucceeds(
      getDocs(collection(adminDb(), 'students')),
    );
    expect(snapshot.size).toBe(2);
    await assertFails(getDocs(collection(studentDb(STUDENT_A), 'students')));
  });

  it('enforces owner, page, score, attempt, shape, and document-path draft rules', async () => {
    const db = studentDb(STUDENT_A);
    await assertSucceeds(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), draft(STUDENT_A)),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_B, 'drafts', 'page-2'), draft(STUDENT_B)),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-3'), draft(STUDENT_A, 2)),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-0'), draft(STUDENT_A, 0)),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), {
        ...draft(STUDENT_A),
        maxAttemptCount: 5,
      }),
    );
    await assertSucceeds(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), {
        ...draft(STUDENT_A),
        score: 0,
        submitted: true,
      }),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), {
        ...draft(STUDENT_A),
        score: -1,
        submitted: true,
      }),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), {
        ...draft(STUDENT_A),
        score: 101,
        submitted: true,
      }),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'drafts', 'page-2'), {
        ...draft(STUDENT_A),
        unexpected: true,
      }),
    );
  });

  it('prevents draft progress, attempt summary, and completion regression', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A, 'drafts', 'page-2');
    const completed = {
      ...draft(STUDENT_A),
      updatedAt: NOW + 30,
      activeSeconds: 90,
      submitted: true,
      score: 90,
      maxAttemptCount: 3,
    };
    await assertSucceeds(setDoc(reference, completed));

    await assertFails(
      setDoc(reference, { ...completed, updatedAt: NOW + 20 }),
    );
    await assertFails(
      setDoc(reference, { ...completed, activeSeconds: 89 }),
    );
    await assertFails(
      setDoc(reference, { ...completed, maxAttemptCount: 2 }),
    );
    await assertFails(
      setDoc(reference, { ...completed, submitted: false, score: 90 }),
    );
  });

  it('accepts an idempotent result retry, including score zero, but rejects stale or malformed results', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A, 'results', 'page-2');
    const valid = result(STUDENT_A);
    await assertSucceeds(setDoc(reference, valid));
    await assertSucceeds(setDoc(reference, valid));

    const zero = {
      ...result(STUDENT_A, 3),
      score: 0,
      bestScore: 0,
      latestScore: 0,
    };
    await assertSucceeds(
      setDoc(doc(db, 'students', STUDENT_A, 'results', 'page-3'), zero),
    );

    await assertFails(
      setDoc(reference, { ...valid, submittedAt: NOW + 19 }),
    );
    await assertFails(
      setDoc(reference, { ...valid, score: -1, latestScore: -1 }),
    );
    await assertFails(
      setDoc(reference, { ...valid, score: 101, latestScore: 101, bestScore: 101 }),
    );
    await assertFails(
      setDoc(reference, { ...valid, maxAttemptCount: 5 }),
    );
    await assertFails(
      setDoc(reference, { ...valid, bestScore: 79 }),
    );
    await assertFails(
      setDoc(doc(db, 'students', STUDENT_A, 'results', 'page-3'), valid),
    );
  });

  it('allows a policy regrade of the same submission but pins the recorded work', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A, 'results', 'page-2');
    const legacy = result(STUDENT_A);
    await assertSucceeds(setDoc(reference, legacy));

    const regraded = {
      ...legacy,
      score: 50,
      bestScore: 50,
      latestScore: 50,
      scorePolicyVersion: 2,
      scoreComputedAt: NOW + 100,
    };

    // Lowering the score without declaring a scoring policy stays forbidden.
    await assertFails(
      setDoc(reference, { ...legacy, score: 50, bestScore: 50, latestScore: 50 }),
    );
    // A regrade may not touch the learner's recorded work.
    await assertFails(
      setDoc(reference, { ...regraded, attempts: { 'q-1': 2 } }),
    );
    await assertFails(
      setDoc(reference, { ...regraded, answers: { 'q-1': '5' } }),
    );
    await assertFails(
      setDoc(reference, { ...regraded, submittedAt: NOW + 21 }),
    );
    // The faithful regrade of the same submission is accepted.
    await assertSucceeds(setDoc(reference, regraded));
    // Idempotent re-run of the same regrade is accepted.
    await assertSucceeds(setDoc(reference, regraded));
    // A stored score never regresses to an older policy.
    await assertFails(setDoc(reference, legacy));
    await assertFails(
      setDoc(reference, { ...regraded, scorePolicyVersion: 1 }),
    );
    // A genuinely newer submission under the current policy may lower
    // bestScore only across a policy upgrade, not inside one policy.
    await assertFails(
      setDoc(reference, {
        ...regraded,
        submittedAt: NOW + 200,
        submissionId: 'next-submission',
        score: 40,
        bestScore: 40,
        latestScore: 40,
      }),
    );
    await assertSucceeds(
      setDoc(reference, {
        ...regraded,
        submittedAt: NOW + 200,
        submissionId: 'next-submission',
        score: 80,
        bestScore: 80,
        latestScore: 80,
      }),
    );
  });

  it('regrades a stored document that predates the submissionId field', async () => {
    const reference = () =>
      doc(studentDb(STUDENT_A), 'students', STUDENT_A, 'results', 'page-2');
    const { submissionId: _dropped, ...legacyWithoutId } = result(STUDENT_A);
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'students', STUDENT_A, 'results', 'page-2'),
        legacyWithoutId,
      );
    });

    // The same submission is identified by submittedAt; the client always
    // writes the full current shape, including its fallback submissionId.
    await assertSucceeds(
      setDoc(reference(), {
        ...legacyWithoutId,
        score: 45,
        bestScore: 45,
        latestScore: 45,
        submissionId: 'reconstructed-fallback-id',
        scorePolicyVersion: 2,
        scoreComputedAt: NOW + 100,
      }),
    );
  });

  it('lets only policy-aware draft writes lower a stored draft score', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A, 'drafts', 'page-2');
    const legacy = {
      ...draft(STUDENT_A),
      submitted: true,
      score: 80,
    };
    await assertSucceeds(setDoc(reference, legacy));

    // A blind writer cannot lower the score.
    await assertFails(
      setDoc(reference, { ...legacy, updatedAt: NOW + 20, score: 50 }),
    );
    // A policy-aware regrade can.
    const regraded = {
      ...legacy,
      updatedAt: NOW + 20,
      score: 50,
      scorePolicyVersion: 2,
      scoreComputedAt: NOW + 20,
    };
    await assertSucceeds(setDoc(reference, regraded));
    // The draft's policy never regresses afterwards.
    await assertFails(
      setDoc(reference, { ...legacy, updatedAt: NOW + 30 }),
    );
    await assertFails(
      setDoc(reference, {
        ...regraded,
        updatedAt: NOW + 30,
        scorePolicyVersion: 1,
      }),
    );
    // Malformed provenance fields are rejected.
    await assertFails(
      setDoc(reference, {
        ...regraded,
        updatedAt: NOW + 30,
        scorePolicyVersion: 0,
      }),
    );
    await assertFails(
      setDoc(reference, {
        ...regraded,
        updatedAt: NOW + 30,
        scoreComputedAt: 'now',
      }),
    );
  });

  it('keeps result queries and deletes administrator-only across identities', async () => {
    await seedProfiles();
    await environment.withSecurityRulesDisabled(async (context) => {
      await Promise.all([
        setDoc(
          doc(context.firestore(), 'students', STUDENT_A, 'results', 'page-2'),
          result(STUDENT_A),
        ),
        setDoc(
          doc(context.firestore(), 'students', STUDENT_B, 'results', 'page-2'),
          result(STUDENT_B),
        ),
      ]);
    });

    const [studentAResults, studentBResults] = await Promise.all([
      assertSucceeds(
        getDocs(collection(adminDb(), 'students', STUDENT_A, 'results')),
      ),
      assertSucceeds(
        getDocs(collection(adminDb(), 'students', STUDENT_B, 'results')),
      ),
    ]);
    expect(studentAResults.size + studentBResults.size).toBe(2);
    await assertFails(
      getDocs(
        collection(studentDb(STUDENT_A), 'students', STUDENT_B, 'results'),
      ),
    );
    await assertFails(
      deleteDoc(
        doc(studentDb(STUDENT_A), 'students', STUDENT_A, 'results', 'page-2'),
      ),
    );
    await assertSucceeds(
      deleteDoc(doc(adminDb(), 'students', STUDENT_A, 'results', 'page-2')),
    );
  });

  it('requires stable activity IDs and allows exact idempotent retries only', async () => {
    const db = studentDb(STUDENT_A);
    const reference = doc(db, 'students', STUDENT_A, 'activity', 'event-1');
    const valid = activity(STUDENT_A);
    await assertSucceeds(setDoc(reference, valid));
    await assertSucceeds(setDoc(reference, valid));
    await assertFails(setDoc(reference, { ...valid, createdAt: NOW + 1 }));
    await assertFails(
      setDoc(
        doc(db, 'students', STUDENT_A, 'activity', 'different-id'),
        valid,
      ),
    );
  });

  it('keeps answer-key writes administrator-only and validates their path and shape', async () => {
    const validKey = {
      pageNumber: 2,
      answers: { 'q-1': ['4'] },
      updatedAt: NOW,
      updatedBy: 'teacher',
    };
    const admin = adminDb();
    await assertSucceeds(
      setDoc(doc(admin, 'answerKeys', 'page-2'), validKey),
    );
    await assertFails(
      setDoc(doc(studentDb(STUDENT_A), 'answerKeys', 'page-2'), validKey),
    );
    await assertFails(
      setDoc(doc(admin, 'answerKeys', 'page-3'), validKey),
    );
    await assertFails(
      setDoc(doc(admin, 'answerKeys', 'page-2'), {
        ...validKey,
        injected: true,
      }),
    );
    await assertFails(
      getDoc(
        doc(
          environment.unauthenticatedContext().firestore(),
          'answerKeys',
          'page-2',
        ),
      ),
    );
  });
});