import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WORKBOOK, TOTAL_PAGES, TOPICS, pageByNumber } from '../src/data/workbook';
import { CONTENTS } from '../src/views/tocSheet';

const FOOTER_F1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const FOOTER_F2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

describe('workbook integrity (USER_MEMORY.md mandatory checks)', () => {
  it('has pages numbered 1..78 with no holes (worksheets + games interleaved)', () => {
    expect(TOTAL_PAGES).toBe(78);
    for (let n = 1; n <= 78; n++) expect(pageByNumber(n), `page ${n}`).toBeDefined();
    expect(WORKBOOK.map((p) => p.n)).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
  });

  /* תוכן העניינים מחזיק מספרי עמוד **ביד**, בעוד שמספרי העמודים עצמם נגזרים
     מהמיקום ב-BOOK. לכן כל הוספה, מחיקה או סידור מחדש של עמוד מזיז את תחילת
     הפרק — והתוכן ממשיך להצביע על העמוד הישן, בלי שאיש ישים לב. זה כבר קרה
     פעם אחת (1/12/29/51/63 → 1/4/15/46/51/65 אחרי שינוי מבנה הפרקים), ולא
     היה מה שיתפוס את זה: גם בדיקת הדפדפן משווה לרשימת מספרים קשיחה, כלומר
     מעתיקה את אותה טעות. כאן הציפייה **נגזרת מהמבנה**. (02.08.2026) */
  it('every contents entry points at the real first page of its chapter', () => {
    expect(CONTENTS.length, 'the contents lists a different number of chapters').toBeGreaterThan(0);
    for (const c of CONTENTS) {
      const page = pageByNumber(c.page);
      expect(page, `the contents points at page ${c.page}, which does not exist`).toBeDefined();

      const topic = TOPICS.find((t) => t.pages.includes(c.page));
      expect(topic, `page ${c.page} belongs to no chapter`).toBeDefined();
      expect(
        Math.min(...topic!.pages),
        `„${c.title}" points at page ${c.page}, but its chapter starts on page ${Math.min(...topic!.pages)}`,
      ).toBe(c.page);

      /* הכותרת בתוכן זהה מילה במילה לכותרת האחידה שעל דפי הפרק. */
      expect(
        page!.title,
        `the contents calls it „${c.title}" but page ${c.page} is titled „${page!.title}"`,
      ).toBe(c.title);
    }
    const pages = CONTENTS.map((c) => c.page);
    expect(pages, 'the chapters are not in reading order').toEqual([...pages].sort((a, b) => a - b));
    expect(new Set(pages).size, 'two chapters start on the same page').toBe(pages.length);
    expect(pages[0], 'the booklet does not open on chapter 1').toBe(1);
  });

  it('every page carries the canonical footer', () => {
    for (const page of WORKBOOK) {
      expect(page.html, `page ${page.n} f1`).toContain(FOOTER_F1);
      expect(page.html, `page ${page.n} f2`).toContain(FOOTER_F2);
    }
  });

  it('axis names use natural Hebrew order (ציר x / ציר y, never x ציר / y ציר)', () => {
    for (const page of WORKBOOK) {
      expect(page.html.includes('x ציר'), `page ${page.n}`).toBe(false);
      expect(page.html.includes('y ציר'), `page ${page.n}`).toBe(false);
    }
  });

  it('stays in the first quadrant — never discusses negatives', () => {
    for (const page of WORKBOOK) expect(page.html.includes('שליל'), `page ${page.n}`).toBe(false);
  });

  it('has no name/date fields or demo/filler headings', () => {
    const forbidden = ['שם התלמיד', 'תאריך', 'שלב 3', 'שלב 4', 'ניתוח', 'אתגר', 'בודקים הבנה', 'מכירים את המערכת'];
    for (const page of WORKBOOK) {
      for (const f of forbidden) expect(page.html.includes(f), `page ${page.n}: ${f}`).toBe(false);
    }
  });

  it('never uses "מתקדמים" for point movement (uses זזים/הזזה)', () => {
    for (const page of WORKBOOK) expect(page.html.includes('מתקדמים'), `page ${page.n}`).toBe(false);
  });

  it('page 1 is the fill-in opener', () => {
    // The opener must be a worksheet the learner writes on, not a page to read.
    expect(pageByNumber(1)!.html).toMatch(/pair-blank|word-blank|class="blank"/);
  });

  /* „המשימות שלנו הן להדפסה!!" (יניב, 31.07.2026). קודם נבדק כאן שכל שעשועון
     רשום יושב על עמוד ממוספר; היום הכלל הפוך — אין שעשועונים, ואין עמוד
     שמארח אחד. (הפקדים עצמם נבדקים ב־„answerable on paper" שלמטה.) */
  it('no page hosts a game', () => {
    for (const p of WORKBOOK) {
      expect(p.html, `page ${p.n} hosts a game`).not.toContain('data-game-host');
    }
  });

  // Page numbers are positional (see index.ts `renumber`), so styling must never
  // key off a #page-N id — it would silently attach to whichever page later
  // lands in that slot.
  it('no stylesheet targets a page by its number', () => {
    const css = readFileSync(new URL('../src/styles/workbook.css', import.meta.url), 'utf8');
    expect(css.match(/#page-\d+/g)).toBeNull();
  });

  it('topics cover all pages exactly once', () => {
    const covered = TOPICS.flatMap((t) => t.pages).sort((a, b) => a - b);
    expect(covered).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
  });

  it('every true/false table row has two uniform checkboxes', () => {
    // each tf-options group renders exactly two radio inputs (נכון / לא נכון)
    for (const page of WORKBOOK) {
      const groups = page.html.split('class="tf-options"').length - 1;
      if (groups > 0) {
        const radios = page.html.split('type="radio"').length - 1;
        expect(radios, `page ${page.n}`).toBeGreaterThanOrEqual(groups * 2);
      }
    }
  });
});

/* עמוד 64 לימד את הלקח: נקודה אדומה צוירה מעל קצה המערכת, כי הנתונים הגיעו
   ל-7 והציר נגמר ב-6. מעכשיו כל קואורדינטה בכל שרטוט נבדקת מול הטווח של
   המערכת שהיא יושבת בה — נקודה מחוץ למערכת עוצרת את הבנייה, לא את המורה. */
describe('every drawn coordinate stays inside its own system', () => {
  const gridRe = /<div class="coordinate-grid[^>]*>/g;
  const attr = (tag: string, name: string): string | null => {
    const m = tag.match(new RegExp(`data-${name}='([^']*)'`)) ?? tag.match(new RegExp(`data-${name}="([^"]*)"`));
    return m ? m[1]! : null;
  };
  it('points, segments, polygons and arrows are all in range', () => {
    const out: string[] = [];
    for (const page of WORKBOOK) {
      for (const tag of page.html.match(gridRe) ?? []) {
        const xmax = Number(attr(tag, 'xmax') ?? 8);
        const ymax = Number(attr(tag, 'ymax') ?? 6);
        const coords: Array<[number, number]> = [];
        for (const name of ['points', 'segments', 'polygons', 'arrows', 'labelboxes']) {
          const raw = attr(tag, name);
          if (!raw) continue;
          const parsed = JSON.parse(raw.replace(/&#39;/g, "'").replace(/&quot;/g, '"')) as unknown[];
          const walk = (v: unknown): void => {
            if (Array.isArray(v)) {
              if (v.length === 2 && v.every((n) => typeof n === 'number')) coords.push(v as [number, number]);
              else v.forEach(walk);
            } else if (v && typeof v === 'object') {
              const o = v as Record<string, unknown>;
              if (typeof o['x'] === 'number' && typeof o['y'] === 'number') coords.push([o['x'], o['y']]);
              for (const k of ['from', 'to', 'at', 'points']) if (k in o) walk(o[k]);
            }
          };
          walk(parsed);
        }
        for (const [x, y] of coords) {
          if (x < 0 || x > xmax || y < 0 || y > ymax) {
            out.push(`page ${page.n}: (${x},${y}) outside 0..${xmax} × 0..${ymax}`);
          }
        }
      }
    }
    expect(out, out.join(' | ')).toEqual([]);
  });
});

/* „המשימות שלנו רק להדפסה ולא מתוקשבות" (יניב, 30.07.2026, על עמוד 18):
   דף עבודה ממוספר חייב להיות פתיר על נייר. שדות קלט וכפתורים בתוך ה-HTML של
   עמוד הם משימה שאי אפשר לענות עליה בעיפרון. מ־31.07.2026 אין יותר גם חריג
   של „שעשועון חי שנטען בזמן ריצה" — הוא בוטל, וכל עמוד הוא דף מודפס. */
describe('a numbered page is answerable on paper', () => {
  it('no page HTML carries typing widgets — ticks are pencil-friendly, keyboards are not', () => {
    /* נכון/לא-נכון radios ARE the printed tick boxes Yaniv's rules demand —
       a pencil answers them. A text field, a textarea or a button is a task
       only a computer can answer, and that is what page 18 got wrong. */
    const typing = /<textarea|<button|contenteditable|<input(?![^>]*type="(?:checkbox|radio)")/;
    const bad = WORKBOOK
      .filter((p) => typing.test(p.html))
      .map((p) => `page ${p.n} (${p.title})`);
    expect(bad, bad.join(', ')).toEqual([]);
  });
});
