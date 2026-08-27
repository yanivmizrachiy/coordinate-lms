import { beforeEach, describe, expect, test } from 'vitest';
import {
  canFinalizeGuestTransfer,
  claimGuestProgress,
  loadPageResult,
  mergePageDrafts,
  mergePageResults,
  savePageResult,
} from '../src/lms/repository';
import { LMS_CONFIG } from '../src/lms/config';
import { SCORE_POLICY_VERSION } from '../src/lms/scoring';
import {
  buildDashboardCsv,
  DASHBOARD_CSV_COLUMNS,
  escapeCsvCell,
} from '../src/lms/dashboardCsv';
import type {
  DashboardSnapshot,
  PageDraft,
  PageResult,
} from '../src/lms/types';

const result = (
  score: number,
  submittedAt: number,
  attempts = 1,
): PageResult => ({
  uid: 'student-1',
  pageNumber: 4,
  score,
  startedAt: 10,
  submittedAt,
  activeSeconds: 30,
  attempts: { 'p4-q1': attempts },
  answers: { 'p4-q1': 'x' },
  submissionId: 'submission-' + String(submittedAt),
});

const draft = (
  updatedAt: number,
  attempts: number,
  answer: string,
): PageDraft => ({
  uid: 'student-1',
  pageNumber: 4,
  startedAt: 10,
  updatedAt,
  activeSeconds: updatedAt,
  submitted: false,
  questions: {
    'p4-q1': {
      answer,
      attempts,
      correct: attempts > 1,
      locked: false,
    },
  },
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
});

describe('LMS persistence merging', () => {
  test('a stale lower score cannot replace the latest or best score', () => {
    const current = result(92, 200);
    const stale = result(40, 100);
    const merged = mergePageResults(current, stale);
    expect(merged.latestScore).toBe(92);
    expect(merged.score).toBe(92);
    expect(merged.bestScore).toBe(92);
    expect(merged.submittedAt).toBe(200);
  });

  test('a newer lower score becomes latest without erasing the best', () => {
    const merged = mergePageResults(result(92, 100), result(70, 200));
    expect(merged.latestScore).toBe(70);
    expect(merged.bestScore).toBe(92);
  });

  test('retrying the same submission is idempotent', () => {
    const first = result(88, 200, 2);
    expect(mergePageResults(first, first)).toEqual(mergePageResults(null, first));
  });

  test('draft merging never resets attempts after reload', () => {
    const merged = mergePageDrafts(draft(200, 2, 'x'), draft(100, 0, ''));
    expect(merged.questions['p4-q1']?.attempts).toBe(2);
    expect(merged.questions['p4-q1']?.correct).toBe(true);
    expect(merged.maxAttemptCount).toBe(2);
  });

  test('the existing draft owns startedAt, so cloud updates pass the immutability rule', () => {
    /* Firestore pins a draft's startedAt on update. Work that began locally
       BEFORE registration finished carries an earlier startedAt than the cloud
       copy created at sign-up; taking the minimum here made every later
       central update fail forever. The already-stored side keeps its start. */
    const cloud = { ...draft(200, 1, 'x'), startedAt: 500 };
    const localEarlier = { ...draft(300, 2, 'y'), startedAt: 10 };
    expect(mergePageDrafts(cloud, localEarlier).startedAt).toBe(500);
    const localLater = { ...draft(300, 2, 'y'), startedAt: 900 };
    expect(mergePageDrafts(cloud, localLater).startedAt).toBe(500);
  });

  test('zero is valid while out-of-range scores and attempts are rejected before storage', () => {
    expect(() => mergePageResults(null, result(0, 1))).not.toThrow();
    expect(() => mergePageResults(null, result(-1, 1))).toThrow(/0 ל־100/);
    expect(() => mergePageResults(null, result(101, 1))).toThrow(/0 ל־100/);
    expect(() =>
      mergePageResults(null, result(50, 1, LMS_CONFIG.maxAttempts + 1)),
    ).toThrow(new RegExp(`0 ל־${String(LMS_CONFIG.maxAttempts)}`));
  });

  test('guest page scores are display-only and are never persisted or restored', async () => {
    const guestResult = { ...result(90, 20, 2), uid: 'guest', pageNumber: 1 };
    const outcome = await savePageResult(guestResult);
    expect(outcome.localSaved).toBe(false);
    expect(outcome.central).toBe('not-required');
    expect(localStorage.getItem('coordinate_lms_results_v2')).toBe('{}');
    await expect(loadPageResult('guest', 1)).resolves.toBeNull();

    localStorage.setItem(
      'coordinate_lms_results_v2',
      JSON.stringify({ 'guest:1': guestResult }),
    );
    await expect(loadPageResult('guest', 1)).resolves.toBeNull();
    expect(localStorage.getItem('coordinate_lms_results_v2')).toBe('{}');
  });

  test('registration transfers guest draft attempts but purges any legacy guest result', async () => {
    localStorage.setItem(
      'coordinate_lms_session_v2',
      JSON.stringify({
        uid: 'student-1',
        fullName: 'תלמיד',
        username: 'student',
        email: 'student@example.com',
        role: 'student',
        createdAt: 1,
      }),
    );
    localStorage.setItem(
      'coordinate_lms_drafts_v2',
      JSON.stringify({ 'guest:1': { ...draft(20, 2, 'x'), uid: 'guest', pageNumber: 1, score: 90, submitted: true } }),
    );
    localStorage.setItem(
      'coordinate_lms_results_v2',
      JSON.stringify({ 'guest:1': { ...result(90, 20, 2), uid: 'guest', pageNumber: 1 } }),
    );

    const claim = await claimGuestProgress('student-1');
    expect(claim.complete).toBe(true);

    const drafts = JSON.parse(localStorage.getItem('coordinate_lms_drafts_v2') || '{}') as Record<string, PageDraft>;
    const results = JSON.parse(localStorage.getItem('coordinate_lms_results_v2') || '{}') as Record<string, PageResult>;
    expect(drafts['guest:1']).toBeUndefined();
    expect(results['guest:1']).toBeUndefined();
    expect(results['student-1:1']).toBeUndefined();
    expect(drafts['student-1:1']?.questions['p4-q1']?.attempts).toBe(2);
    expect(drafts['student-1:1']?.score).toBeUndefined();
    expect(drafts['student-1:1']?.submitted).toBe(false);
  });

  test('guest source progress is not eligible for removal after central failure', () => {
    expect(
      canFinalizeGuestTransfer([
        { localSaved: true, central: 'saved' },
        { localSaved: true, central: 'failed', error: 'sync failed' },
      ]),
    ).toBe(false);
  });
});

