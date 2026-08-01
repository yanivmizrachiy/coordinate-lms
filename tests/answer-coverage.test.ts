import { describe, expect, test } from 'vitest';
import report from '../reports/answer-coverage.json';
import order from '../reports/answer-target-order.json';
import {
  answersMatch,
  isAllowedExpectedAnswer,
} from '../src/lms/answerValidation';

describe('answer-key coverage intelligence', () => {
  test('represents every workbook page from 1 through 77', () => {
    expect(report.pages).toHaveLength(77);
    expect(report.pages.map((page) => page.pageNumber)).toEqual(
      Array.from({ length: 77 }, (_, index) => index + 1),
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
});

describe('strict answer matching', () => {
  test('accepts equivalent numeric formatting without changing the value', () => {
    expect(answersMatch('5½', ['5.5'])).toBe(true);
    expect(answersMatch('5 1/2', ['5.5'])).toBe(true);
    expect(answersMatch('2/4', ['0.5'])).toBe(true);
    expect(answersMatch('5.05', ['5.5'])).toBe(false);
    expect(answersMatch('1/0', ['0'])).toBe(false);
  });

  test('rejects unlisted text and unsafe answer formats', () => {
    expect(answersMatch('לא נכון', ['נכון'])).toBe(false);
    expect(answersMatch('<script>', ['script'])).toBe(false);
    expect(answersMatch('x\n', ['x'])).toBe(true);
    expect(answersMatch('x\ny', ['xy'])).toBe(false);
  });
});
