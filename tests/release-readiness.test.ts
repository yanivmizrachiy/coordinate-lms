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
  targetId: string;
  signature: string;
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

interface OpenEndedReview {
  targets: Array<{ targetId: string; signature: string; reason: string }>;
}

const report = JSON.parse(
  readFileSync('reports/release-readiness.json', 'utf8'),
) as ReleaseReport;
const markdown = readFileSync('reports/release-readiness.md', 'utf8');
const coverage = JSON.parse(
  readFileSync('reports/answer-coverage.json', 'utf8'),
) as AnswerCoverage;
const openEndedReview = JSON.parse(
  readFileSync('docs/open-ended-review.json', 'utf8'),
) as OpenEndedReview;
const reviewLedger = new Map(
  openEndedReview.targets.map((entry) => [entry.targetId, entry]),
);

const reviewedOpenEnded = coverage.pages
  .flatMap((page) => page.targets ?? [])
  .filter((target) => {
    if (target.classification !== 'open-ended') return false;
    if (target.sourceEvidence?.startsWith('signature-bound')) return true;
    const entry = reviewLedger.get(target.targetId);
    return (
      entry?.signature === target.signature &&
      typeof entry.reason === 'string' &&
      entry.reason.trim().length > 0
    );
  }).length;
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

  it('derives pedagogical readiness from current coverage and signature-verified review evidence', () => {
    const pedagogical = report.domains.find(
      (domain) => domain.id === 'pedagogical-review',
    );
    expect(pedagogical?.status).toBe(unresolved === 0 ? 'pass' : 'blocked');
    expect(pedagogical?.summary).toContain(
      `${coverage.automaticallyCheckableTargets}/${coverage.targetCount}`,
    );
    expect(pedagogical?.summary).toContain(
      `${reviewedOpenEnded} open-ended targets have signature-verified review evidence`,
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
