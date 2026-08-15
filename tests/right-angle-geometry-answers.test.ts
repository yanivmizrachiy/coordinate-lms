import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { hydrateDigitalGeometryAnswers } from '../src/lms/digitalGeometryAnswers';

function canonicalPage73Root(): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === 73);
  expect(page).toBeDefined();
  const { document } = parseHTML(`<div id="root">${page!.html}</div>`);
  const root = document.querySelector<HTMLElement>('#root');
  expect(root).not.toBeNull();
  return root!;
}

describe('right-angle rectangle calculations', () => {
  it('derives perimeter 16 and area 15 from the canonical 5 by 3 rectangle', () => {
    const root = canonicalPage73Root();
    hydrateDigitalGeometryAnswers(root);
    const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find(
      (candidate) =>
        candidate.querySelector('h3')?.textContent?.includes(
          'חשבו את היקף ושטח המלבן ABCD',
        ),
    );
    expect(card).toBeDefined();
    const finals = Array.from(
      card!.querySelectorAll<HTMLElement>('.calc-final .blank'),
    );
    expect(finals).toHaveLength(2);
    expect(finals[0]?.dataset['lmsAnswers']).toBe(JSON.stringify(['16']));
    expect(finals[1]?.dataset['lmsAnswers']).toBe(JSON.stringify(['15']));
  });
});
