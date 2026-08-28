import { elem } from '../lib/dom';
import { currentSession } from '../lms/auth';
import { LMS_CONFIG } from '../lms/config';
import { firebaseConfigured } from '../lms/firebase';
import {
  buildDashboardCsv,
  dashboardCurrentPage,
  dashboardTotalActiveSeconds,
  latestActivityAt,
  resultAttemptCount,
  resultBestScore,
  resultLatestScore,
} from '../lms/dashboardCsv';
import { loadDashboard } from '../lms/repository';
import type {
  ActivityEvent,
  DashboardSnapshot,
  DashboardStudent,
} from '../lms/types';
import { navigate } from '../router';
import type { ViewContext } from './context';

function formatDate(value: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return (
      String(hours) +
      ':' +
      String(minutes).padStart(2, '0') +
      ':' +
      String(remainingSeconds).padStart(2, '0')
    );
  }

  return (
    String(minutes) +
    ':' +
    String(remainingSeconds).padStart(2, '0')
  );
}

function averageScore(student: DashboardStudent): number {
  if (student.results.length === 0) return 0;

  return Math.round(
    student.results.reduce(
      (sum, result) => sum + result.score,
      0,
    ) / student.results.length,
  );
}

function totalActiveSeconds(
  student: DashboardStudent,
): number {
  return dashboardTotalActiveSeconds(student);
}

function currentPage(student: DashboardStudent): number {
  return dashboardCurrentPage(student);
}

function activityLabel(event?: ActivityEvent): string {
  if (!event) return 'אין פעילות מתועדת';

  const labels: Record<ActivityEvent['type'], string> = {
    page_open: 'פתח עמוד',
    answer_change: 'כתב תשובה',
    answer_check: 'בדק תשובות',
    page_submit: 'הגיש עמוד',
    page_leave: 'עזב עמוד',
    heartbeat: 'עבד בתרגול',
    registration: 'נרשם',
    login: 'התחבר',
  };

  return (
    labels[event.type] +
    ' ' +
    String(event.pageNumber) +
    ' · ' +
    formatDate(event.createdAt)
  );
}

function exportCsv(snapshot: DashboardSnapshot): void {
  const csv = buildDashboardCsv(snapshot);

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'coordinate-lms-students.csv';
  anchor.click();

  URL.revokeObjectURL(url);
}

/* A teacher scans this by name, by who is behind, and by who is active —
   so every measurable column is sortable, and a search box narrows a full
   class to one student. The two rightmost columns are free-text detail and
   are not sortable. `sortValue` returns a number for numeric columns and a
   Hebrew-lowercased string for text ones. */
type SortKey =
  | 'name'
  | 'class'
  | 'registered'
  | 'activity'
  | 'page'
  | 'submitted'
  | 'average'
  | 'time';

interface Column {
  label: string;
  key?: SortKey;
  sortValue?: (student: DashboardStudent) => number | string;
}

const COLUMNS: Column[] = [
  { label: 'שם', key: 'name', sortValue: (s) => s.profile.fullName.toLocaleLowerCase('he') },
  { label: 'כיתה', key: 'class', sortValue: (s) => (s.profile.className || '').toLocaleLowerCase('he') },
  { label: 'נרשם', key: 'registered', sortValue: (s) => s.profile.createdAt },
  { label: 'פעילות אחרונה', key: 'activity', sortValue: (s) => latestActivityAt(s) },
  { label: 'עמוד נוכחי', key: 'page', sortValue: (s) => currentPage(s) },
  { label: 'הוגשו', key: 'submitted', sortValue: (s) => s.results.length },
  { label: 'ממוצע', key: 'average', sortValue: (s) => averageScore(s) },
  { label: 'זמן פעיל', key: 'time', sortValue: (s) => totalActiveSeconds(s) },
  { label: 'מה עשה לאחרונה' },
  { label: 'ציונים' },
];

function studentMatchesQuery(student: DashboardStudent, query: string): boolean {
  if (!query) return true;
  return [
    student.profile.fullName,
    student.profile.username,
    student.profile.email,
    student.profile.className || '',
  ].some((field) => field.toLocaleLowerCase('he').includes(query));
}

function compareStudents(
  a: DashboardStudent,
  b: DashboardStudent,
  key: SortKey,
): number {
  const column = COLUMNS.find((c) => c.key === key);
  const value = column?.sortValue;
  if (!value) return 0;
  const av = value(a);
  const bv = value(b);
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av).localeCompare(String(bv), 'he');
}

