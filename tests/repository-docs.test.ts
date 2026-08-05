import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';

function readRepositoryFile(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

describe('repository documentation', () => {
  it('keeps the README page count aligned with the canonical workbook', () => {
    const readme = readRepositoryFile('README.md');
    const pageCount = WORKBOOK.length;

    expect(readme).toContain(`**${pageCount} עמודים ממוספרים**`);
    expect(readme).toContain(`כל ${pageCount} העמודים`);
    expect(readme).toContain(`לכל ${pageCount} העמודים`);
    expect(readme).not.toMatch(/\b77 עמודים\b/);
  });

  it('keeps the synchronization report aligned with the canonical workbook', () => {
    const report = readRepositoryFile('reports/workbook-sync-status.md');

    expect(report).toContain(`Numbered workbook pages: ${WORKBOOK.length}.`);
    expect(report).toContain('Final cleaned-branch verification passed');
    expect(report).not.toContain('running one final read-only verification');
  });
});
