import { expect, test } from '@playwright/test';

/* Students who submitted a page before the equal-question scoring policy keep
   a blank-weighted grade in storage. Opening that page must regrade the stored
   result under the current policy — preserving every answer and attempt,
   never resetting the learner — and a second visit must find nothing left to
   rewrite. A legacy record without its attempt data keeps its score as-is;
   a replacement is never invented. */

const DRAFTS_KEY = 'coordinate_lms_drafts_v2';
const RESULTS_KEY = 'coordinate_lms_results_v2';
const UID = 'e2e-student';

interface SeededQuestion {
  answer: string;
  attempts: number;
  correct: boolean;
  locked: boolean;
}

async function seedLegacySubmission(
  page: import('@playwright/test').Page,
  questions: Record<string, SeededQuestion>,
  legacyScore: number,
): Promise<void> {
  await page.evaluate(
    ({ draftsKey, resultsKey, uid, seededQuestions, score }) => {
      const startedAt = 1_700_000_000_000;
      const submittedAt = startedAt + 60_000;
      const attempts: Record<string, number> = {};
      const answers: Record<string, string> = {};
      for (const [qid, progress] of Object.entries(seededQuestions)) {
        attempts[qid] = progress.attempts;
        answers[qid] = progress.answer;
      }
      const maxAttemptCount = Math.max(
        0,
        ...Object.values(attempts),
      );
      localStorage.setItem(
        draftsKey,
        JSON.stringify({
          [uid + ':1']: {
            uid,
            pageNumber: 1,
            startedAt,
            updatedAt: submittedAt,
            activeSeconds: 60,
            questions: seededQuestions,
            submitted: true,
            score,
            maxAttemptCount,
          },
        }),
      );
      localStorage.setItem(
        resultsKey,
        JSON.stringify({
          [uid + ':1']: {
            uid,
            pageNumber: 1,
            score,
            bestScore: score,
            latestScore: score,
            startedAt,
            submittedAt,
            activeSeconds: 60,
            attempts,
            answers,
            maxAttemptCount,
            submissionId: 'legacy-submission',
          },
        }),
      );
    },
    { draftsKey: DRAFTS_KEY, resultsKey: RESULTS_KEY, uid: UID, seededQuestions: questions, score: legacyScore },
  );
}

function readStored(page: import('@playwright/test').Page) {
  return page.evaluate(
    ({ draftsKey, resultsKey, uid }) => {
      const drafts = JSON.parse(localStorage.getItem(draftsKey) || '{}') as Record<string, {
        score?: number; scorePolicyVersion?: number; scoreComputedAt?: number;
        questions: Record<string, { attempts: number }>;
      }>;
      const results = JSON.parse(localStorage.getItem(resultsKey) || '{}') as Record<string, {
        score: number; bestScore?: number; latestScore?: number;
        scorePolicyVersion?: number; scoreComputedAt?: number;
        attempts: Record<string, number>; submissionId?: string;
      }>;
      return { draft: drafts[uid + ':1'], result: results[uid + ':1'] };
    },
    { draftsKey: DRAFTS_KEY, resultsKey: RESULTS_KEY, uid: UID },
  );
}

