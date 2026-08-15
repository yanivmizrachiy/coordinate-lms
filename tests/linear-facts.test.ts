import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { hydrateDigitalLinearFacts } from '../src/lms/digitalLinearFacts';

function canonicalPage72Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 72);
  expect(page).toBeDefined();
  const { document } = parseHTML(`<div id="root">${page!.html}</div>`);
  const root = document.querySelector<HTMLElement>('#root');
  expect(root).not.toBeNull();
  return root!;
}

describe('canonical linear facts', () => {
  it('marks the shared coordinate on a vertical segment as x', () => {
    const root = canonicalPage72Root();
    hydrateDigitalLinearFacts(root);
    const item = Array.from(root.querySelectorAll<HTMLElement>('li')).find(
      (candidate) =>
        candidate.textContent
          ?.replace(/\s+/g, ' ')
          .includes('לשתי נקודות שממוקמות על קטע אנכי יש שיעור'),
    );
    expect(item).toBeDefined();
    expect(item!.querySelector<HTMLElement>('.blank')?.dataset['lmsAnswers']).toBe(
      JSON.stringify(['x', 'X']),
    );
  });
});
