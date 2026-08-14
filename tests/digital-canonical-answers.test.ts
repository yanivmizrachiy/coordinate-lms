import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { hydrateDigitalCanonicalAnswers } from '../src/lms/digitalCanonicalAnswers';

function documentFor(html: string): Document {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document as unknown as Document;
}

function answers(target: HTMLElement): string[] {
  return JSON.parse(target.dataset['lmsAnswers'] || '[]') as string[];
}

describe('digital canonical answer hydration', () => {
  it('binds fixed plot-practice answers by canonical wording, not by page number', () => {
    const document = documentFor(`
      <section class="sheet">
        <h1>מסמנים ובודקים</h1>
        <ul>
          <li>מי הנקודה הגבוהה ביותר? <span class="blank"></span></li>
          <li>הנקודה הנמוכה ביותר היא <span class="blank"></span>, ושיעור ה-y שלה הוא <span class="blank"></span>.</li>
        </ul>
      </section>
    `);
    hydrateDigitalCanonicalAnswers(document);
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.blank'));
    expect(answers(targets[0]!)).toEqual(['R']);
    expect(answers(targets[1]!)).toEqual(['Q']);
    expect(answers(targets[2]!)).toEqual(['3']);
  });

  it('hydrates the deterministic color-decode task without editing printable content', () => {
    const document = documentFor(`
      <section class="sheet">
        <h1>פענוח צבעוני</h1>
        <p>מה קיבלתם? <span class="word-blank"></span></p>
        <ul>
          <li>חוד החץ הוא התא הגבוה ביותר, והוא (<span class="pair-blank"></span>,<span class="pair-blank"></span>).</li>
          <li>ההפרש בין שיעור ה־y של החוד (3,5) ובין תחתית הגזע (3,0) הוא <span class="blank"></span> יחידות.</li>
        </ul>
      </section>
    `);
    const before = document.querySelector('.sheet')!.textContent;
    hydrateDigitalCanonicalAnswers(document);
    const word = document.querySelector<HTMLElement>('.word-blank')!;
    const pair = Array.from(document.querySelectorAll<HTMLElement>('.pair-blank'));
    const number = document.querySelector<HTMLElement>('li:last-child .blank')!;
    expect(answers(word)).toEqual(['חץ']);
    expect(answers(pair[0]!)).toEqual(['3']);
    expect(answers(pair[1]!)).toEqual(['5']);
    expect(answers(number)).toEqual(['5']);
    expect(document.querySelector('.sheet')!.textContent).toBe(before);
  });

  it('does not attach answers to unrelated wording', () => {
    const document = documentFor(`
      <section class="sheet"><h1>עמוד אחר</h1><p>מה קיבלתם? <span class="blank"></span></p></section>
    `);
    hydrateDigitalCanonicalAnswers(document);
    expect(document.querySelector<HTMLElement>('.blank')!.dataset['lmsAnswers']).toBeUndefined();
  });
});
