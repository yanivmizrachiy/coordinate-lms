/* Single-source-of-truth guards.

   coordinate-lms is the ONLY master of the whole project. These tests make
   that promise structural: a second content source, an orphan page module,
   interaction markup baked into canonical content, or a runtime dependency on
   the retired archive repository fails the build instead of drifting quietly. */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  TOTAL_PAGES,
  WORKBOOK,
  workbookPageOfSource,
  type WorkbookPageContent,
} from '../src/data/workbook';
import * as PAGES from '../src/data/workbook/pages';

const read = (p: string): string =>
  readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const isPage = (v: unknown): v is WorkbookPageContent =>
  typeof v === 'object' && v !== null &&
  typeof (v as WorkbookPageContent).html === 'string' &&
  typeof (v as WorkbookPageContent).n === 'number';

describe('one canonical content source', () => {
  it('numbers every page exactly once, 1..TOTAL_PAGES', () => {
    expect(WORKBOOK).toHaveLength(TOTAL_PAGES);
    expect(WORKBOOK.map((p) => p.n)).toEqual(
      Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1),
    );
  });

  it('uses every authored page module in BOOK — an orphan page is a fork', () => {
    const orphans = Object.entries(PAGES)
      .filter(([, v]) => isPage(v))
      .filter(([, v]) => workbookPageOfSource(v as WorkbookPageContent) === undefined)
      .map(([name]) => name);
    expect(orphans, `page modules exported but absent from BOOK: ${orphans.join(', ')}`)
      .toEqual([]);
  });

  it('keeps canonical sheet HTML free of the interaction layer', () => {
    for (const page of WORKBOOK) {
      expect(page.html, `page ${page.n} bakes LMS markup into canonical content`)
        .not.toMatch(/data-lms|class="[^"]*\blms-/);
      expect(page.html, `page ${page.n} embeds an iframe`)
        .not.toContain('<iframe');
    }
  });
});

describe('no second repository behind the content', () => {
  const SOURCE_DIRS = ['src'];
  const collect = (dir: string): string[] =>
    readdirSync(new URL(`../${dir}`, import.meta.url), {
      withFileTypes: true,
      recursive: true,
    })
      .filter((e) => e.isFile() && /\.(ts|css|html)$/.test(e.name))
      .map((e) => `${e.parentPath ?? (e as { path?: string }).path}/${e.name}`);

  it('never loads workbook content from another origin at runtime', () => {
    for (const dir of SOURCE_DIRS) {
      for (const file of collect(dir)) {
        const text = readFileSync(file, 'utf8');
        expect(text, `${file} references the retired archive as a live source`)
          .not.toMatch(
            /github\.io\/coordinate-first-quadrant|coordinate-first-quadrant\.vercel|raw\.githubusercontent\.com/,
          );
      }
    }
  });

  it('declares one master in every governing document', () => {
    expect(read('RULES.md')).toMatch(/the ONLY repository, the ONLY master/);
    expect(read('RULES.md')).toMatch(/frozen historical\s+archive/);
    expect(read('RULES.md')).toContain('There must never be more than one live source-of-truth document');
    expect(read('CLAUDE.md')).toMatch(/ONLY source of truth/);
    expect(read('README.md')).toContain('MASTER היחיד');
  });
});

describe('print and computerized practice stay directly linked but operationally separate', () => {
  const viewer = read('src/views/pageViewer.ts');
  const rules = read('RULES.md');

  it('renders computerized practice from the canonical workbook page itself', () => {
    expect(viewer).toContain('pageByNumber(page)');
    expect(viewer).toContain('fromHTML(data.html)');
    expect(viewer).not.toMatch(/computerizedPages|digitalPages|lmsPageContent/);
  });

  it('keeps print and download actions out of the student practice shell', () => {
    expect(viewer).not.toContain('openActionChooser');
    expect(viewer).not.toContain('readerBar(');
    expect(viewer).not.toMatch(/🖨|הדפסה|הורדת הדף/);
  });

  it('states that a canonical content change updates both renderings', () => {
    expect(rules).toContain('Printable and computerized pages are two renderings of the SAME worksheet');
    expect(rules).toContain('must propagate automatically to both');
    expect(rules).toContain('Print/download controls are utilities for print/booklet surfaces');
  });
});

describe('first entry is explicit, lightweight and separate from practice', () => {
  const router = read('src/router.ts');
  const main = read('src/main.ts');
  const welcome = read('src/views/welcome.ts');
  const rules = read('RULES.md');

  it('routes a normal empty hash to the dedicated welcome screen', () => {
    expect(router).toContain("if (!head) return { name: 'welcome'");
    expect(router).toContain("if (head === 'home') return { name: 'home'");
    expect(main).toContain("case 'welcome': return import('./views/welcome')");
  });

  it('shows exactly the two current practice choices and explains guest non-persistence', () => {
    expect(welcome).toContain('לתרגל עם רישום');
    expect(welcome).toContain('לתרגל בלי רישום');
    expect(welcome).toContain('הציון לא נשמר ולא מופיע אצל המורה');
    expect(welcome).toContain("navigate('#/workbook/1')");
    expect(welcome).toContain("navigate('#/login')");
    expect(read('src/views/pageViewer.ts')).not.toMatch(/מצב אורח|הרשמה ושמירת ציונים|הציון בתרגול חופשי/);
    expect(rules).toContain('Guest page scores/results must never be persisted locally or centrally');
  });

  it('does not pull Firebase or the rich home screen into the welcome module', () => {
    expect(welcome).not.toMatch(/from\s+'firebase|from\s+'\.\.\/lms\//);
    expect(welcome).not.toContain("import('./home')");
    expect(welcome).not.toContain("navigate('#/home')");
    expect(rules).toContain('do not add a third large competing entry button');
  });
});

describe('the first download stays small', () => {
  const main = read('src/main.ts');

  it('reaches every screen through a dynamic import', () => {
    const staticViewImport = /^import\s+\{[^}]*\}\s+from\s+'\.\/views\//m;
    expect(
      staticViewImport.test(main),
      'main.ts imports a view statically — route chunks would merge back into the entry',
    ).toBe(false);

    for (const route of [
      'welcome', 'home', 'menu', 'pageViewer', 'flipbook', 'book',
      'solutions', 'printAids', 'lmsLogin', 'lmsAdmin', 'lmsProgress', 'lmsKeys',
    ]) {
      expect(main, `route ${route} is not lazily imported`)
        .toContain(`import('./views/${route}')`);
    }
  });

  it('never pulls the Firebase SDK into the entry module', () => {
    expect(main).not.toMatch(/from\s+'firebase/);
    expect(main).not.toMatch(/from\s+'\.\/lms\//);
  });
});