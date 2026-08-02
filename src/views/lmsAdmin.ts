import { elem } from '../lib/dom';
import { currentSession } from '../lms/auth';
import { firebaseConfigured } from '../lms/firebase';
import {
  buildDashboardCsv,
  dashboardCurrentPage,
  dashboardTotalActiveSeconds,
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

function latestActivityAt(student: DashboardStudent): number {
  return (
    student.activity[0]?.createdAt ||
    student.profile.lastSeenAt
  );
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

    const tableWrap = elem('div', {
      class: 'lms-tablewrap',
    });

    const table = elem('table', {
      class: 'lms-table',
    });

    const head = elem('thead');
    const headRow = elem('tr');

    for (const label of [
      'שם',
      'כיתה',
      'נרשם',
      'פעילות אחרונה',
      'עמוד נוכחי',
      'הוגשו',
      'ממוצע',
      'זמן פעיל',
      'מה עשה לאחרונה',
      'ציונים',
    ]) {
      headRow.append(elem('th', { text: label }));
    }

    head.append(headRow);
    table.append(head);

    const body = elem('tbody');

    if (snapshot.students.length === 0) {
      const emptyRow = elem('tr');
      emptyRow.append(
        elem('td', {
          colspan: '10',
          text: 'עדיין אין תלמידים רשומים.',
        }),
      );
      body.append(emptyRow);
    }

    for (const student of snapshot.students) {
      const row = elem('tr');

      const identity = elem('td');
      identity.append(
        elem('strong', {
          text: student.profile.fullName,
        }),
        elem('small', {
          text:
            student.profile.username +
            ' · ' +
            student.profile.email,
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
            '/3)',
        )
        .join(', ');

      const studentErrors = student.syncErrors
        .map((error) => error.message)
        .join(' ');

      row.append(
        identity,
        elem('td', {
          text: student.profile.className || '—',
        }),
        elem('td', {
          text: formatDate(student.profile.createdAt),
        }),
        elem('td', {
          text: formatDate(latestActivityAt(student)),
        }),
        elem('td', {
          text: String(currentPage(student)),
        }),
        elem('td', {
          text: String(student.results.length),
        }),
        elem('td', {
          text: String(averageScore(student)),
        }),
        elem('td', {
          text: formatDuration(
            totalActiveSeconds(student),
          ),
        }),
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

      body.append(row);
    }

    table.append(body);
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
      tableWrap,
      elem('p', {
        class: 'lms-admin__generated',
        text:
          'עודכן: ' +
          formatDate(snapshot.generatedAt),
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
