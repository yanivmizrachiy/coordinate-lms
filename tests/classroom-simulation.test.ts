import { beforeEach, describe, expect, it } from 'vitest';
import {
  currentSession,
  loginStudent,
  logoutStudent,
  registerStudent,
} from '../src/lms/auth';
import { buildDashboardCsv } from '../src/lms/dashboardCsv';
import { canAccessPage } from '../src/lms/engine';
import {
  claimGuestProgress,
  loadDashboard,
  loadDraft,
  logActivity,
  saveDraft,
  savePageResult,
} from '../src/lms/repository';
import { runSynchronizationRetry } from '../src/lms/syncRetry';
import type {
  ActivityEvent,
  PageDraft,
  PageResult,
  PersistenceOutcome,
} from '../src/lms/types';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

function draft(uid: string, pageNumber: number, attempts: number): PageDraft {
  return {
    uid,
    pageNumber,
    startedAt: 100,
    updatedAt: 200,
    activeSeconds: 60,
    questions: {
      [`p${String(pageNumber)}-q1`]: {
        answer: '4',
        attempts,
        correct: attempts > 1,
        locked: attempts === 3,
      },
    },
    submitted: false,
  };
}

function result(uid: string, pageNumber: number, score: number): PageResult {
  return {
    uid,
    pageNumber,
    score,
    startedAt: 100,
    submittedAt: 300,
    activeSeconds: 90,
    attempts: { [`p${String(pageNumber)}-q1`]: 2 },
    answers: { [`p${String(pageNumber)}-q1`]: '4' },
    submissionId: `${uid}:${String(pageNumber)}:300`,
  };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
});

describe('two-student classroom simulation', () => {
  it('covers guest transfer, registration, page access, persistence, relogin, dashboard, and CSV', async () => {
    expect(canAccessPage(1)).toBe(true);
    expect(canAccessPage(2)).toBe(false);
    await saveDraft({ ...draft('guest', 1, 2), pageNumber: 1 });
    await savePageResult({ ...result('guest', 1, 84), pageNumber: 1 });

    const studentA = await registerStudent({
      fullName: 'נועה כהן',
      username: 'noa',
      email: 'noa@example.test',
      password: 'student-a-password',
      className: 'ז1',
    });
    expect(canAccessPage(2)).toBe(true);
    expect((await claimGuestProgress(studentA.uid)).complete).toBe(true);
    await saveDraft(draft(studentA.uid, 2, 3));
    await savePageResult(result(studentA.uid, 2, 91));
    await logActivity({
      id: 'student-a-submit',
      uid: studentA.uid,
      pageNumber: 2,
      type: 'page_submit',
      createdAt: 300,
    });
    await logoutStudent();
    expect(canAccessPage(2)).toBe(false);
    const reloggedA = await loginStudent(
      'noa@example.test',
      'student-a-password',
    );
    expect(reloggedA.uid).toBe(studentA.uid);
    expect((await loadDraft(studentA.uid, 2))?.maxAttemptCount).toBe(3);

    await logoutStudent();
    const studentB = await registerStudent({
      fullName: 'אורי לוי',
      username: 'uri',
      email: 'uri@example.test',
      password: 'student-b-password',
      className: 'ז1',
    });
    await saveDraft(draft(studentB.uid, 2, 1));
    await savePageResult(result(studentB.uid, 2, 73));
    await logActivity({
      id: 'student-b-submit',
      uid: studentB.uid,
      pageNumber: 2,
      type: 'page_submit',
      createdAt: 301,
    });

    await logoutStudent();
    await registerStudent({
      fullName: 'מורה',
      username: 'teacher',
      email: 'yanivmiz77@gmail.com',
      password: 'teacher-password',
    });
    expect(currentSession()?.role).toBe('admin');
    const dashboard = await loadDashboard();
    expect(dashboard.source).toBe('local');
    expect(dashboard.students.map((student) => student.profile.uid).sort()).toEqual(
      [studentA.uid, studentB.uid].sort(),
    );
    expect(dashboard.students.every((student) => student.results.length > 0)).toBe(true);
    const csv = buildDashboardCsv(dashboard);
    expect(csv.trimEnd().split('\r\n')).toHaveLength(155);
    expect(csv).toContain(studentA.uid);
    expect(csv).toContain(studentB.uid);
    expect(csv).not.toContain(currentSession()?.uid || 'missing-admin');
  });

  it('retries failed central operations with stable activity identity until they succeed', async () => {
    let centralAvailable = false;
    const retriedActivityIds: string[] = [];
    const outcome = (): PersistenceOutcome =>
      centralAvailable
        ? { localSaved: true, central: 'saved' }
        : { localSaved: true, central: 'failed', error: 'offline' };
    const event: ActivityEvent = {
      id: 'stable-event-id',
      uid: 'student-a',
      pageNumber: 2,
      type: 'page_submit',
      createdAt: 300,
    };
    const plan = () => ({
      retryDraft: async () => outcome(),
      retryResult: async () => outcome(),
      pendingActivity: [event],
      retryActivity: async (candidate: ActivityEvent) => {
        retriedActivityIds.push(candidate.id || '');
        return outcome();
      },
    });
    const failed = await runSynchronizationRetry(plan());
    expect(failed.every((item) => item.central === 'failed')).toBe(true);
    centralAvailable = true;
    const saved = await runSynchronizationRetry(plan());
    expect(saved.every((item) => item.central === 'saved')).toBe(true);
    expect(retriedActivityIds).toEqual(['stable-event-id', 'stable-event-id']);
  });
});
