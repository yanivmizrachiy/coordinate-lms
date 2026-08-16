import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  REVIEWED_CURRENT_OPEN_ENDED_TARGET_SIGNATURES,
  type AnswerCoverageReport,
} from '../src/lms/answerCoverage';

interface OpenEndedReview {
  schemaVersion: number;
  targets: Array<{ targetId: string; signature: string; reason: string }>;
}

const DEPENDENT_TARGETS = [
  'p22-q14',
  'p37-q21',
  'p37-q22',
  'p70-q6',
] as const;

function committedCoverageReport(): AnswerCoverageReport {
  return JSON.parse(
    readFileSync(new URL('../reports/answer-coverage.json', import.meta.url), 'utf8'),
  ) as AnswerCoverageReport;
}

function committedOpenEndedReview(): OpenEndedReview {
  return JSON.parse(
    readFileSync(new URL('../docs/open-ended-review.json', import.meta.url), 'utf8'),
  ) as OpenEndedReview;
}

describe('resolved answer coverage', () => {
  it('has no ambiguous, unsupported, or missing response targets', () => {
    const report = committedCoverageReport();
    expect(report.classifications.ambiguous).toBe(0);
    expect(report.classifications.unsupported).toBe(0);
    expect(report.classifications.missing).toBe(0);
  });

  it('keeps learner-dependent responses open-ended and signature-bound', () => {
    const report = committedCoverageReport();
    const targets = new Map(
      report.pages.flatMap((page) => page.targets).map((target) => [target.targetId, target]),
    );

    for (const targetId of DEPENDENT_TARGETS) {
      const target = targets.get(targetId);
      expect(target, targetId).toBeDefined();
      expect(target!.classification, targetId).toBe('open-ended');
      expect(target!.automaticCheckingSafe, targetId).toBe(false);
      expect(target!.signature, targetId).toBe(
        REVIEWED_CURRENT_OPEN_ENDED_TARGET_SIGNATURES[targetId],
      );
    }
  });

  it('has signature-verified review evidence for every remaining open-ended target', () => {
    const report = committedCoverageReport();
    const review = committedOpenEndedReview();
    expect(review.schemaVersion).toBe(1);
    const ledger = new Map(
      review.targets.map((entry) => [entry.targetId, entry]),
    );

    const unresolved = report.pages
      .flatMap((page) => page.targets)
      .filter((target) => target.classification === 'open-ended')
      .filter((target) => {
        if (target.sourceEvidence.startsWith('signature-bound')) return false;
        const entry = ledger.get(target.targetId);
        return !entry || entry.signature !== target.signature || entry.reason.trim() === '';
      })
      .map((target) => target.targetId);

    expect(unresolved).toEqual([]);
  });
});
