import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { hydrateDigitalGeometryAnswers } from '../src/lms/digitalGeometryAnswers';

function answers(target: Element | null): string[] {
  const raw = (target as HTMLElement | null)?.dataset['lmsAnswers'];
  return raw ? JSON.parse(raw) as string[] : [];
}

describe('canonical rectangle geometry hydration', () => {
  it('hydrates both fixed 5×3 rectangles on workbook page 52', () => {
    const page = WORKBOOK.find((candidate) => candidate.n === 52);
    expect(page).toBeDefined();

    const { document } = parseHTML(page!.html);
    hydrateDigitalGeometryAnswers(document as unknown as ParentNode);

    const finals = Array.from(document.querySelectorAll('.calc-final .blank'));
    expect(finals).toHaveLength(4);
    expect(finals.map((target) => answers(target)[0])).toEqual(['16', '15', '16', '15']);

    const missingCard = Array.from(document.querySelectorAll('.q-card')).find((card) =>
      card.querySelector('h3')?.textContent?.includes('משלימים את הקודקוד החסר'),
    );
    expect(missingCard).toBeDefined();
    const coordinates = Array.from(missingCard!.querySelectorAll('.pair-blank'));
    expect(coordinates).toHaveLength(2);
    expect(coordinates.map((target) => answers(target)[0])).toEqual(['2', '5']);
  });

  it('hydrates the fixed PQRS 5×3 perimeter and area on workbook page 53', () => {
    const page = WORKBOOK.find((candidate) => candidate.n === 53);
    expect(page).toBeDefined();

    const { document } = parseHTML(page!.html);
    hydrateDigitalGeometryAnswers(document as unknown as ParentNode);

    const dimensionsCard = Array.from(document.querySelectorAll('.q-card')).find((card) =>
      card.querySelector('h3')?.textContent?.includes('אורך ורוחב של מלבן'),
    );
    expect(dimensionsCard).toBeDefined();
    const finals = Array.from(dimensionsCard!.querySelectorAll('.calc-final .blank'));
    expect(finals).toHaveLength(2);
    expect(finals.map((target) => answers(target)[0])).toEqual(['16', '15']);
  });
});
