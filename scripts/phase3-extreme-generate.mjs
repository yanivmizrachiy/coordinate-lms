import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

const root = process.cwd();

function absolutePath(path) {
  return isAbsolute(path) ? path : join(root, path);
}

function read(path) {
  return readFileSync(absolutePath(path), 'utf8')
    .replace(/\r\n/g, '\n');
}

function write(path, content) {
  const absolute = absolutePath(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(
    absolute,
    content.replace(/^\n/, '').replace(/\s+$/, '') + '\n',
    'utf8',
  );
  console.log('WRITE', path);
}

function patch(path, search, replacement) {
  const source = read(path);

  if (source.includes(replacement)) {
    console.log('SKIP', path);
    return;
  }

  if (!source.includes(search)) {
    throw new Error(`Patch target missing in ${path}:\n${search}`);
  }

  write(path, source.replace(search, replacement));
}

write(
  'src/views/lmsProgress.ts',
  String.raw`
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
`,
);

write(
  'src/views/lmsKeys.ts',
  String.raw`
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
`,
);

const repositoryMarker = 'export async function loadUserResults(';
let repository = read('src/lms/repository.ts');

if (!repository.includes(repositoryMarker)) {
  repository += String.raw`

export async function loadUserResults(
  uid: string,
): Promise<PageResult[]> {
  const localResults = Object.values(
    loadMap<PageResult>(RESULTS_KEY),
  ).filter((result) => result.uid === uid);

  if (!db || uid === 'guest') {
    return localResults.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }

  try {
    const snapshot = await getDocs(
      collection(db, 'students', uid, 'results'),
    );

    const merged = new Map<number, PageResult>();

    for (const result of localResults) {
      merged.set(result.pageNumber, result);
    }

    for (const document of snapshot.docs) {
      const result = document.data() as PageResult;
      merged.set(result.pageNumber, result);
    }

    return [...merged.values()].sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  } catch {
    return localResults.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }
}

export async function loadUserDrafts(
  uid: string,
): Promise<PageDraft[]> {
  const localDrafts = Object.values(
    loadMap<PageDraft>(DRAFTS_KEY),
  ).filter((draft) => draft.uid === uid);

  if (!db || uid === 'guest') {
    return localDrafts.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }

  try {
    const snapshot = await getDocs(
      collection(db, 'students', uid, 'drafts'),
    );

    const merged = new Map<number, PageDraft>();

    for (const draft of localDrafts) {
      merged.set(draft.pageNumber, draft);
    }

    for (const document of snapshot.docs) {
      const draft = document.data() as PageDraft;
      merged.set(draft.pageNumber, draft);
    }

    return [...merged.values()].sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  } catch {
    return localDrafts.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }
}
`;

  write('src/lms/repository.ts', repository);
}

write(
  'src/router.ts',
  String.raw`
/* Hash router for the workbook and LMS screens. */
export interface RouteMatch {
  name:
    | 'home'
    | 'menu'
    | 'page'
    | 'book'
    | 'print'
    | 'login'
    | 'admin'
    | 'progress'
    | 'keys';
  params: Record<string, string>;
}

export function parseHash(hash: string): RouteMatch {
  const path = hash.replace(/^#/, '');
  const parts = path.split('/').filter(Boolean);
  const [head, sub] = parts;

  if (head === 'menu') return { name: 'menu', params: {} };
  if (head === 'login') return { name: 'login', params: {} };
  if (head === 'admin') return { name: 'admin', params: {} };
  if (head === 'progress') return { name: 'progress', params: {} };
  if (head === 'keys') return { name: 'keys', params: {} };
  if (head === 'workbook') {
    return sub
      ? { name: 'page', params: { n: sub } }
      : { name: 'book', params: {} };
  }
  if (head === 'book') return { name: 'book', params: {} };
  if (head === 'print') return { name: 'print', params: {} };
  if (head === 'games') return { name: 'book', params: {} };

  return { name: 'home', params: {} };
}

export const navigate = (to: string): void => {
  if (location.hash === to) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = to;
  }
};

export function startRouter(
  onChange: (match: RouteMatch) => void,
): void {
  const handler = (): void => onChange(parseHash(location.hash));
  window.addEventListener('hashchange', handler);
  handler();
}
`,
);

let main = read('src/main.ts');

if (!main.includes("import './styles/lms.css';")) {
  main = main.replace(
    "import './styles/grayscale.css';",
    [
      "import './styles/grayscale.css';",
      "import './styles/lms.css';",
    ].join('\n'),
  );
}

if (!main.includes("import './styles/lms-phase3.css';")) {
  main = main.replace(
    "import './styles/lms.css';",
    [
      "import './styles/lms.css';",
      "import './styles/lms-phase3.css';",
    ].join('\n'),
  );
}

if (!main.includes("import { lmsLogin } from './views/lmsLogin';")) {
  main = main.replace(
    "import { ensureFreshBuild } from './lib/freshBuild';",
    [
      "import { ensureFreshBuild } from './lib/freshBuild';",
      "import { lmsLogin } from './views/lmsLogin';",
      "import { lmsAdmin } from './views/lmsAdmin';",
      "import { lmsProgress } from './views/lmsProgress';",
      "import { lmsKeys } from './views/lmsKeys';",
    ].join('\n'),
  );
}

if (!main.includes("case 'login': return lmsLogin;")) {
  main = main.replace(
    "    case 'print': return book;",
    [
      "    case 'print': return book;",
      "    case 'login': return lmsLogin;",
      "    case 'admin': return lmsAdmin;",
      "    case 'progress': return lmsProgress;",
      "    case 'keys': return lmsKeys;",
    ].join('\n'),
  );
}

if (
  !main.includes("case 'login': return lmsLogin;") ||
  !main.includes("case 'progress': return lmsProgress;") ||
  !main.includes("import './styles/lms-phase3.css';")
) {
  throw new Error('LMS routes/imports were not added to main.ts');
}

write('src/main.ts', main);

let pageViewer = read('src/views/pageViewer.ts');

if (!pageViewer.includes("from '../lms/engine';")) {
  pageViewer = pageViewer.replace(
    "import { goToContents } from './tocSheet';",
    [
      "import { goToContents } from './tocSheet';",
      "import {",
      "  attachLmsToPage,",
      "  canAccessPage,",
      "  renderAccessGate,",
      "} from '../lms/engine';",
    ].join('\n'),
  );
}

if (!pageViewer.includes('if (!canAccessPage(page))')) {
  pageViewer = pageViewer.replace(
    "    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);\n    lastPage.set(page);",
    [
      "    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);",
      "    if (!canAccessPage(page)) {",
      "      renderAccessGate(outlet, page);",
      "      return;",
      "    }",
      "    lastPage.set(page);",
    ].join('\n'),
  );
}

pageViewer = pageViewer.replace(
  "    let cleanup: (() => void) | undefined;",
  "    let gameCleanup: (() => void) | undefined;",
);
pageViewer = pageViewer.replace(
  "        if (host && g) cleanup = g.mount(host);",
  "        if (host && g) gameCleanup = g.mount(host);",
);

if (!pageViewer.includes('const lms = data')) {
  pageViewer = pageViewer.replace(
    [
      "    } else {",
      "      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));",
      "    }",
      "",
      "    /* The bottom row:",
    ].join('\n'),
    [
      "    } else {",
      "      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));",
      "    }",
      "",
      "    const lms = data",
      "      ? attachLmsToPage(sheetWrap, page)",
      "      : undefined;",
      "",
      "    /* The bottom row:",
    ].join('\n'),
  );
}

if (!pageViewer.includes('if (lms) viewer.append(lms.panel);')) {
  pageViewer = pageViewer.replace(
    "    viewer.append(readerBar(page), sheetWrap, nav);",
    [
      "    viewer.append(readerBar(page), sheetWrap);",
      "    if (lms) viewer.append(lms.panel);",
      "    viewer.append(nav);",
    ].join('\n'),
  );
}

pageViewer = pageViewer.replace(
  "      cleanup?.();",
  [
    "      gameCleanup?.();",
    "      lms?.cleanup();",
  ].join('\n'),
);

if (!pageViewer.includes('attachLmsToPage(sheetWrap, page)')) {
  throw new Error('LMS integration was not added to pageViewer.ts');
}

write('src/views/pageViewer.ts', pageViewer);

let menu = read('src/views/menu.ts');

if (!menu.includes("text: '✍️ התחלת תרגול מתוקשב'")) {
  menu = menu.replace(
    "  c.append(actions);\n\n  /* ---- paging: jump straight to any page ---- */",
    [
      "  c.append(actions);",
      "",
      "  const lmsActions = elem('div', { class: 'lms-menu-actions no-print' });",
      "  const practiceButton = elem('button', {",
      "    class: 'btn btn--gold',",
      "    type: 'button',",
      "    text: '✍️ התחלת תרגול מתוקשב',",
      "  });",
      "  practiceButton.addEventListener('click', () => navigate('#/workbook/1'));",
      "",
      "  const accountButton = elem('button', {",
      "    class: 'btn btn--ghost',",
      "    type: 'button',",
      "    text: '👤 הרשמה, התחברות והתקדמות',",
      "  });",
      "  accountButton.addEventListener('click', () => navigate('#/login'));",
      "",
      "  lmsActions.append(practiceButton, accountButton);",
      "  c.append(lmsActions);",
      "",
      "  /* ---- paging: jump straight to any page ---- */",
    ].join('\n'),
  );
}

if (!menu.includes("text: '✍️ התחלת תרגול מתוקשב'")) {
  throw new Error('LMS actions were not added to menu.ts');
}

write('src/views/menu.ts', menu);

let login = read('src/views/lmsLogin.ts');

if (!login.includes("text: 'ההתקדמות שלי'")) {
  login = login.replace(
    "    const adminButton = elem('button', {",
    [
      "    const progressButton = elem('button', {",
      "      class: 'btn btn--ghost',",
      "      type: 'button',",
      "      text: 'ההתקדמות שלי',",
      "    });",
      "",
      "    progressButton.addEventListener('click', () => {",
      "      navigate('#/progress');",
      "    });",
      "",
      "    const adminButton = elem('button', {",
    ].join('\n'),
  );

  login = login.replace(
    "    actions.append(continueButton);",
    "    actions.append(continueButton, progressButton);",
  );

  login = login.replace(
    "      actions.append(adminButton);",
    [
      "      actions.append(adminButton);",
      "      const keysButton = elem('button', {",
      "        class: 'btn btn--teacher',",
      "        type: 'button',",
      "        text: 'סטודיו מפתחות תשובה',",
      "      });",
      "      keysButton.addEventListener('click', () => {",
      "        navigate('#/keys');",
      "      });",
      "      actions.append(keysButton);",
    ].join('\n'),
  );

  write('src/views/lmsLogin.ts', login);
}

write(
  'src/styles/lms-phase3.css',
  String.raw`
.lms-progress,
.lms-keys {
  max-width: 1180px;
  margin: 24px auto;
}

.lms-progress__head,
.lms-keys__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 20px;
  border: 1px solid rgba(20, 40, 85, 0.15);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 14px 36px rgba(20, 40, 85, 0.1);
}

.lms-progress__actions,
.lms-keys__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.lms-progress__actions .btn,
.lms-keys__toolbar .btn {
  width: auto;
}

.lms-progress__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lms-progress__row {
  display: grid;
  grid-template-columns: 1fr auto 56px;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 10px 13px;
  border: 1px solid #d8e0ec;
  border-radius: 12px;
  background: #fff;
  color: #253653;
  text-align: right;
  cursor: pointer;
}

.lms-progress__row--done {
  border-color: #acd9ba;
  background: #edf9f1;
}

.lms-progress__row--draft {
  border-color: #e7ca78;
  background: #fff9e8;
}

.lms-progress__score {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 3px solid #c72637;
  border-radius: 50%;
  color: #c72637;
}

.lms-keys__content {
  margin-top: 16px;
}

.lms-keys__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.lms-keys__card {
  padding: 16px;
  border: 1px solid #d8e0ec;
  border-radius: 14px;
  background: #fff;
}

.lms-keys__card h2 {
  margin-top: 0;
  color: #16376a;
  font-size: 1rem;
}

.lms-keys__card details {
  margin-top: 12px;
}

.lms-keys__card li {
  margin: 7px 0;
  line-height: 1.45;
}

.lms-keys__card code {
  margin-left: 6px;
  direction: ltr;
}

@media (max-width: 760px) {
  .lms-progress__list,
  .lms-keys__grid {
    grid-template-columns: 1fr;
  }

  .lms-progress__actions .btn,
  .lms-keys__toolbar .btn {
    width: 100%;
  }
}

@media print {
  .lms-progress,
  .lms-keys {
    display: none !important;
  }
}
`,
);

const packagePath = join(root, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

packageJson.scripts['phase3:verify'] =
  'npm run typecheck && npm test && npm run build';

write(packagePath, JSON.stringify(packageJson, null, 2));

const statusPath = join(root, 'MIGRATION_STATUS.md');
const status = existsSync(statusPath)
  ? readFileSync(statusPath, 'utf8')
  : '# Coordinate LMS — Migration Status\n';

if (!status.includes('## LMS Phase 3 Extreme')) {
  write(
    'MIGRATION_STATUS.md',
    status +
      String.raw`

## LMS Phase 3 Extreme

- Added a student progress page with scores, drafts, active time and continue action.
- Added an admin answer-key studio covering all workbook pages.
- Added full answer-target manifest export.
- Added JSON answer-key import and export.
- Added page-level key coverage reporting.
- Added remote/local result and draft merging.
- Added Firebase and Vercel bootstrap automation.
`,
  );
}

console.log('Phase 3 source upgrade complete.');