describe('scoring-policy-aware merging', () => {
  const legacy = (score: number): PageResult => ({
    ...result(score, 200),
    submissionId: 'submission-shared',
  });
  const regraded = (score: number, computedAt = 900): PageResult => ({
    ...result(score, 200),
    submissionId: 'submission-shared',
    bestScore: score,
    latestScore: score,
    scorePolicyVersion: SCORE_POLICY_VERSION,
    scoreComputedAt: computedAt,
  });

  test('a regrade of the same submission replaces its higher legacy twin wholesale', () => {
    for (const merged of [
      mergePageResults(legacy(80), regraded(50)),
      mergePageResults(regraded(50), legacy(80)),
    ]) {
      expect(merged.score).toBe(50);
      expect(merged.latestScore).toBe(50);
      expect(merged.bestScore).toBe(50);
      expect(merged.scorePolicyVersion).toBe(SCORE_POLICY_VERSION);
    }
  });

  test('migrating a record twice changes nothing', () => {
    const once = mergePageResults(legacy(80), regraded(50));
    expect(mergePageResults(once, once)).toEqual(once);
    expect(mergePageResults(once, regraded(50))).toEqual(once);
  });

  test('within one policy the fresher recomputation of the same submission wins', () => {
    const stale = regraded(80, 900);
    const healed = regraded(50, 1000);
    expect(mergePageResults(stale, healed).score).toBe(50);
    expect(mergePageResults(healed, stale).score).toBe(50);
  });

  test('a newer real submission still wins, but bestScore never mixes policies', () => {
    const legacyOld = { ...result(95, 100), submissionId: 'submission-old' };
    const currentNew = {
      ...result(60, 300),
      submissionId: 'submission-new',
      scorePolicyVersion: SCORE_POLICY_VERSION,
      scoreComputedAt: 300,
    };
    const merged = mergePageResults(legacyOld, currentNew);
    expect(merged.latestScore).toBe(60);
    // The legacy 95 was computed on an incompatible scale; it may not shadow
    // the current-policy grade through Math.max.
    expect(merged.bestScore).toBe(60);
    expect(merged.scorePolicyVersion).toBe(SCORE_POLICY_VERSION);
  });

  test('draft merges keep the current-policy score over a higher legacy score', () => {
    const legacyDraft: PageDraft = {
      ...draft(100, 2, 'x'),
      submitted: true,
      score: 80,
    };
    const migratedDraft: PageDraft = {
      ...draft(200, 2, 'x'),
      submitted: true,
      score: 50,
      scorePolicyVersion: SCORE_POLICY_VERSION,
      scoreComputedAt: 900,
    };
    for (const merged of [
      mergePageDrafts(legacyDraft, migratedDraft),
      mergePageDrafts(migratedDraft, legacyDraft),
    ]) {
      expect(merged.score).toBe(50);
      expect(merged.scorePolicyVersion).toBe(SCORE_POLICY_VERSION);
    }
  });

  test('draft merges inside one policy prefer the fresher recomputation, then max()', () => {
    const stale: PageDraft = {
      ...draft(100, 2, 'x'),
      submitted: true,
      score: 80,
      scorePolicyVersion: SCORE_POLICY_VERSION,
      scoreComputedAt: 900,
    };
    const healed: PageDraft = {
      ...draft(200, 2, 'x'),
      submitted: true,
      score: 50,
      scorePolicyVersion: SCORE_POLICY_VERSION,
      scoreComputedAt: 1000,
    };
    expect(mergePageDrafts(stale, healed).score).toBe(50);
    expect(mergePageDrafts(healed, stale).score).toBe(50);

    // Records that predate the freshness field keep the stale-write max().
    const a: PageDraft = { ...draft(100, 2, 'x'), submitted: true, score: 40 };
    const b: PageDraft = { ...draft(200, 2, 'x'), submitted: true, score: 70 };
    expect(mergePageDrafts(a, b).score).toBe(70);
    expect(mergePageDrafts(b, a).score).toBe(70);
  });
});

