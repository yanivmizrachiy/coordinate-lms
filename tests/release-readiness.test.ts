import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ReleaseDomain {
  id: string;
  status: 'pass' | 'warning' | 'failure' | 'blocked';
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

  it('does not turn repository and emulator passes into a release-ready claim', () => {
    expect(report.domains[0]?.status).toBe('pass');
    expect(report.domains[1]?.status).toBe('pass');
    expect(report.status).toBe('blocked');
    expect(report.releaseReady).toBe(false);
  });

  it('publishes the same domain contract in Markdown', () => {
    expect(markdown).toContain('Repository engineering gates');
    expect(markdown).toContain('Firestore emulator-backed validation');
    expect(markdown).toContain('External Firebase configuration and deployment');
    expect(markdown).toContain('Pedagogical answer-key review');
    expect(markdown).toContain('Physical two-device classroom acceptance');
  });
});
