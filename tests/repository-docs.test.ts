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

  it('does not retain retired plans or stale synchronization snapshots as competing authorities', () => {
    for (const retired of [
      'docs/WORK_PLAN.md',
      'reports/workbook-sync-status.md',
      'reports/canonical-parity.md',
    ]) {
      expect(existsSync(new URL(`../${retired}`, import.meta.url)), retired).toBe(false);
    }
  });

  it('keeps the release gate data-driven instead of hardcoding a legacy count', () => {
    const releaseGate = readRepositoryFile('scripts/release-readiness.mjs');

    expect(releaseGate).toContain('answer-target-order.json');
    expect(releaseGate).not.toMatch(/pageCount\s*===\s*77/);
  });

  it('keeps a permanent live canonical-source synchronization gate in CI', () => {
    const ci = readRepositoryFile('.github/workflows/ci.yml');
    const syncScript = readRepositoryFile('scripts/check-canonical-source.mjs');

    expect(ci).toContain('yanivmizrachiy/coordinate-first-quadrant');
    expect(ci).toContain('check-canonical-source.mjs');
    expect(syncScript).toContain('Printable/LMS page content or layout markup drift detected');
    expect(syncScript).toContain('Synchronize the LMS digital twin before updating the lock');
  });
});
