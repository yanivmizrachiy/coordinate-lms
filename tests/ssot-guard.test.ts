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