function buildStudentRow(student: DashboardStudent): HTMLElement {
  const row = elem('tr');

  const identity = elem('td');
  identity.append(
    elem('strong', { text: student.profile.fullName }),
    elem('small', {
      text: student.profile.username + ' · ' + student.profile.email,
    }),
  );

  const details = student.results
    .map(
      (result) =>
        'עמוד ' +
        String(result.pageNumber) +
        ': אחרון ' +
        String(resultLatestScore(result)) +
        ' · מיטבי ' +
        String(resultBestScore(result)) +
        ' · ניסיונות ' +
        String(resultAttemptCount(result)),
    )
    .join(', ');

  const openDrafts = student.drafts
    .filter((draft) => !draft.submitted)
    .map(
      (draft) =>
        'עמוד ' +
        String(draft.pageNumber) +
        ' (' +
        String(draft.maxAttemptCount || 0) +
        '/' +
        String(LMS_CONFIG.maxAttempts) +
        ')',
    )
    .join(', ');

  const studentErrors = student.syncErrors
    .map((error) => error.message)
    .join(' ');

  row.append(
    identity,
    elem('td', { text: student.profile.className || '—' }),
    elem('td', { text: formatDate(student.profile.createdAt) }),
    elem('td', { text: formatDate(latestActivityAt(student)) }),
    elem('td', { text: String(currentPage(student)) }),
    elem('td', { text: String(student.results.length) }),
    elem('td', { text: String(averageScore(student)) }),
    elem('td', { text: formatDuration(totalActiveSeconds(student)) }),
    elem('td', {
      class: 'lms-table__details',
      text: activityLabel(student.activity[0]),
    }),
    elem('td', {
      class: 'lms-table__details',
      text:
        (details || 'טרם הוגש עמוד') +
        (openDrafts ? ' · טיוטות פעילות: ' + openDrafts : '') +
        (studentErrors ? ' · שגיאת סנכרון: ' + studentErrors : ''),
    }),
  );

  return row;
}

