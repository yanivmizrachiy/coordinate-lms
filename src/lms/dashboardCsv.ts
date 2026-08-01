import type {
  ActivityEvent,
  DashboardSnapshot,
  DashboardStudent,
  PageResult,
} from './types';

export const DASHBOARD_CSV_COLUMNS = [
  'student_id',
  'full_name',
  'username',
  'email',
  'class_name',
  'school',
  'registered_at',
  'last_activity_at',
  'current_page',
  'latest_action',
  'total_active_seconds',
  'page_number',
  'page_status',
  'latest_score',
  'best_score',
  'submitted_at',
  'attempt_count',
  'draft_updated_at',
  'draft_submitted',
  'synchronization_error',
] as const;

function iso(value: number | undefined): string {
  if (!value || !Number.isFinite(value)) return '';
  return new Date(value).toISOString();
}

function latestActivityAt(student: DashboardStudent): number {
  return student.activity[0]?.createdAt || student.profile.lastSeenAt;
}

export function dashboardCurrentPage(student: DashboardStudent): number {
  const openDraft = [...student.drafts]
    .filter((draft) => !draft.submitted)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  if (openDraft) return openDraft.pageNumber;
  const latestResult = [...student.results].sort(
    (a, b) => b.submittedAt - a.submittedAt,
  )[0];
  return Math.min((latestResult?.pageNumber || 0) + 1, 77) || 1;
}

export function dashboardTotalActiveSeconds(student: DashboardStudent): number {
  const submittedPages = new Set(
    student.results.map((result) => result.pageNumber),
  );
  return (
    student.results.reduce((sum, result) => sum + result.activeSeconds, 0) +
    student.drafts
      .filter(
        (draft) =>
          !draft.submitted && !submittedPages.has(draft.pageNumber),
      )
      .reduce((sum, draft) => sum + draft.activeSeconds, 0)
  );
}

export function resultBestScore(result: PageResult): number {
  return result.bestScore ?? result.score;
}

export function resultLatestScore(result: PageResult): number {
  return result.latestScore ?? result.score;
}

export function resultAttemptCount(result: PageResult): number {
  return Math.max(0, ...Object.values(result.attempts));
}

export function activityCode(event: ActivityEvent | undefined): string {
  return event ? event.type + ':page-' + String(event.pageNumber) : '';
}

function protectSpreadsheetFormula(value: string): string {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

export function escapeCsvCell(value: unknown): string {
  const text = protectSpreadsheetFormula(String(value ?? ''));
  return '"' + text.replace(/"/g, '""') + '"';
}

export function buildDashboardCsv(snapshot: DashboardSnapshot): string {
  const rows: string[][] = [Array.from(DASHBOARD_CSV_COLUMNS)];

  for (const student of snapshot.students) {
    for (let pageNumber = 1; pageNumber <= 77; pageNumber += 1) {
      const result = student.results.find(
        (item) => item.pageNumber === pageNumber,
      );
      const draft = student.drafts.find(
        (item) => item.pageNumber === pageNumber,
      );
      const errors = student.syncErrors
        .filter((error) => error.pageNumber === pageNumber)
        .map((error) => error.message)
        .join(' | ');
      rows.push([
        student.profile.uid,
        student.profile.fullName,
        student.profile.username,
        student.profile.email,
        student.profile.className || '',
        student.profile.school || '',
        iso(student.profile.createdAt),
        iso(latestActivityAt(student)),
        String(dashboardCurrentPage(student)),
        activityCode(student.activity[0]),
        String(dashboardTotalActiveSeconds(student)),
        String(pageNumber),
        result ? 'submitted' : draft ? 'draft' : 'not-started',
        result ? String(resultLatestScore(result)) : '',
        result ? String(resultBestScore(result)) : '',
        result ? iso(result.submittedAt) : '',
        result ? String(resultAttemptCount(result)) : '0',
        draft ? iso(draft.updatedAt) : '',
        draft ? String(draft.submitted) : 'false',
        errors,
      ]);
    }
  }

  return (
    '\uFEFF' +
    rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n') +
    '\r\n'
  );
}
