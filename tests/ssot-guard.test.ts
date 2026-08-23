/* Single-source-of-truth guards.

   coordinate-lms is the ONLY master of the whole project (RULES.md,
   2026-08-18). These tests make the promise structural: a second content
   source, an orphan page module, interaction markup baked into canonical
   content, or a runtime dependency on the retired archive repository fails
   the build instead of drifting quietly. */
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

describe('the first download stays small', () => {
  const main = read('src/main.ts');

  it('reaches every screen through a dynamic import', () => {
    /* A static `import { x } from './views/…'` in main.ts drags that screen —
       and everything it touches — into the file every visitor downloads
       before the opening film can play. That is how the entry chunk once
       reached 1.18 MB: one static import chain pulled in all 78 sheets and
       the whole Firebase SDK. Screens are fetched when they are opened. */
    const staticViewImport = /^import\s+\{[^}]*\}\s+from\s+'\.\/views\//m;
    expect(
      staticViewImport.test(main),
      'main.ts imports a view statically — route chunks would merge back into the entry',
    ).toBe(false);

    for (const route of [
      'home', 'menu', 'pageViewer', 'flipbook', 'book',
      'solutions', 'printAids', 'lmsLogin', 'lmsAdmin', 'lmsProgress', 'lmsKeys',
    ]) {
      expect(main, `route ${route} is not lazily imported`)
        .toContain(`import('./views/${route}')`);
    }
  });

  it('never pulls the Firebase SDK into the entry module', () => {
    /* Firebase is 683 kB — a third of the old first download — and a reader
       who only watches the film or prints a sheet never signs in. It must
       stay behind the LMS screens that actually use it. */
    expect(main).not.toMatch(/from\s+'firebase/);
    expect(main).not.toMatch(/from\s+'\.\/lms\//);
  });
});
