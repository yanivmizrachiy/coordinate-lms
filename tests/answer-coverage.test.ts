import { describe, expect, test } from 'vitest';
import report from '../reports/answer-coverage.json';
import order from '../reports/answer-target-order.json';
import { REVIEWED_OPEN_ENDED_TARGET_SIGNATURES } from '../src/lms/answerCoverage';
import {
  answersMatch,
  isAllowedExpectedAnswer,
} from '../src/lms/answerValidation';
import { PROVEN_ANSWER_PROOFS } from '../src/lms/provenAnswerKey';
import { currentTargetIdForLegacy } from '../src/lms/legacyWorkbookMap';

describe('answer-key coverage intelligence', () => {
  test('represents every workbook page from 1 through 78', () => {
    expect(report.pages).toHaveLength(78);
    expect(report.pages.map((page) => page.pageNumber)).toEqual(
      Array.from({ length: 78 }, (_, index) => index + 1),
    );
  });

  test('has globally unique target IDs in stable page order', () => {
    const ids = report.pages.flatMap((page) => page.targetIds);
    expect(new Set(ids).size).toBe(ids.length);
    for (const page of report.pages) {
      expect(page.targetIds).toEqual(
        Array.from(
          { length: page.interactiveTargetCount },
          (_, index) => `p${page.pageNumber}-q${index + 1}`,
        ),
      );
    }
    expect(
      report.pages.map((page) => ({
        pageNumber: page.pageNumber,
        targets: page.targets.map((target) => ({
          targetId: target.targetId,
          inputType: target.inputType,
          signature: target.signature,
        })),
      })),
    ).toEqual(order.pages);
  });

  test('never silently loses a deterministic or reviewed answer', () => {
    const safe = report.pages
      .flatMap((page) => page.targets)
      .filter((target) => target.automaticCheckingSafe);
    expect(safe.length).toBeGreaterThan(0);
    for (const target of safe) {
      expect(target.answers.length, target.targetId).toBeGreaterThan(0);
      expect(
        [
          'reviewed-explicit',
          'canonical-metadata-derived',
          'deterministic-mathematical',
          'valid-range',
        ],
      ).toContain(target.classification);
    }
  });

  test('contains only answers accepted by the strict answer format', () => {
    for (const target of report.pages.flatMap((page) => page.targets)) {
      for (const answer of target.answers) {
        expect(isAllowedExpectedAnswer(answer), target.targetId).toBe(true);
      }
    }
  });

  test('binds every reviewed mathematical proof to the reviewed target signature', () => {
    const targets = new Map(
      report.pages.flatMap((page) =>
        page.targets.map((target) => [target.targetId, target] as const),
      ),
    );
    const proofs = Object.values(PROVEN_ANSWER_PROOFS).flatMap((page) =>
      Object.entries(page),
    );

    expect(proofs).toHaveLength(735);
    let retainedProofs = 0;
    for (const [targetId, proof] of proofs) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      retainedProofs += 1;
      const target = targets.get(currentTargetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(proof.targetSignature);
      expect(target?.answers, targetId).toEqual(proof.answers);
      expect(target?.classification, targetId).toBe(proof.classification);
      expect(target?.automaticCheckingSafe, targetId).toBe(true);
      expect(proof.sourceEvidence, targetId).toMatch(/^src\/data\/workbook\/pages\//);
    }
    expect(retainedProofs).toBeGreaterThan(650);
  });

  test('binds reviewed open-ended targets to the current canonical prompt', () => {
    const targets = new Map(
      report.pages.flatMap((page) =>
        page.targets.map((target) => [target.targetId, target] as const),
      ),
    );

    expect(Object.keys(REVIEWED_OPEN_ENDED_TARGET_SIGNATURES)).toHaveLength(161);
    let retainedOpenEnded = 0;
    for (const [targetId, signature] of Object.entries(
      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,
    )) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      retainedOpenEnded += 1;
      const target = targets.get(currentTargetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(signature);
      expect(target?.classification, targetId).toBe('open-ended');
      expect(target?.automaticCheckingSafe, targetId).toBe(false);
    }
    expect(retainedOpenEnded).toBeGreaterThan(140);
  });

  test('accepts the new exact coordinate proofs and rejects nearby values', () => {
    expect(answersMatch('5', PROVEN_ANSWER_PROOFS[6]?.['p6-q2']?.answers || [])).toBe(true);
    expect(answersMatch('2', PROVEN_ANSWER_PROOFS[6]?.['p6-q2']?.answers || [])).toBe(false);
    expect(answersMatch('3', PROVEN_ANSWER_PROOFS[7]?.['p7-q10']?.answers || [])).toBe(true);
    expect(answersMatch('4', PROVEN_ANSWER_PROOFS[7]?.['p7-q10']?.answers || [])).toBe(false);
    expect(answersMatch('0', PROVEN_ANSWER_PROOFS[11]?.['p11-q11']?.answers || [])).toBe(true);
    expect(answersMatch('1', PROVEN_ANSWER_PROOFS[11]?.['p11-q11']?.answers || [])).toBe(false);
    expect(answersMatch('6', PROVEN_ANSWER_PROOFS[13]?.['p13-q15']?.answers || [])).toBe(true);
    expect(answersMatch('5', PROVEN_ANSWER_PROOFS[13]?.['p13-q15']?.answers || [])).toBe(false);
    expect(answersMatch('4', PROVEN_ANSWER_PROOFS[20]?.['p20-q12']?.answers || [])).toBe(true);
    expect(answersMatch('3', PROVEN_ANSWER_PROOFS[20]?.['p20-q12']?.answers || [])).toBe(false);
  });
});

describe('strict answer matching', () => {
  test('accepts equivalent numeric formatting without changing the value', () => {
    expect(answersMatch('5½', ['5.5'])).toBe(true);
    expect(answersMatch('5 1/2', ['5.5'])).toBe(true);
    expect(answersMatch('2/4', ['0.5'])).toBe(true);
    expect(answersMatch('5.05', ['5.5'])).toBe(false);
    expect(answersMatch('1/0', ['0'])).toBe(false);
  });

  test('accepts unordered label sets without accepting duplicates or omissions', () => {
    expect(answersMatch('A, C, D, E', ['set:A,C,D,E'])).toBe(true);
    expect(answersMatch('E ו־A ו־D ו־C', ['set:A,C,D,E'])).toBe(true);
    expect(answersMatch('A, A, D, E', ['set:A,C,D,E'])).toBe(false);
    expect(answersMatch('A, C, D', ['set:A,C,D,E'])).toBe(false);
    expect(answersMatch('AB ו־CD', ['set:AB,CD'])).toBe(true);
  });

  test('rejects unlisted text and unsafe answer formats', () => {
    expect(answersMatch('לא נכון', ['נכון'])).toBe(false);
    expect(answersMatch('<script>', ['script'])).toBe(false);
    expect(answersMatch('x\n', ['x'])).toBe(true);
    expect(answersMatch('x\ny', ['xy'])).toBe(false);
  });
});
