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

  it('derives only literal one-step printed arithmetic', () => {
    const document = documentFor(`
      <section class="sheet">
        <div class="calc-ltr">6 − 1 = <span class="blank"></span> יחידות</div>
        <div class="calc-final">2 + 7 = <span class="blank"></span></div>
        <p>חשבו 10 פחות מספר שבחרתם: <span class="blank"></span></p>
      </section>
    `);
    hydrateDigitalCanonicalAnswers(document);
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.blank'));
    expect(answers(targets[0]!)).toEqual(['5']);
    expect(answers(targets[1]!)).toEqual(['9']);
    expect(targets[2]!.dataset['lmsAnswers']).toBeUndefined();
  });

  it('covers deterministic maze facts while leaving learner route choices unkeyed', () => {
    const document = documentFor(`
      <section class="sheet">
        <h1>מבוך הקואורדינטות</h1>
        <div class="rule-box">צעד ימינה או שמאלה משנה את שיעור ה־x, וצעד למעלה או <span class="blank"></span> משנה את שיעור ה־<span class="blank"></span>.</div>
        <ul>
          <li>נקודות הפנייה שסימנתם: (<span class="pair-blank"></span>,<span class="pair-blank"></span>).</li>
          <li>המסלול מתחיל בנקודה (<span class="pair-blank"></span>,<span class="pair-blank"></span>), ונגמר בנקודה (<span class="pair-blank"></span>,<span class="pair-blank"></span>).</li>
          <li>את עמודת הקירות שבה שיעור ה־x הוא 2 אפשר לעבור רק בשיעור y שגדול מ־<span class="blank"></span>.</li>
          <li>את עמודת הקירות שבה שיעור ה־x הוא <span class="blank"></span> אפשר לעבור רק בשיעור y שקטן מ־3.</li>
        </ul>
      </section>
    `);
    hydrateDigitalCanonicalAnswers(document);
    const rule = Array.from(document.querySelectorAll<HTMLElement>('.rule-box .blank'));
    expect(answers(rule[0]!)).toEqual(['למטה', 'מטה']);
    expect(answers(rule[1]!)).toEqual(['y']);
    const turning = Array.from(document.querySelectorAll<HTMLElement>('li:first-child .pair-blank'));
    expect(turning.every((target) => target.dataset['lmsAnswers'] === undefined)).toBe(true);
    const fixed = Array.from(document.querySelectorAll<HTMLElement>('li:nth-child(2) .pair-blank'));
    expect(fixed.map(answers)).toEqual([['0'], ['0'], ['6'], ['4']]);
    expect(answers(document.querySelector<HTMLElement>('li:nth-child(3) .blank')!)).toEqual(['3']);
    expect(answers(document.querySelector<HTMLElement>('li:nth-child(4) .blank')!)).toEqual(['5']);
  });

  it('does not attach answers to unrelated wording', () => {
    const document = documentFor(`
      <section class="sheet"><h1>עמוד אחר</h1><p>מה קיבלתם? <span class="blank"></span></p></section>
    `);
    hydrateDigitalCanonicalAnswers(document);
    expect(document.querySelector<HTMLElement>('.blank')!.dataset['lmsAnswers']).toBeUndefined();
  });
});
