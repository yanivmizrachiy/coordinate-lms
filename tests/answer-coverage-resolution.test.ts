import { describe, expect, it } from 'vitest';
import {
  REVIEWED_CURRENT_OPEN_ENDED_TARGET_SIGNATURES,
  buildAnswerCoverageReport,
} from '../src/lms/answerCoverage';

const DEPENDENT_TARGETS = [
  'p22-q14',
  'p37-q21',
  'p37-q22',
  'p70-q6',
] as const;

describe('resolved answer coverage', () => {
  it('has no ambiguous, unsupported, or missing response targets', () => {
    const report = buildAnswerCoverageReport('2026-08-16T00:00:00.000Z');
    expect(report.classifications.ambiguous).toBe(0);
    expect(report.classifications.unsupported).toBe(0);
    expect(report.classifications.missing).toBe(0);
  });

  it('keeps learner-dependent responses open-ended and signature-bound', () => {
    const report = buildAnswerCoverageReport('2026-08-16T00:00:00.000Z');
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
});