describe('teacher dashboard CSV', () => {
  test('uses stable columns, UTF-8 BOM, ISO timestamps, and all 78 pages', () => {
    const snapshot: DashboardSnapshot = {
      generatedAt: 300,
      source: 'firebase',
      syncErrors: [],
      students: [
        {
          profile: {
            uid: 'student-1',
            fullName: 'נועה, "כהן"\nכיתה ז',
            username: '=formula',
            email: 'student@example.com',
            role: 'student',
            createdAt: 100,
            lastSeenAt: 200,
          },
          results: [result(90, 250, 3)],
          drafts: [draft(220, 2, 'x')],
          activity: [
            {
              uid: 'student-1',
              pageNumber: 4,
              type: 'page_submit',
              createdAt: 250,
            },
          ],
          syncErrors: [],
        },
      ],
    };
    const csv = buildDashboardCsv(snapshot);
    const lines = csv.trimEnd().split('\r\n');
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(lines).toHaveLength(79);
    expect(lines[0]).toContain(DASHBOARD_CSV_COLUMNS.join('\",\"'));
    expect(csv).toContain('1970-01-01T00:00:00.100Z');
    expect(csv).toContain('"נועה, ""כהן""\nכיתה ז"');
    expect(csv).toContain("\"'=formula\"");
    expect(csv).toContain('"90","90"');
  });

  test('escapes commas, quotes, line breaks and formula prefixes', () => {
    expect(escapeCsvCell('א,ב')).toBe('"א,ב"');
    expect(escapeCsvCell('א"ב')).toBe('"א""ב"');
    expect(escapeCsvCell('א\nב')).toBe('"א\nב"');
    expect(escapeCsvCell('@cmd')).toBe('"\'@cmd"');
  });
});