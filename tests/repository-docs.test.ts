import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';

function readRepositoryFile(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

describe('repository source-of-truth documentation', () => {
  it('keeps RULES.md as the sole normative authority and aligns its current page count', () => {
    const rules = readRepositoryFile('RULES.md');
    const readme = readRepositoryFile('README.md');
    const pageCount = WORKBOOK.length;

    expect(rules).toContain('single and only source of truth');
    expect(rules).toContain(`**${pageCount} numbered pages**`);
    expect(rules).toContain('one-to-one digital twin');
    expect(rules).toContain('Any future change in the canonical printable source');

    expect(readme).toContain('`RULES.md`');
    expect(readme).toContain('מקור האמת היחיד');
    expect(readme).not.toMatch(/\b77 עמודים\b/);
  });

  it('does not retain the retired work-plan document as a competing status authority', () => {
    expect(existsSync(new URL('../docs/WORK_PLAN.md', import.meta.url))).toBe(false);
  });

  it('keeps the synchronization report aligned with the canonical workbook', () => {
    const report = readRepositoryFile('reports/workbook-sync-status.md');

    expect(report).toContain(`Numbered workbook pages: ${WORKBOOK.length}.`);
    expect(report).toContain('Final cleaned-branch verification passed');
    expect(report).not.toContain('running one final read-only verification');
  });

  it('keeps the release gate data-driven instead of hardcoding a legacy count', () => {
    const releaseGate = readRepositoryFile('scripts/release-readiness.mjs');

    expect(releaseGate).toContain('answer-target-order.json');
    expect(releaseGate).not.toMatch(/pageCount\s*===\s*77/);
  });
});