test('a legacy submitted page is regraded once under the current policy', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();

  // Discover page 1's real target ids straight from the canonical DOM.
  const qids = await page.$$eval('[data-lms-qid]', (els) =>
    els.map((el) => (el as HTMLElement).dataset.lmsQid || '').filter(Boolean),
  );
  expect(qids.length).toBeGreaterThan(1);

  // A pre-policy build's leftovers: everything correct on the first checked
  // attempt, yet a wrong blank-weighted 40 on record.
  const questions: Record<string, SeededQuestion> = {};
  for (const qid of qids) {
    questions[qid] = { answer: 'x', attempts: 1, correct: true, locked: false };
  }
  await seedLegacySubmission(page, questions, 40);
  await page.reload();

  // The learner only ever meets the policy-current grade: all correct on the
  // first try is 100 under any weighting — 40 must be gone.
  await expect(page.locator('.lms-score__num')).toHaveText('100');
  await expect(page.getByRole('button', { name: 'העמוד הוגש' })).toBeDisabled();

  // Local persistence converged: draft and result share the regraded score
  // under an explicit policy stamp, and the recorded attempts are untouched.
  await expect.poll(async () => (await readStored(page)).draft?.scorePolicyVersion).toBeGreaterThan(1);
  const stored = await readStored(page);
  expect(stored.draft?.score).toBe(100);
  expect(stored.result?.score).toBe(100);
  expect(stored.result?.bestScore).toBe(100);
  expect(stored.result?.latestScore).toBe(100);
  expect(stored.result?.scorePolicyVersion).toBe(stored.draft?.scorePolicyVersion);
  expect(stored.result?.submissionId).toBe('legacy-submission');
  for (const qid of qids) {
    expect(stored.result?.attempts[qid]).toBe(1);
    expect(stored.draft?.questions[qid]?.attempts).toBe(1);
  }

  // Idempotent by value: a second visit rewrites nothing.
  const firstComputedAt = stored.draft?.scoreComputedAt;
  expect(firstComputedAt).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator('.lms-score__num')).toHaveText('100');
  const again = await readStored(page);
  expect(again.draft?.scoreComputedAt).toBe(firstComputedAt);
  expect(again.result?.scoreComputedAt).toBe(stored.result?.scoreComputedAt);
});

test('a partially-correct legacy page keeps its real attempt history through the regrade', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();

  const qids = await page.$$eval('[data-lms-qid]', (els) =>
    els.map((el) => (el as HTMLElement).dataset.lmsQid || '').filter(Boolean),
  );
  expect(qids.length).toBeGreaterThan(1);
  // A target with an explicit canonical answer is certainly keyed, so its
  // solved share must survive into the regraded score.
  const keyedQid = await page
    .locator('[data-lms-answers][data-lms-qid]')
    .first()
    .getAttribute('data-lms-qid');
  expect(keyedQid).toBeTruthy();

  // One keyed target solved on the second checked attempt; every other target
  // exhausted and locked — a low-score page, submitted under the old policy.
  const questions: Record<string, SeededQuestion> = {};
  for (const qid of qids) {
    questions[qid] = qid === keyedQid
      ? { answer: 'x', attempts: 2, correct: true, locked: false }
      : { answer: 'x', attempts: 4, correct: false, locked: true };
  }
  await seedLegacySubmission(page, questions, 87);
  await page.reload();

  await expect(page.locator('.lms-score__circle')).toBeVisible();
  const shown = Number(await page.locator('.lms-score__num').textContent());
  // The impossible legacy 87 is regraded to a real current-policy value.
  expect(shown).not.toBe(87);
  expect(shown).toBeGreaterThan(0);
  expect(shown).toBeLessThan(87);

  await expect.poll(async () => (await readStored(page)).draft?.scorePolicyVersion).toBeGreaterThan(1);
  const stored = await readStored(page);
  expect(stored.draft?.score).toBe(shown);
  expect(stored.result?.score).toBe(shown);
  // Attempts and locks are the learner's history — never reset by a regrade.
  expect(stored.draft?.questions[keyedQid!]?.attempts).toBe(2);
  const lockedQid = qids.find((qid) => qid !== keyedQid)!;
  expect(stored.result?.attempts[lockedQid]).toBe(4);
});

test('a legacy record without attempt data keeps its stored score untouched', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();

  // The draft survived with its grade but lost its per-target record.
  await seedLegacySubmission(page, {}, 40);
  await page.reload();

  // The legacy score stays visible; no replacement is invented.
  await expect(page.locator('.lms-score__num')).toHaveText('40');

  // And storage still holds the untouched legacy record.
  const stored = await readStored(page);
  expect(stored.draft?.score).toBe(40);
  expect(stored.draft?.scorePolicyVersion).toBeUndefined();
  expect(stored.result?.score).toBe(40);
  expect(stored.result?.scorePolicyVersion).toBeUndefined();
});
