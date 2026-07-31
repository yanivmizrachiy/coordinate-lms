import { elem } from '../lib/dom';
import { currentSession } from '../lms/auth';
import {
  loadAnswerKey,
  saveAnswerKey,
} from '../lms/repository';
import {
  TOTAL_PAGES,
  WORKBOOK,
} from '../data/workbook';
import { navigate } from '../router';
import type { AnswerKey } from '../lms/types';
import type { ViewContext } from './context';

const TARGET_SELECTOR =
  '.blank, .word-blank, .pair-blank';

interface TargetInfo {
  qid: string;
  kind: string;
  context: string;
  answers: string[];
}

interface PageKeyInfo {
  pageNumber: number;
  title: string;
  targets: TargetInfo[];
}

function contextFor(target: HTMLElement): string {
  const contextNode =
    target.closest(
      'li, .completion-sentence, .calc-ltr, .calc-final, h3, p',
    ) || target.parentElement;

  return (contextNode?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

function manifestFor(
  pageNumber: number,
  html: string,
  key: AnswerKey,
): PageKeyInfo {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  const targets = Array.from(
    template.content.querySelectorAll<HTMLElement>(
      TARGET_SELECTOR,
    ),
  ).map((target, index) => {
    const qid =
      'p' +
      String(pageNumber) +
      '-q' +
      String(index + 1);

    return {
      qid,
      kind:
        target.dataset.missing ||
        (target.classList.contains('pair-blank')
          ? 'pair'
          : 'text'),
      context: contextFor(target),
      answers: key[qid] || [],
    };
  });

  return {
    pageNumber,
    title: WORKBOOK[pageNumber - 1]?.title || '',
    targets,
  };
}

function download(
  fileName: string,
  value: unknown,
): void {
  const blob = new Blob(
    [JSON.stringify(value, null, 2)],
    { type: 'application/json;charset=utf-8' },
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function lmsKeys({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('סטודיו מפתחות תשובה');

  const session = currentSession();
  const shell = elem('div', {
    class: 'container lms-keys',
  });

  if (!session || session.role !== 'admin') {
    const gate = elem(
      'section',
      { class: 'lms-gate' },
      elem('h1', {
        text: 'סטודיו מפתחות התשובה מיועד למנהל',
      }),
      elem('p', {
        text: 'יש להתחבר באמצעות חשבון המנהל.',
      }),
    );

    const login = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'מעבר להתחברות',
    });

    login.addEventListener('click', () => {
      navigate('#/login');
    });

    gate.append(login);
    shell.append(gate);
    outlet.append(shell);
    return;
  }

  const header = elem('header', {
    class: 'lms-keys__head',
  });

  header.append(
    elem('div', {},
      elem('h1', {
        text: 'סטודיו מפתחות תשובה',
      }),
      elem('p', {
        text:
          'מיפוי כל אזורי המענה ב־77 העמודים, ייצוא תבנית, ייבוא תשובות ומעבר ישיר לכל דף.',
      }),
    ),
  );

  const toolbar = elem('div', {
    class: 'lms-keys__toolbar',
  });

  const exportTemplate = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'ייצוא תבנית מלאה',
  });

  const exportKeys = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'ייצוא המפתחות הקיימים',
  });

  const importInput = elem('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: 'true',
  }) as HTMLInputElement;

  const importButton = elem('button', {
    class: 'btn btn--teacher',
    type: 'button',
    text: 'ייבוא מפתחות JSON',
  });

  importButton.addEventListener('click', () => {
    importInput.click();
  });

  toolbar.append(
    exportTemplate,
    exportKeys,
    importButton,
    importInput,
  );

  header.append(toolbar);

  const status = elem('div', {
    class: 'lms-panel__status',
    text: 'סורק את כל העמודים…',
  });

  const content = elem('div', {
    class: 'lms-keys__content',
  });

  shell.append(header, status, content);
  outlet.append(shell);

  let pages: PageKeyInfo[] = [];

  function render(): void {
    const totalTargets = pages.reduce(
      (sum, page) => sum + page.targets.length,
      0,
    );

    const keyedTargets = pages.reduce(
      (sum, page) =>
        sum +
        page.targets.filter(
          (target) => target.answers.length > 0,
        ).length,
      0,
    );

    status.textContent =
      'מופו ' +
      String(totalTargets) +
      ' אזורי מענה. הוגדרו תשובות ל־' +
      String(keyedTargets) +
      '.';

    status.dataset.kind =
      keyedTargets === totalTargets
        ? 'success'
        : 'normal';

    const summary = elem('div', {
      class: 'lms-summary',
    });

    summary.append(
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(TOTAL_PAGES),
        }),
        elem('span', { text: 'עמודים' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(totalTargets),
        }),
        elem('span', { text: 'אזורי מענה' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text:
            totalTargets === 0
              ? '0%'
              : String(
                  Math.round(
                    (keyedTargets / totalTargets) * 100,
                  ),
                ) + '%',
        }),
        elem('span', { text: 'כיסוי מפתחות' }),
      ),
    );

    const grid = elem('div', {
      class: 'lms-keys__grid',
    });

    for (const page of pages) {
      const keyed = page.targets.filter(
        (target) => target.answers.length > 0,
      ).length;

      const card = elem('section', {
        class: 'lms-keys__card',
      });

      const open = elem('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'פתיחת העמוד',
      });

      open.addEventListener('click', () => {
        navigate(
          '#/workbook/' + String(page.pageNumber),
        );
      });

      card.append(
        elem('h2', {
          text:
            'עמוד ' +
            String(page.pageNumber) +
            ' — ' +
            page.title,
        }),
        elem('p', {
          text:
            String(keyed) +
            ' מתוך ' +
            String(page.targets.length) +
            ' תשובות הוגדרו',
        }),
        open,
      );

      if (page.targets.length > 0) {
        const details = elem('details');
        details.append(
          elem('summary', {
            text: 'הצגת אזורי המענה',
          }),
        );

        const list = elem('ol');

        for (const target of page.targets) {
          list.append(
            elem(
              'li',
              {},
              elem('code', { text: target.qid }),
              elem('span', {
                text:
                  ' [' +
                  target.kind +
                  '] ' +
                  (target.context || 'ללא הקשר טקסטואלי'),
              }),
              elem('strong', {
                text:
                  target.answers.length > 0
                    ? ' ✓ ' + target.answers.join(' / ')
                    : ' — טרם הוגדר',
              }),
            ),
          );
        }

        details.append(list);
        card.append(details);
      }

      grid.append(card);
    }

    content.replaceChildren(summary, grid);
  }

  void (async () => {
    const collected: PageKeyInfo[] = [];

    for (
      let pageNumber = 1;
      pageNumber <= TOTAL_PAGES;
      pageNumber += 1
    ) {
      status.textContent =
        'סורק עמוד ' +
        String(pageNumber) +
        ' מתוך ' +
        String(TOTAL_PAGES) +
        '…';

      const key = await loadAnswerKey(pageNumber);
      const page = WORKBOOK[pageNumber - 1];

      if (page) {
        collected.push(
          manifestFor(pageNumber, page.html, key),
        );
      }
    }

    pages = collected;
    render();
  })();

  exportTemplate.addEventListener('click', () => {
    download(
      'coordinate-lms-answer-key-template.json',
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        pages,
      },
    );
  });

  exportKeys.addEventListener('click', () => {
    const keys: Record<string, AnswerKey> = {};

    for (const page of pages) {
      const key: AnswerKey = {};

      for (const target of page.targets) {
        if (target.answers.length > 0) {
          key[target.qid] = target.answers;
        }
      }

      keys[String(page.pageNumber)] = key;
    }

    download(
      'coordinate-lms-answer-keys.json',
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        keys,
      },
    );
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (!file) return;

    void file.text()
      .then((text) => JSON.parse(text) as {
        keys?: Record<string, AnswerKey>;
        pages?: PageKeyInfo[];
      })
      .then(async (data) => {
        const bundle: Record<string, AnswerKey> = {};

        if (data.keys) {
          Object.assign(bundle, data.keys);
        }

        if (data.pages) {
          for (const page of data.pages) {
            const key: AnswerKey = {};

            for (const target of page.targets) {
              if (target.answers.length > 0) {
                key[target.qid] = target.answers;
              }
            }

            bundle[String(page.pageNumber)] = key;
          }
        }

        let saved = 0;

        for (const [page, key] of Object.entries(bundle)) {
          await saveAnswerKey(Number(page), key);
          saved += 1;
        }

        status.textContent =
          'נשמרו מפתחות עבור ' +
          String(saved) +
          ' עמודים. מרענן…';
        status.dataset.kind = 'success';
        window.setTimeout(() => location.reload(), 500);
      })
      .catch((error: unknown) => {
        status.textContent =
          error instanceof Error
            ? error.message
            : 'ייבוא הקובץ נכשל.';
        status.dataset.kind = 'error';
      });
  });
}
