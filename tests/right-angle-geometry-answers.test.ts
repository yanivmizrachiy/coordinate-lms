import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { hydrateDigitalGeometryAnswers } from '../src/lms/digitalGeometryAnswers';

function canonicalPageRoot(pageNumber: number): HTMLElement {
  const page = WORKBOOK.find((candidate) => candidate.n === pageNumber);
  expect(page).toBeDefined();
  const { document } = parseHTML(`<div id="root">${page!.html}</div>`);
  const root = document.querySelector<HTMLElement>('#root');
  expect(root).not.toBeNull();
  return root!;
}

function calcAnswers(card: HTMLElement): string[] {
  return Array.from(card.querySelectorAll<HTMLElement>('.calc-final .blank')).map(
    (target) => target.dataset['lmsAnswers'] || '',
  );
}

describe('right-angle rectangle calculations', () => {
  it('derives perimeter 16 and area 15 from the canonical 5 by 3 rectangle', () => {
    const root = canonicalPageRoot(73);
    hydrateDigitalGeometryAnswers(root);
    const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find(
      (candidate) =>
        candidate.querySelector('h3')?.textContent?.includes(
          'חשבו את היקף ושטח המלבן ABCD',
        ),
    );
    expect(card).toBeDefined();
    expect(calcAnswers(card!)).toEqual([
      JSON.stringify(['16']),
      JSON.stringify(['15']),
    ]);
  });

  it('keeps the two summary rectangles separated with their own calculations', () => {
    const root = canonicalPageRoot(78);
    hydrateDigitalGeometryAnswers(root);
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.q-card'));
    const first = cards.find((card) =>
      card.querySelector('h3')?.textContent?.includes('לפי המלבן ABCD'),
    );
    const second = cards.find((card) =>
      card.querySelector('h3')?.textContent?.includes('דניאל סימן שלושה קודקודים'),
    );
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(calcAnswers(first!)).toEqual([
      JSON.stringify(['18']),
      JSON.stringify(['20']),
    ]);
    expect(calcAnswers(second!)).toEqual([
      JSON.stringify(['14']),
      JSON.stringify(['12']),
    ]);
  });
});