export function lmsAdmin({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('דשבורד מורה');

  const session = currentSession();
  const shell = elem('div', {
    class: 'container lms-admin',
  });

  if (!session || session.role !== 'admin') {
    const gate = elem(
      'section',
      { class: 'lms-gate' },
      elem('h1', {
        text: 'הגישה לדשבורד מיועדת למנהל',
      }),
      elem('p', {
        text:
          'יש להתחבר באמצעות כתובת האימייל שהוגדרה כמנהל המערכת.',
      }),
    );

    const loginButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'מעבר להתחברות',
    });

    loginButton.addEventListener('click', () => {
      navigate('#/login');
    });

    gate.append(loginButton);
    shell.append(gate);
    outlet.append(shell);
    return;
  }

  const header = elem('header', {
    class: 'lms-admin__header',
  });

  header.append(
    elem(
      'div',
      {},
      elem('h1', { text: 'דשבורד מורה' }),
      elem('p', {
        text:
          'תלמידים, זמני כניסה, פעילות, טיוטות, ציונים והתקדמות בכל עמוד.',
      }),
    ),
  );

  const controls = elem('div', {
    class: 'lms-admin__controls',
  });

  const refreshButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'רענון נתונים',
  });

  const exportButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'ייצוא CSV מלא',
    disabled: 'true',
  }) as HTMLButtonElement;

  const workbookButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'פתיחת החוברת',
  });

  workbookButton.addEventListener('click', () => {
    navigate('#/workbook/1');
  });

  controls.append(
    refreshButton,
    exportButton,
    workbookButton,
  );

  header.append(controls);

  const connection = elem('div', {
    class: firebaseConfigured
      ? 'lms-mode lms-mode--online'
      : 'lms-mode lms-mode--local',
    text: firebaseConfigured
      ? 'מקור הנתונים המרכזי: Firebase'
      : 'Firebase אינו מוגדר — אין כרגע דשבורד משותף בין מכשירים',
  });

  const content = elem('div', {
    class: 'lms-admin__content',
  });

  let currentSnapshot: DashboardSnapshot | null = null;
  let sortKey: SortKey = 'name';
  let sortDir: 1 | -1 = 1;
  let query = '';
  /* Repaint callbacks for the sortable header arrows, rebuilt on every full
     render; the header click handlers close over this stable variable. */
  let headerPainters: Array<() => void> = [];

  async function renderDashboard(): Promise<void> {
    content.replaceChildren(
      elem('div', {
        class: 'lms-loading',
        text: 'טוען נתוני תלמידים…',
      }),
    );

    let snapshot: DashboardSnapshot;

    try {
      snapshot = await loadDashboard();
    } catch {
      currentSnapshot = null;
      exportButton.disabled = true;
      connection.className = 'lms-mode lms-mode--local';
      connection.textContent = 'טעינת הדשבורד נכשלה — נסו לרענן.';
      content.replaceChildren(
        elem('div', {
          class: 'lms-panel__status',
          text: 'לא ניתן לטעון כרגע את נתוני התלמידים. הנתונים לא יוצגו עד לטעינה תקינה.',
          'data-kind': 'error',
          role: 'alert',
        }),
      );
      return;
    }

    currentSnapshot = snapshot;
    exportButton.disabled = snapshot.students.length === 0;
    connection.className =
      snapshot.source === 'firebase'
        ? 'lms-mode lms-mode--online'
        : 'lms-mode lms-mode--local';
    connection.textContent =
      snapshot.source === 'firebase'
        ? 'מקור הנתונים המרכזי: Firebase'
        : firebaseConfigured
          ? 'המקור המרכזי אינו זמין — מוצגים נתונים מקומיים חלקיים בלבד'
          : 'Firebase אינו מוגדר — מוצגים נתונים מהמכשיר הזה בלבד';

    const resultCount = snapshot.students.reduce(
      (sum, student) => sum + student.results.length,
      0,
    );

    const activeStudentCount = snapshot.students.filter(
      (student) =>
        Date.now() - latestActivityAt(student) <= 15 * 60 * 1000,
    ).length;

    const summary = elem('div', {
      class: 'lms-summary',
    });

    summary.append(
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(snapshot.students.length),
        }),
        elem('span', { text: 'תלמידים רשומים' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(activeStudentCount),
        }),
        elem('span', { text: 'פעילים ב־15 דקות האחרונות' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(resultCount),
        }),
        elem('span', { text: 'עמודים שהוגשו' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text:
            snapshot.source === 'firebase'
              ? 'מרכזי'
              : 'מקומי',
        }),
        elem('span', { text: 'מקור נתונים' }),
      ),
    );

    const body = elem('tbody');
    const countNote = elem('span', { class: 'lms-admin__count' });

    /* Re-draws only the rows and the count — the header, search box and
       summary stay put while the teacher sorts or searches. */
    function renderRows(): void {
      const visible = snapshot.students
        .filter((student) => studentMatchesQuery(student, query))
        .sort((a, b) => compareStudents(a, b, sortKey) * sortDir);

      body.replaceChildren();

      if (snapshot.students.length === 0) {
        countNote.textContent = '';
        const emptyRow = elem('tr');
        emptyRow.append(
          elem('td', {
            colspan: String(COLUMNS.length),
            text: 'עדיין אין תלמידים רשומים.',
          }),
        );
        body.append(emptyRow);
        return;
      }

      countNote.textContent = query
        ? 'מציג ' +
          String(visible.length) +
          ' מתוך ' +
          String(snapshot.students.length) +
          ' תלמידים'
        : String(snapshot.students.length) + ' תלמידים';

      if (visible.length === 0) {
        const emptyRow = elem('tr');
        emptyRow.append(
          elem('td', {
            colspan: String(COLUMNS.length),
            text: 'אין תלמיד שמתאים לחיפוש.',
          }),
        );
        body.append(emptyRow);
        return;
      }

      for (const student of visible) {
        body.append(buildStudentRow(student));
      }
    }

    const table = elem('table', { class: 'lms-table' });
    const head = elem('thead');
    const headRow = elem('tr');

    headerPainters = [];
    for (const column of COLUMNS) {
      const th = elem('th');
      if (column.key) {
        const key = column.key;
        th.classList.add('is-sortable');
        const button = elem('button', {
          type: 'button',
          class: 'lms-sort',
        });
        const arrow = elem('span', { class: 'lms-sort__arrow', 'aria-hidden': 'true' });
        button.append(document.createTextNode(column.label + ' '), arrow);

        const paint = (): void => {
          const active = sortKey === key;
          th.setAttribute('aria-sort', active ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
          button.classList.toggle('is-active', active);
          arrow.textContent = active ? (sortDir === 1 ? '↑' : '↓') : '';
        };

        button.addEventListener('click', () => {
          if (sortKey === key) {
            sortDir = sortDir === 1 ? -1 : 1;
          } else {
            sortKey = key;
            sortDir = 1;
          }
          for (const repaint of headerPainters) repaint();
          renderRows();
        });

        headerPainters.push(paint);
        th.append(button);
      } else {
        th.textContent = column.label;
      }
      headRow.append(th);
    }

    head.append(headRow);
    table.append(head, body);

    const search = elem('input', {
      class: 'lms-admin__search',
      type: 'search',
      placeholder: 'חיפוש לפי שם, כיתה או אימייל',
      'aria-label': 'חיפוש תלמיד',
    }) as HTMLInputElement;
    search.value = query;
    search.addEventListener('input', () => {
      query = search.value.trim().toLocaleLowerCase('he');
      renderRows();
    });

    const filterBar = elem('div', { class: 'lms-admin__filter' });
    filterBar.append(search, countNote);

    for (const paint of headerPainters) paint();
    renderRows();

    const tableWrap = elem('div', { class: 'lms-tablewrap' });
    tableWrap.append(table);

    const syncAlert = snapshot.syncErrors.length > 0
      ? elem('div', {
          class: 'lms-panel__status',
          text:
            snapshot.syncErrors[0]?.message ||
            'קיימות שגיאות סנכרון. הנתונים המוצגים עשויים להיות חלקיים.',
          'data-kind': 'error',
          role: 'alert',
        })
      : null;

    content.replaceChildren(
      ...(syncAlert ? [syncAlert] : []),
      summary,
      filterBar,
      tableWrap,
      elem('p', {
        class: 'lms-admin__generated',
        text: 'עודכן: ' + formatDate(snapshot.generatedAt),
      }),
    );
  }

  refreshButton.addEventListener('click', () => {
    void renderDashboard();
  });

  exportButton.addEventListener('click', () => {
    if (currentSnapshot) {
      exportCsv(currentSnapshot);
    }
  });

  shell.append(header, connection, content);
  outlet.append(shell);

  void renderDashboard();
}
