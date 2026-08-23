import { beforeEach, describe, expect, test } from 'vitest';
import {
  canFinalizeGuestTransfer,
  claimGuestProgress,
  loadPageResult,
  mergePageDrafts,
  mergePageResults,
  saveDraft,
  savePageResult,
} from '../src/lms/repository';
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
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
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
    expect(mergePageResults(first, first)).toEqual(
      mergePageResults(null, first),
    );
  });

  test('draft merging never resets attempts after reload', () => {
    const merged = mergePageDrafts(draft(200, 2, 'x'), draft(100, 0, ''));
    expect(merged.questions['p4-q1']?.attempts).toBe(2);
    expect(merged.questions['p4-q1']?.correct).toBe(true);
    expect(merged.maxAttemptCount).toBe(2);
  });

  test('invalid scores and attempt counts are rejected before storage', () => {
    expect(() => mergePageResults(null, result(0, 1))).toThrow(/1 ל־100/);
    expect(() => mergePageResults(null, result(101, 1))).toThrow(/1 ל־100/);
    expect(() => mergePageResults(null, result(50, 1, 4))).toThrow(/0 ל־3/);
  });

  test('guest result scores are not stored and legacy guest scores are purged', async () => {
    localStorage.setItem(
      'coordinate_lms_results_v2',
      JSON.stringify({
        'guest:1': { ...result(90, 20, 2), uid: 'guest', pageNumber: 1 },
      }),
    );

    expect(await loadPageResult('guest', 1)).toBeNull();

    const outcome = await savePageResult({
      ...result(88, 30, 2),
      uid: 'guest',
      pageNumber: 1,
    });
    expect(outcome.localSaved).toBe(false);
    expect(outcome.central).toBe('not-required');

    const results = JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, PageResult>;
    expect(results['guest:1']).toBeUndefined();
  });

  test('guest draft keeps attempts but never stores a submitted score', async () => {
    await saveDraft({
      ...draft(20, 2, 'x'),
      uid: 'guest',
      pageNumber: 1,
      submitted: true,
      score: 95,
    });

    const drafts = JSON.parse(
      localStorage.getItem('coordinate_lms_drafts_v2') || '{}',
    ) as Record<string, PageDraft>;
    expect(drafts['guest:1']?.questions['p4-q1']?.attempts).toBe(2);
    expect(drafts['guest:1']?.submitted).toBe(false);
    expect(drafts['guest:1']?.score).toBeUndefined();
  });

  test('registration may transfer guest draft progress but never a guest score', async () => {
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
      JSON.stringify({ 'guest:1': { ...draft(20, 2, 'x'), uid: 'guest', pageNumber: 1 } }),
    );
    localStorage.setItem(
      'coordinate_lms_results_v2',
      JSON.stringify({ 'guest:1': { ...result(90, 20, 2), uid: 'guest', pageNumber: 1 } }),
    );

    const claim = await claimGuestProgress('student-1');
    expect(claim.complete).toBe(true);

    const drafts = JSON.parse(
      localStorage.getItem('coordinate_lms_drafts_v2') || '{}',
    ) as Record<string, PageDraft>;
    const results = JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, PageResult>;
    expect(drafts['guest:1']).toBeUndefined();
    expect(results['guest:1']).toBeUndefined();
    expect(drafts['student-1:1']?.questions['p4-q1']?.attempts).toBe(2);
    expect(results['student-1:1']).toBeUndefined();
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
    expect(lines).toHaveLength(79); // header + one row per page (78)
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
