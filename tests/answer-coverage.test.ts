import { describe, expect, test } from 'vitest';
import report from '../reports/answer-coverage.json';
import order from '../reports/answer-target-order.json';
import { REVIEWED_OPEN_ENDED_TARGET_SIGNATURES } from '../src/lms/answerCoverage';
import {
  answersMatch,
  isAllowedExpectedAnswer,
} from '../src/lms/answerValidation';
import { PROVEN_ANSWER_PROOFS } from '../src/lms/provenAnswerKey';

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

    /* 588 = the proofs that survived the 78-page canonical import (2026-08-18)
       with an unchanged prompt signature. 147 of the previous 735 lapsed
       because their wording changed in the archive's content fixes; they may
       return only through a fresh review with cited evidence. */
    expect(proofs).toHaveLength(588);
    for (const [targetId, proof] of proofs) {
      const target = targets.get(targetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(proof.targetSignature);
      expect(target?.answers, targetId).toEqual(proof.answers);
      expect(target?.classification, targetId).toBe(proof.classification);
      expect(target?.automaticCheckingSafe, targetId).toBe(true);
      expect(proof.sourceEvidence, targetId).toMatch(/^src\/data\/workbook\/pages\//);
    }
  });

  test('binds reviewed open-ended targets to the current canonical prompt', () => {
    const targets = new Map(
      report.pages.flatMap((page) =>
        page.targets.map((target) => [target.targetId, target] as const),
      ),
    );

    /* 135 = reviewed open-ended targets bound to their canonical prompt.
       137 survived the 78-page import (2026-08-18); the two page-11 'הסבר'
       targets were dropped 2026-08-27 when that item became a keyed
       x-completion, matching the printed sheet. */
    expect(Object.keys(REVIEWED_OPEN_ENDED_TARGET_SIGNATURES)).toHaveLength(135);
    for (const [targetId, signature] of Object.entries(
      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,
    )) {
      const target = targets.get(targetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(signature);
      expect(target?.classification, targetId).toBe('open-ended');
      expect(target?.automaticCheckingSafe, targetId).toBe(false);
    }
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
    // The same reviewed proof (signature 1e0c6e0b) sits on page 17 since the
    // 78-page canonical order (2026-08-18); previously p20-q12.
    expect(answersMatch('4', PROVEN_ANSWER_PROOFS[17]?.['p17-q12']?.answers || [])).toBe(true);
    expect(answersMatch('3', PROVEN_ANSWER_PROOFS[17]?.['p17-q12']?.answers || [])).toBe(false);
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
