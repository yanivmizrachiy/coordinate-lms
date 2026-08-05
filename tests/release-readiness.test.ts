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

interface CoverageTarget {
  classification?: string;
  sourceEvidence?: string;
}

interface CoveragePage {
  targets?: CoverageTarget[];
}

interface AnswerCoverage {
  targetCount: number;
  automaticallyCheckableTargets: number;
  pages: CoveragePage[];
}

const report = JSON.parse(
  readFileSync('reports/release-readiness.json', 'utf8'),
) as ReleaseReport;
const markdown = readFileSync('reports/release-readiness.md', 'utf8');
const coverage = JSON.parse(
  readFileSync('reports/answer-coverage.json', 'utf8'),
) as AnswerCoverage;

const reviewedOpenEnded = coverage.pages
  .flatMap((page) => page.targets ?? [])
  .filter(
    (target) =>
      target.classification === 'open-ended' &&
      target.sourceEvidence?.startsWith('signature-bound'),
  ).length;
const unresolved = Math.max(
  0,
  coverage.targetCount -
    coverage.automaticallyCheckableTargets -
    reviewedOpenEnded,
);

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

  it('derives pedagogical readiness from the current answer coverage', () => {
    const pedagogical = report.domains.find(
      (domain) => domain.id === 'pedagogical-review',
    );
    expect(pedagogical?.status).toBe(unresolved === 0 ? 'pass' : 'blocked');
    expect(pedagogical?.summary).toContain(
      `${coverage.automaticallyCheckableTargets}/${coverage.targetCount}`,
    );
    expect(pedagogical?.summary).toContain(
      `${reviewedOpenEnded} are signature-bound open-ended`,
    );
    expect(pedagogical?.summary).toContain(`${unresolved} remain unresolved`);
  });

  it('publishes the same domain contract in Markdown', () => {
    expect(markdown).toContain('Repository engineering gates');
    expect(markdown).toContain('Firestore emulator-backed validation');
    expect(markdown).toContain('External Firebase configuration and deployment');
    expect(markdown).toContain('Pedagogical answer-key review');
    expect(markdown).toContain('Physical two-device classroom acceptance');
  });
});
