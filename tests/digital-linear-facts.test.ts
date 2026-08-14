import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { hydrateDigitalLinearFacts } from '../src/lms/digitalLinearFacts';

function answers(target: Element | null): string[] {
  const raw = (target as HTMLElement | null)?.dataset['lmsAnswers'];
  return raw ? JSON.parse(raw) as string[] : [];
}

describe('digital linear facts', () => {
  it('hydrates uniquely determined shared-coordinate and arithmetic facts', () => {
    const { document } = parseHTML(`
      <ul>
        <li>לשתי הנקודות E(2,5) ו־F(7,5) יש שיעור <span class="blank"></span> זהה.</li>
        <li>לשתי הנקודות G(4,1) ו־H(4,6) יש שיעור <span class="blank"></span> זהה.</li>
        <li>אורי חישב את המרחק בין (2,5) ובין (7,5) וקיבל 9 — הוא <span class="blank"></span> את שני ערכי ה־x.</li>
        <li>לשתי נקודות שממוקמות על אותו קו אנכי יש שיעור <span class="blank"></span> זהה.</li>
        <li>לנקודות P(3,1) ו־Q(3,6) יש שיעור <span class="blank"></span> זהה.</li>
      </ul>
    `);

    hydrateDigitalLinearFacts(document as unknown as ParentNode);

    const targets = Array.from(document.querySelectorAll('.blank'));
    expect(answers(targets[0] ?? null)).toContain('y');
    expect(answers(targets[1] ?? null)).toContain('x');
    expect(answers(targets[2] ?? null)).toContain('חיבר');
    expect(answers(targets[3] ?? null)).toContain('x');
    expect(answers(targets[4] ?? null)).toContain('x');
  });
});
