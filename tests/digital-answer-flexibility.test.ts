import { describe, expect, test } from 'vitest';
import report from '../reports/answer-coverage.json';
import { answersMatch } from '../src/lms/answerValidation';

describe('student-friendly answer variants', () => {
  test('accepts common x-axis spellings and Hebrew-keyboard input only for x', () => {
    for (const answer of ['x', 'X', 'איקס', 'אקס', 'ציר איקס', 'ס']) {
      expect(answersMatch(answer, ['x']), answer).toBe(true);
    }
    expect(answersMatch('וואי', ['x'])).toBe(false);
    expect(answersMatch('ט', ['x'])).toBe(false);
  });

  test('accepts common y-axis spellings and Hebrew-keyboard input only for y', () => {
    for (const answer of ['y', 'Y', 'וואי', 'ואי', 'ווי', 'ציר וואי', 'ט']) {
      expect(answersMatch(answer, ['y']), answer).toBe(true);
    }
    expect(answersMatch('איקס', ['y'])).toBe(false);
    expect(answersMatch('ס', ['y'])).toBe(false);
  });

  test('does not reinterpret Hebrew keyboard letters for unrelated answers', () => {
    expect(answersMatch('ס', ['ס'])).toBe(true);
    expect(answersMatch('ס', ['אות אחרת'])).toBe(false);
    expect(answersMatch('ט', ['ט'])).toBe(true);
    expect(answersMatch('ט', ['אות אחרת'])).toBe(false);
  });
});

describe('digital answer audit', () => {
  test('leaves no unresolved deterministic ambiguity in the generated coverage', () => {
    expect(report.classifications.ambiguous).toBe(0);
    expect(report.automaticallyCheckableTargets).toBe(900);
    expect(report.classifications['open-ended']).toBe(161);
  });
});
