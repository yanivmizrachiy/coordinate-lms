import { elem } from '../lib/dom';
import { currentSession } from '../lms/auth';
import {
  loadUserDrafts,
  loadUserResults,
} from '../lms/repository';
import { TOTAL_PAGES } from '../data/workbook';
import { navigate } from '../router';
import type { PageDraft, PageResult } from '../lms/types';
import type { ViewContext } from './context';

function duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return String(hours) + ' שעות ו־' + String(minutes) + ' דקות';
  return String(minutes) + ' דקות';
}

function average(results: PageResult[]): number {
  if (results.length === 0) return 0;

  return Math.round(
    results.reduce((sum, result) => sum + result.score, 0) /
      results.length,
  );
}

function nextPage(
  results: PageResult[],
  drafts: PageDraft[],
): number {
  const submitted = new Set(results.map((item) => item.pageNumber));

  for (let page = 1; page <= TOTAL_PAGES; page += 1) {
    if (!submitted.has(page)) return page;
  }

  const lastDraft = [...drafts].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  )[0];

  return lastDraft?.pageNumber || TOTAL_PAGES;
}

export function lmsProgress({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('ההתקדמות שלי');

  const session = currentSession();
  const shell = elem('div', {
    class: 'container lms-progress',
  });

  if (!session) {
    const gate = elem(
      'section',
      { class: 'lms-gate' },
      elem('h1', { text: 'יש להתחבר כדי לראות התקדמות' }),
      elem('p', {
        text: 'עמוד 1 פתוח ללא הרשמה. ההתקדמות המלאה נשמרת לאחר יצירת חשבון.',
      }),
    );

    const login = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'הרשמה או התחברות',
    });

    login.addEventListener('click', () => navigate('#/login'));
    gate.append(login);
    shell.append(gate);
    outlet.append(shell);
    return;
  }

  const loading = elem('div', {
    class: 'lms-loading',
    text: 'טוען את ההתקדמות…',
  });

  shell.append(loading);
  outlet.append(shell);

  void Promise.all([
    loadUserResults(session.uid),
    loadUserDrafts(session.uid),
  ]).then(([results, drafts]) => {
    const activeSeconds = results.reduce(
      (sum, result) => sum + result.activeSeconds,
      0,
    );

    const continuePage = nextPage(results, drafts);
    const head = elem('header', {
      class: 'lms-progress__head',
    });

    head.append(
      elem('div', {},
        elem('h1', {
          text: 'ההתקדמות של ' + session.fullName,
        }),
        elem('p', {
          text: 'ציונים, זמן עבודה והעמוד הבא בתרגול.',
        }),
      ),
    );

    const actions = elem('div', {
      class: 'lms-progress__actions',
    });

    const continueButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'המשך לעמוד ' + String(continuePage),
    });

    continueButton.addEventListener('click', () => {
      navigate('#/workbook/' + String(continuePage));
    });

    const accountButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'החשבון שלי',
    });

    accountButton.addEventListener('click', () => {
      navigate('#/login');
    });

    actions.append(continueButton, accountButton);
    head.append(actions);

    const summary = elem('div', {
      class: 'lms-summary',
    });

    summary.append(
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', { text: String(results.length) }),
        elem('span', { text: 'עמודים שהוגשו' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', { text: String(average(results)) }),
        elem('span', { text: 'ממוצע ציונים' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', { text: duration(activeSeconds) }),
        elem('span', { text: 'זמן עבודה פעיל' }),
      ),
    );

    const list = elem('div', {
      class: 'lms-progress__list',
    });

    for (let page = 1; page <= TOTAL_PAGES; page += 1) {
      const result = results.find(
        (item) => item.pageNumber === page,
      );

      const draft = drafts.find(
        (item) => item.pageNumber === page,
      );

      const row = elem('button', {
        class:
          'lms-progress__row ' +
          (result
            ? 'lms-progress__row--done'
            : draft
              ? 'lms-progress__row--draft'
              : ''),
        type: 'button',
      });

      row.addEventListener('click', () => {
        navigate('#/workbook/' + String(page));
      });

      row.append(
        elem('span', {
          class: 'lms-progress__page',
          text: 'עמוד ' + String(page),
        }),
        elem('span', {
          class: 'lms-progress__state',
          text: result
            ? 'הוגש'
            : draft
              ? 'טיוטה'
              : 'טרם התחיל',
        }),
        elem('strong', {
          class: 'lms-progress__score',
          text: result ? String(result.score) : '—',
        }),
      );

      list.append(row);
    }

    shell.replaceChildren(head, summary, list);
  });
}
