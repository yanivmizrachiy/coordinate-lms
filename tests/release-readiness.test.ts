import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ReleaseDomain {
  id: string;
  status: 'pass' | 'warning' | 'failure' | 'blocked';
  summary: string;
}

interface ReleaseReport {
  schemaVersion: number;
  status: string;
  releaseReady: boolean;
  domains: ReleaseDomain[];
}

const report = JSON.parse(
  readFileSync('reports/release-readiness.json', 'utf8'),
) as ReleaseReport;
const markdown = readFileSync('reports/release-readiness.md', 'utf8');

describe('separated classroom release contract', () => {
  it('keeps exactly the five independent readiness domains', () => {
    expect(report.domains.map((domain) => domain.id)).toEqual([
      'repository-engineering',
      'emulator-validation',
      'external-firebase',
      'pedagogical-review',
      'physical-acceptance',
    ]);
    expect(
      report.domains.every((domain) =>
        ['pass', 'warning', 'failure', 'blocked'].includes(domain.status),
      ),
    ).toBe(true);
  });

  it('does not turn repository gates into a release-ready claim', () => {
    expect(report.domains[0]?.status).toBe('pass');
    /* The 78-page consolidation (2026-08-18) changed firestore.rules, so the
       stored emulator evidence is stale BY DESIGN: this domain may return to
       'pass' only through a real `npm run test:firestore` run against the new
       contract — never by relaxing the check. */
    expect(['pass', 'failure']).toContain(report.domains[1]?.status);
    if (report.domains[1]?.status === 'failure') {
      expect(report.domains[1]?.summary).toContain(
        'No current passing Firestore emulator result',
      );
    }
    expect(['blocked', 'failure']).toContain(report.status);
    expect(report.releaseReady).toBe(false);
  });

  it('separates reviewed open-ended work from unresolved answer targets', () => {
    const pedagogical = report.domains.find(
      (domain) => domain.id === 'pedagogical-review',
    );
    expect(pedagogical?.status).toBe('blocked');
    /* Measured state after the 78-page consolidation: 588 migrated proofs +
       implicit/deterministic keys = 730 of 1,149 targets; 135 signature-bound
       open-ended; 284 (147 lapsed + new-page targets) awaiting review. (The
       ordered-pair page-11 item became a keyed x-completion on 2026-08-27:
       +1 auto-checkable, −2 open-ended, −1 total.) */
    expect(pedagogical?.summary).toContain('730/1149');
    expect(pedagogical?.summary).toContain('135 are signature-bound open-ended');
    expect(pedagogical?.summary).toContain('284 remain unresolved');
  });

  it('publishes the same domain contract in Markdown', () => {
    expect(markdown).toContain('Repository engineering gates');
    expect(markdown).toContain('Firestore emulator-backed validation');
    expect(markdown).toContain('External Firebase configuration and deployment');
    expect(markdown).toContain('Pedagogical answer-key review');
    expect(markdown).toContain('Physical two-device classroom acceptance');
  });
});
