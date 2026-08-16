import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { answersMatch } from '../src/lms/answerValidation';
import {
  NONNEGATIVE_NUMBER_NOT_FOUR,
  hydrateNonRightAngleExample,
} from '../src/lms/digitalNonRightAngleExample';

describe('non-right-angle example on page 76', () => {
  it('accepts nonnegative y values except 4', () => {
    const expected = [`predicate:${NONNEGATIVE_NUMBER_NOT_FOUR}`];
    expect(answersMatch('0', expected)).toBe(true);
    expect(answersMatch('3', expected)).toBe(true);
    expect(answersMatch('3,5', expected)).toBe(true);
    expect(answersMatch('4', expected)).toBe(false);
    expect(answersMatch('-1', expected)).toBe(false);
  });

  it('hydrates the canonical point and relation blanks without choosing one sample point', () => {
    const page = WORKBOOK.find((candidate) => candidate.n === 76);
    expect(page).toBeDefined();
    const { document } = parseHTML(`<div id="root">${page!.html}</div>`);
    const root = document.querySelector<HTMLElement>('#root');
    expect(root).not.toBeNull();

    const cleanup = hydrateNonRightAngleExample(root!);
    const item = Array.from(root!.querySelectorAll<HTMLElement>('li')).find((candidate) =>
      (candidate.textContent || '').includes('הזווית ABC אינה ישרה'),
    );
    expect(item).toBeDefined();

    const coordinates = Array.from(item!.querySelectorAll<HTMLElement>('.pair-blank'));
    const relation = item!.querySelector<HTMLElement>('.blank[data-missing="relation"]');
    expect(coordinates).toHaveLength(2);
    expect(coordinates[0]!.dataset['lmsAnswers']).toBe(
      JSON.stringify(['predicate:nonnegative-number']),
    );
    expect(coordinates[1]!.dataset['lmsAnswers']).toBe(
      JSON.stringify([`predicate:${NONNEGATIVE_NUMBER_NOT_FOUR}`]),
    );
    expect(relation?.dataset['lmsAnswers']).toBe(JSON.stringify(['שונה']));

    cleanup();
    expect(coordinates[0]!.dataset['lmsAnswers']).toBeUndefined();
    expect(coordinates[1]!.dataset['lmsAnswers']).toBeUndefined();
    expect(relation?.dataset['lmsAnswers']).toBeUndefined();
  });
});
