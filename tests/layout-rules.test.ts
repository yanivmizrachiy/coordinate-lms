import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { WORKBOOK, pageByNumber } from '../src/data/workbook';

/* Yaniv's standing layout rules, as executable checks. Each one here is a bug
   that already reached a printed sheet once — the test is what stops it from
   coming back the next time a page is edited.

   The „USER_MEMORY §N" citations below point at the original numbered decision
   log that seeded these rules. That archive now lives only in git history; the
   live rule authority is RULES.md. The citations are kept as provenance for why
   each check exists, not as a pointer to a file still in the tree. */

const css = readFileSync(new URL('../src/styles/workbook.css', import.meta.url), 'utf8');
const grid = readFileSync(new URL('../src/lib/coordinateGrid.ts', import.meta.url), 'utf8');

describe('drawings stay big and readable', () => {
  it('a row that holds a coordinate system is capped at two columns', () => {
    // Three or four systems across a sheet collapse to thumbnails a learner
    // cannot write inside — the SVG keeps its ratio, so width drives height.
    for (const sel of ['.choice-grid', '.cols-3', '.cols-4', '.error-grid']) {
      expect(css, sel).toContain(`${sel}:has(.coordinate-grid)`);
    }
    const cap = css.slice(css.indexOf('.choice-grid:has(.coordinate-grid)'));
    expect(cap.slice(0, 400)).toContain('repeat(2, minmax(0, 1fr))');
  });

  it('the size ladder never drops below what stays legible in print', () => {
    const height = (cls: string): number =>
      Number(new RegExp(`\\.${cls} \\{ height: (\\d+)px`).exec(css)?.[1] ?? 0);
    expect(height('grid-xs')).toBeGreaterThanOrEqual(134);
    expect(height('grid-sm')).toBeGreaterThanOrEqual(165);
    expect(height('grid-md')).toBeGreaterThanOrEqual(210);
    expect(height('grid-hero')).toBeGreaterThanOrEqual(390); // still ~2x a normal grid
    // and a system may never be rendered as a sliver, whatever the container
    expect(css).toContain('.coordinate-grid { min-height: 150px; }');
  });
});

describe('nothing is silently cut off the page', () => {
  /* הכותרת התחתונה מוצמדת בכל סוג עמוד — „כמו ספר לימוד" (31.07.2026).
     דריסת static על עמוד פוסטר היא בדיוק מה שיצר את חוסר האחידות בעמודים
     22–23, ואסור שתחזור. (כללי `.game-sheet` נמחקו עם השעשועונים —
     31.07.2026 — ולכן אין יותר מה לבדוק עליהם.) */
  it('a poster sheet keeps the footer pinned like every other page', () => {
    expect(css).not.toContain('.sheet.poster-sheet .gz-footer { position: static');
    expect(css).toContain('.sheet.poster-sheet { padding:');
    /* והכללים מתקופת הווידג'טים נמחקו — נבדק על כלל אמיתי (סלקטור ואחריו
       סוגר), כדי שהערה שמזכירה אותם בשמם לא תיחשב כאילו הם חזרו. */
    expect(css).not.toMatch(/\.game-host\s*[{,>]/);
    expect(css).not.toMatch(/\.sheet\.game-sheet\s*[{,]/);
  });
});

describe('SVG text survives the RTL sheet', () => {
  it('only a label WITHOUT Hebrew is pinned to LTR', () => {
    /* „ציר y” must stay RTL so the Hebrew word sits on the right and is read
       first; „(2,5)” must be pinned or RTL mirrors its brackets. One place
       decides, from the text itself, so no call site can get it wrong. */
    const helper = grid.slice(grid.indexOf('function el('), grid.indexOf('/** Render'));
    expect(helper).toMatch(/tag === 'text' && text !== '' && !\/\[[^\]]+\]\/\.test\(text\)/);
    // and no call site may override that decision for a Hebrew label
    const axisName = grid.slice(grid.indexOf('spec.axisXName') - 220, grid.indexOf('spec.axisXName'));
    expect(axisName, 'the axis name is force-pinned again').not.toContain("direction: 'ltr'");
  });

  /* The drawing's JSON rides inside a single-quoted attribute. An apostrophe in
     a label — „מרחק 4 יח'” — closes it early and the browser drops every box on
     that drawing, with nothing in the console to say so. */
  it('a drawing survives an apostrophe in one of its labels', () => {
    for (const p of WORKBOOK) {
      for (const m of p.html.matchAll(/data-(?:labelboxes|points|xlabels|ylabels)='([^']*)'/g)) {
        expect(() => JSON.parse(m[1]!.replace(/&#39;/g, "'")), `page ${p.n}: broken ${m[0]!.slice(0, 22)}`).not.toThrow();
      }
      // and nothing may end an attribute early
      expect(p.html, `page ${p.n} has a raw apostrophe inside a data attribute`)
        .not.toMatch(/data-[a-z]+='[^']*'[^ >=]/);
    }
  });

  it('an axis number is never left sitting under a point', () => {
    expect(grid).toContain('onXAxis');
    expect(grid).toContain('onYAxis');
  });
});

describe('completions ask for something different each time', () => {
  /* Yaniv's rule (USER_MEMORY §8): "בכל השלמה חסר רכיב מסוג אחר".
     It was written down for a long time and still got broken, because nothing
     checked it — a sheet can pass every other test while asking the learner
     the very same thing four times. Tagged blanks make it checkable. */
  const cards = (html: string): string[] =>
    html.split('<section class="q-card">').slice(1).concat(html.includes('rule-box') ? [html] : []);

  it('no group of completions asks for the same kind three times running', () => {
    for (const page of WORKBOOK) {
      for (const card of cards(page.html)) {
        /* Every blank in a calculation is a number because arithmetic is made of
           numbers — the subtraction, its result, and the side's value. That is
           not a lack of variety, so calculations are not counted here. */
        const body = card
          .replace(/<div class="calc-final[^"]*">[\s\S]*?<\/div>\s*<\/div>/g, ' ')
          .replace(/<div class="calc-pair">[\s\S]*?<\/div><\/div><\/div>/g, ' ')
          .replace(/<div class="calc-ltr"[\s\S]*?<\/div>/g, ' ');
        const kinds = [...body.matchAll(/data-missing="(\w+)"/g)].map((m) => m[1]);
        if (kinds.length < 3) continue;
        const distinct = new Set(kinds);
        expect(
          distinct.size,
          `page ${page.n}: ${kinds.length} completions all ask for "${kinds[0]}"`,
        ).toBeGreaterThan(1);
      }
    }
  });

  it('the opening sheet tags every blank, so the variety rule can see them', () => {
    const first = pageByNumber(1)!.html;
    const blanks = (first.match(/class="(blank|word-blank[^"]*)"/g) ?? []).length;
    const tagged = (first.match(/data-missing=/g) ?? []).length;
    expect(tagged, 'untagged blanks on page 1').toBe(blanks);
  });

  it('a two-word answer gets two boxes — in the text AND on the drawing', () => {
    // „ראשית הצירים” is two words, so it is never one long line, and never a
    // single box on the drawing either.
    const first = pageByNumber(1)!.html;
    const concept = (first.match(/data-missing="concept"/g) ?? []).length;
    expect(concept, 'ראשית הצירים needs two boxes in the sentence').toBeGreaterThanOrEqual(2);
    expect(first, 'ראשית הצירים needs two boxes on the drawing').toContain('data-originname="true"');
  });

  it('numbers are digits and fractions, the way a textbook sets them', () => {
    const text = pageByNumber(1)!.html.replace(/<[^>]+>/g, ' ');
    for (const spelled of ['שלוש וחצי', 'חמש וחצי', 'שתיים וחצי', 'שבע וחצי']) {
      expect(text, `spelled-out number "${spelled}"`).not.toContain(spelled);
    }
    expect(text, 'decimal point instead of a fraction').not.toMatch(/\d\.\d/);
    expect(pageByNumber(1)!.html, 'no stacked fraction').toContain('frac__d');
  });

  it('a position is "ממוקם", never "נמצא" — on every page, not just page 1', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ');
      expect(text, `page ${p.n} says נמצא`).not.toMatch(/נמצא/);
    }
    expect(pageByNumber(1)!.html).toContain('ממוקם');
  });

  /* „האות משמאל לסוגריים בלי סימן שווה בכלל." A point is written S(2,5) —
     the letter against the parentheses. „S = (2,5)" is not our notation. */
  it('a point is never written with an equals sign before its parentheses', () => {
    for (const p of WORKBOOK) {
      expect(p.html, `page ${p.n} writes a point as „X = (…)"`)
        .not.toMatch(/[A-Z]′?\s*=\s*(<span[^>]*>)?\s*\(/);
    }
  });

  /* Words Yaniv has ruled out by name. „שדרה” for a street („הסגנון שלנו לא
     להגיד שדרה”) — a page from a learner's life uses the plain word. */
  it('none of the words Yaniv has ruled out appear anywhere', () => {
    const banned = ['שדרה', 'שדרות', 'שדרת', 'קרן שוכבת', 'נקודה מבוקשת'];
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ');
      for (const w of banned) expect(text, `page ${p.n} says „${w}”`).not.toContain(w);
    }
  });

  it('a fill-in task offers a word bank instead of a paragraph of directions', () => {
    const first = pageByNumber(1)!.html;
    expect(first, 'no מחסן מילים').toContain('word-bank');
    for (const word of ['ציר x', 'ציר y', 'ראשית', 'הצירים']) {
      expect(first, `word bank missing "${word}"`).toContain(`word-bank__item">${word}<`);
    }
  });
});

describe('Hebrew and punctuation hold up to proofreading', () => {
  /* Checked on the markup a reader ends up seeing. An empty element (a blank)
     is not a space, so it is removed rather than replaced — the raw HTML would
     otherwise report a space before every full stop that follows a box. */
  const readable = (html: string): string =>
    html
      .replace(/<span class="(blank|word-blank|pair-blank)[^"]*"[^>]*><\/span>/g, '_')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');

  it('no space sits before a comma or a full stop', () => {
    for (const p of WORKBOOK) {
      const m = /\S +[.,](\s|$)/.exec(readable(p.html));
      expect(m?.[0], `page ${p.n}: "${m?.[0]}"`).toBeUndefined();
    }
  });

  /* You answer a QUESTION, never a drawing or a point: „ענו עליה” is not
     Hebrew. And „קודם x ואחר כך y” describes an order of writing; the booklet
     says WHERE each number sits — „מצד שמאל” / „מצד ימין” (§5, §7). */
  it('the wording is Hebrew a teacher would sign', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n}: "ענו עלי…" — one answers a question, not a drawing`)
        .not.toMatch(/ענו עלי[ווה]/);
      expect(text, `page ${p.n}: "קודם … ואחר כך" — say which SIDE, not which turn`)
        .not.toMatch(/קודם [xy] ואחר כך|נכתב ראשון|נכתב שני/);
    }
  });

  /* USER_MEMORY §5. „כפל כותרת” — every game repeated the sheet title as its
     own heading, so the reader met the same words twice before any task. */
  it('no heading inside a sheet repeats the sheet title', () => {
    for (const p of WORKBOOK) {
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(p.html)?.[1]?.replace(/<[^>]+>/g, '').trim();
      if (!h1) continue;
      const bare = h1.replace(/[^֐-׿a-zA-Z ]/g, '').trim();
      for (const m of p.html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)) {
        const head = m[1]!.replace(/<[^>]+>/g, '').trim();
        expect(head, `page ${p.n}: „${head}” repeats the sheet title`).not.toBe(bare);
      }
    }
  });

  /* A heading that asks something ends in a question mark. */
  it('a heading that asks a question is punctuated as one', () => {
    const asks = /^(?:[֐-׿]\.\s*)?(מדוע|האם|איזו|איזה|אילו|מי |מה |כמה|לאן|איך)/;
    for (const p of WORKBOOK) {
      for (const m of p.html.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/g)) {
        const head = m[1]!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (!asks.test(head)) continue;
        // „מי אני? כתבו את הזוג הסדור.” is fine — the mark sits with the question
        expect(head.includes('?'), `page ${p.n}: „${head}” asks without a question mark`).toBe(true);
      }
    }
  });

  /* A bare letter is not a point. „B ממוקמת” has nothing to agree with; it is
     „הנקודה B ממוקמת” (§7). */
  it('a statement about a point names it as a point', () => {
    for (const p of WORKBOOK) {
      for (const m of p.html.matchAll(/<(?:li|td)>([\s\S]*?)<\/(?:li|td)>/g)) {
        const text = m[1]!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        expect(text, `page ${p.n}: „${text.slice(0, 40)}” starts with a bare letter`)
          .not.toMatch(/^[A-Z] (ממוקמ|נמצא|היא |הוא )/);
      }
    }
  });

  it('a Hebrew prefix before a Latin letter uses the Hebrew maqaf', () => {
    for (const p of WORKBOOK) {
      // „ל-x” is wrong; „ל־x” is right
      const m = /[א-ת]-[a-zA-Z0-9]/.exec(readable(p.html));
      expect(m?.[0], `page ${p.n}: "${m?.[0]}"`).toBeUndefined();
    }
  });
});

describe('a group never asks the same question four times', () => {
  /* USER_MEMORY §5. Four items reading "שיעור x הוא N ושיעור y הוא M" with
     nothing but the numbers changing is not practice, it is filler. */
  const shape = (li: string): string =>
    li
      .replace(/<[^>]+>/g, ' ')
      .replace(/\d+/g, '#')
      .replace(/\s+/g, ' ')
      .trim();

  it('no list repeats one wording with only the numbers changed', () => {
    for (const p of WORKBOOK) {
      for (const list of p.html.split('<ul class="tasks').slice(1)) {
        const items = [...list.split('</ul>')[0]!.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => shape(m[1]!));
        if (items.length < 4) continue;
        const counts = new Map<string, number>();
        for (const s of items) counts.set(s, (counts.get(s) ?? 0) + 1);
        const worst = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
        expect(worst[1], `page ${p.n}: "${worst[0].slice(0, 46)}" appears ${worst[1]} times`).toBeLessThan(4);
      }
    }
  });

  it('a completion sentence reads like a textbook, not like an equation', () => {
    // „ערך ה־x הוא ____”, never „שיעור x = ____”
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n} uses "= ___" inside a sentence`).not.toMatch(/(שיעור|ערך)\s*[xy]?\s*=\s*(_|$)/);
    }
  });

  /* USER_MEMORY §5. Yaniv: „פעם המילה שווה ופעם הסימן שווה — ככה רציתי גיוון”.
     Stating a given one single way through a whole task is the monotony he
     objects to; the two forms have to sit side by side. */
  it('a task that states given coordinates uses the word שווה AND the sign =', () => {
    const readable = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const teaches = WORKBOOK.filter((p) => readable(p.html).includes('הזוג הסדור המתאים'));
    expect(teaches.length, 'no page builds an ordered pair from given coordinates').toBeGreaterThan(0);
    for (const p of teaches) {
      const text = readable(p.html);
      expect(text, `page ${p.n} never states a given with the word שווה`).toMatch(/שווה\s*\d/);
      expect(text, `page ${p.n} never states a given with the sign =`).toMatch(/[xy]\s*=\s*\d/);
    }
  });

  /* USER_MEMORY §8. The blank has to MOVE. Two consecutive items whose text is
     identical once the blank is taken out are the same question twice, however
     different the numbers or the axis letter look. */
  it('two items in a row never leave the same sentence with the blank in one place', () => {
    const skeleton = (li: string): string =>
      li
        .replace(/<span class="blank[^>]*><\/span>/g, ' ▮ ')
        .replace(/<[^>]+>/g, ' ')
        // Swapping x for y, A for B or AB for BC is not variety — the learner
        // answers the second item by copying how they answered the first.
        .replace(/\b[A-Z]{1,2}\b/g, '▲')
        .replace(/\b[xy]\b/g, '▯')
        .replace(/\d+/g, '#')
        .replace(/\s+/g, ' ')
        .trim();

    for (const p of WORKBOOK) {
      for (const list of p.html.split('<ul class="tasks').slice(1)) {
        const items = [...list.split('</ul>')[0]!.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => skeleton(m[1]!));
        for (let i = 1; i < items.length; i++) {
          if (!items[i]!.includes('▮')) continue;
          expect(
            items[i],
            `page ${p.n}: two items in a row read "${items[i]!.slice(0, 52)}"`,
          ).not.toBe(items[i - 1]);
        }
      }
    }
  });
});

describe('a poster sheet keeps the design and drops what the rules forbid', () => {
  const posters = WORKBOOK.filter((p) => p.sectionClass.includes('poster'));

  it('carries its page number, and no heading of ours over the artwork', () => {
    expect(posters.length).toBeGreaterThan(0);
    for (const p of posters) {
      // The number is there so a sheet can be found and referred to.
      expect(p.html, `page ${p.n} has no page number`).toContain('poster-number');
      expect(p.html, `page ${p.n} draws our header over the artwork`).not.toContain('sheet-header');
    }
  });

  it('still carries the canonical footer, like every other page', () => {
    for (const p of posters) expect(p.html, `page ${p.n}`).toContain('gz-footer');
  });

  it('shows the artwork whole — we do not redesign what Yaniv supplied', () => {
    expect(css, 'the crop frame is back').not.toContain('poster-frame');
    for (const p of posters) expect(p.html, `page ${p.n} is cropped`).not.toContain('poster-frame');
  });

  it('every poster is a coordinate task, not a word puzzle', () => {
    // A word search is a Hebrew puzzle with no mathematical thinking in it.
    for (const p of posters) expect(p.title, `page ${p.n}`).not.toContain('תפזורת');
  });
});

describe("a point's name stays attached to its brackets", () => {
  /* USER_MEMORY §7: „האות באנגלית משמאל לסוגריים”. Splitting the name and the
     brackets across two table cells cannot satisfy it — the sheet is RTL, so
     the first column lands on the right and it reads „(_,_) A”. */
  it('a name and its empty pair live in one element', () => {
    for (const p of WORKBOOK) {
      expect(
        p.html,
        `page ${p.n} puts a point's name in its own cell`,
      ).not.toMatch(/<td><span class="math-ltr" dir="ltr">[A-Z]'?<\/span><\/td>\s*<td><span class="pair/);
    }
  });
});

describe('a calculation gets units and room to work', () => {
  /* USER_MEMORY §10. Both rules were written down and neither was checked, so
     five sheets asked for a perimeter with nowhere to work it out and no unit
     on the answer. */
  const readable = (h: string): string => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const computes = (h: string): boolean => /(היקף|שטח)\s*[=:]/.test(readable(h));

  /* USER_MEMORY §5. „מרחק” is not extra vocabulary — it is what a coordinate
     MEANS, and Yaniv asked for it by name. The page that introduces שיעור x
     and שיעור y has to say it, and its drawing needs a dashed line to EACH
     axis: one line teaches half the idea. */
  it('the coordinates page teaches the word מרחק, and measures to both axes', () => {
    /* בפרק עם כותרת אחידה שם הדף יורד לכותרת המשנה — מחפשים בשתיהן. */
    const page = WORKBOOK.find((p) => p.title.includes('שיעור x') || p.subtitle.includes('שיעור x'));
    expect(page, 'the page that introduces the coordinates is gone').toBeDefined();
    const html = page!.html;
    expect(html, 'the word מרחק never appears').toMatch(/מרחק|רחוק/);
    const segs = JSON.parse(
      /data-segments='([^']*)'/.exec(html)![1]!.replace(/&#39;/g, "'"),
    ) as Array<{ from: number[]; to: number[] }>;
    const toX = segs.some((s) => s.from[1] === 0 || s.to[1] === 0);
    const toY = segs.some((s) => s.from[0] === 0 || s.to[0] === 0);
    expect(toX, 'no dashed line down to ציר x').toBe(true);
    expect(toY, 'no dashed line across to ציר y').toBe(true);
  });

  /* USER_MEMORY §8: „גם כלל או הגדרה מוצגים כמשפט השלמה, לא כמשפט מוכן”.
     A rule handed over finished is a rule the learner reads past. */
  it('a rule box states its rule as something to complete', () => {
    for (const p of WORKBOOK) {
      for (const rb of p.html.split('<div class="rule-box').slice(1)) {
        const body = rb.split('</div>\n</div>')[0]!;
        // the split leaves the tail of the opening tag („ completion-intro">”)
        const words = body.slice(body.indexOf('>') + 1)
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!words) continue;
        // A worked example is the one thing that must show its answer — that
        // is what makes it an example. It has to say so on its face.
        if (/^(הדגמה|דוגמה)/.test(words)) continue;
        expect(body, `page ${p.n}: rule box reads as a finished sentence — „${words.slice(0, 54)}”`)
          .toMatch(/class="(word-)?blank|pair-blank/);
      }
    }
  });

  /* USER_MEMORY §5: „לא כותבים כפול את ההוראות — פעם אחת, ברור, מרוכז
     ומסודר". Yaniv reported it on page 20: the rule box said „סמנו את
     הנקודות… וחברו בסרגל”, and the card heading right under it said „סמנו
     וחברו לפי התוכנית”. A learner who reads the same order twice starts
     skipping headings — which is where the pages that DO carry a new
     instruction lose them. The box holds the instruction; the heading names
     the section. A worked example is exempt: it demonstrates, then the
     heading instructs, and those are two different things. */
  const SAME_VERB: Array<[RegExp, string]> = [
    [/^ו?סמנו$|^מסמנים$|^לסמן$/, 'סמן'],
    [/^ו?חברו$|^מחברים$|^לחבר$/, 'חבר'],
    [/^ו?צבעו$|^צובעים$|^לצבוע$/, 'צבע'],
    [/^ו?כתבו$|^כותבים$|^לכתוב$/, 'כתב'],
    [/^ו?השלימו$|^משלימים$|^להשלים$/, 'שלם'],
    [/^ו?בצעו$|^מבצעים$|^לבצע$/, 'בצע'],
    [/^ו?מיינו$|^ממיינים$|^למיין$/, 'מיין'],
    [/^ו?הקיפו$|^מקיפים$|^להקיף$/, 'הקף'],
    [/^ו?פתרו$|^פותרים$|^לפתור$/, 'פתר'],
    [/^ו?מצאו$|^מוצאים$|^למצוא$/, 'מצא'],
    [/^ו?מתחו$|^מותחים$|^למתוח$/, 'מתח'],
    [/^ו?קראו$|^קוראים$|^לקרוא$/, 'קרא'],
    [/^ו?השוו$|^משווים$|^להשוות$/, 'שווה'],
  ];
  const instructionVerbs = (text: string): Set<string> => {
    const found = new Set<string>();
    for (const word of text.replace(/[^֐-׿\s]/g, ' ').split(/\s+/)) {
      for (const [form, root] of SAME_VERB) if (form.test(word)) found.add(root);
    }
    return found;
  };

  /* USER_MEMORY §8: „מחסן המילים למעלה מיותר… צריך לשאול בסיום מה קיבלתם?"
     (02.08.2026, עמוד 20). On a reveal page the reveal IS the exercise: the
     learner connects the points and sees what appears. A word bank sitting
     above it — מפרשית / מטוס / בית — turns that into a one-of-three guess and
     spoils the surprise before they have drawn a line. */
  /* USER_MEMORY §5: „כאן להשתמש במילה מייצג — שיעור איקס מייצג…" (02.08.2026,
     עמוד 23). „שיעור x הוא המשקל" אומר שהמספר 3 הוא שלושה קילו. הוא לא —
     הוא מייצג אותם. זה בדיוק הבלבול שגורם לתלמיד לחבר שיעור עם שיעור ולקבל
     „7 ק"ג ועוד 5 ₪". השיעור מייצג את הגודל, ואינו הגודל עצמו. */
  it('a coordinate represents a real-world quantity, it is not that quantity', () => {
    for (const p of WORKBOOK) {
      const prose = p.html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
      for (const m of prose.matchAll(/(שיעור|ערך)\s+ה?[־-]?\s*[xy]\s+(הוא|היא)\s+ה\S+/g)) {
        expect(
          m[0],
          `page ${p.n}: „${m[0]}” — a coordinate represents the quantity, it is not the quantity`,
        ).toBe('');
      }
    }
  });

  it('a page that asks מה קיבלתם? does not list the answer above the question', () => {
    for (const p of WORKBOOK) {
      if (!p.html.includes('מה קיבלתם?')) continue;
      expect(p.html, `page ${p.n}: the reveal is offered from a word bank`).not.toContain('word-bank');
    }
  });

  it('a rule box and the heading under it do not give the same order twice', () => {
    const strip = (s: string): string => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    for (const p of WORKBOOK) {
      for (const chunk of p.html.split('<div class="rule-box').slice(1)) {
        const openTag = chunk.slice(0, chunk.indexOf('>'));
        if (openTag.includes('completion-intro')) continue; // sentences to fill in, not an order
        /* Cut the box at its OWN closing tag, counting nested <div>s. Splitting
           on the first `</div>` truncates a box that wraps its lines; splitting
           on the section swallowed the card underneath, and page 28's heading
           was then read as part of its own rule box. */
        const rest = chunk.slice(chunk.indexOf('>') + 1);
        let depth = 1;
        let end = rest.length;
        for (const tag of rest.matchAll(/<(\/?)div\b/g)) {
          depth += tag[1] ? -1 : 1;
          if (depth === 0) { end = tag.index!; break; }
        }
        const box = strip(rest.slice(0, end));
        if (/^(הדגמה|דוגמה)/.test(box)) continue;
        const boxVerbs = instructionVerbs(box);
        if (!boxVerbs.size) continue;
        for (const m of p.html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gs)) {
          const head = strip(m[1]!);
          const twice = [...instructionVerbs(head)].filter((v) => boxVerbs.has(v));
          expect(
            twice,
            `page ${p.n}: „${head.slice(0, 44)}” repeats an order the rule box already gave — „${box.slice(0, 52)}”`,
          ).toEqual([]);
        }
      }
    }
  });

  /* USER_MEMORY §9. A box that floats loose is a box the learner has to guess
     at — Yaniv reported it twice, on two different drawings. Every label on a
     drawing states which point, tick or line it belongs to. */
  it('every label box on a drawing points at what it describes', () => {
    for (const p of WORKBOOK) {
      for (const m of p.html.matchAll(/data-labelboxes='([^']*)'/g)) {
        const boxes = JSON.parse(m[1]!.replace(/&#39;/g, "'")) as Array<{ text: string; to?: number[] }>;
        for (const b of boxes) {
          expect(b.to, `page ${p.n}: „${b.text}” floats with nothing to attach it to`).toBeDefined();
        }
      }
    }
  });

  /* Marking a point does not prove the learner can write it. */
  it('a "mark it on the drawing" task also asks for the ordered pair', () => {
    for (const p of WORKBOOK) {
      for (const card of p.html.split('<section class="q-card"').slice(1)) {
        const body = card.split('</section>')[0]!;
        // Marking a POINT — page 1 marks a number on an axis, which has no pair
        // and must not have one (§8: identification only).
        const head = (/<h3>([\s\S]*?)<\/h3>/.exec(body)?.[1] ?? '').replace(/<[^>]+>/g, '');
        // „סמנו … נקודות” — placing points. Not „בנקודה … וסמנו אם היא ישרה”,
        // which marks a checkbox and has no pair to write.
        const mark = head.indexOf('סמנו');
        const point = head.indexOf('נקוד');
        if (mark < 0 || point < mark) continue;
        if (body.includes('tf-options')) continue;
        // …unless the task already hands the point over AS a pair, in which
        // case copying it out again teaches nothing.
        if (/[A-Z]\(\d+,\d+\)/.test(body.replace(/<[^>]+>/g, ''))) continue;
        expect(body, `page ${p.n}: a marking task with no ordered pair to write`)
          .toContain('pair-blank');
      }
    }
  });

  it('an area or perimeter answer ends in its unit', () => {
    for (const p of WORKBOOK) {
      if (!computes(p.html)) continue;
      expect(readable(p.html), `page ${p.n} has no יח' / יח"ר`).toMatch(/יח'|יח"ר/);
    }
  });

  /* USER_MEMORY §10 (31.07.2026 — replaces the „S = ____” final): the textbook
     letters P and S stand LARGE at the head of the working slot, the rectangle's
     name small beside them and the word היקף/שטח small underneath; the final
     answer is written ONCE, as a completion — „ההיקף הוא ____ יח'.” A second
     „P = ____” under the working wrote the same answer twice. */
  it('every area or perimeter answer is a completion with its unit, and P/S lead the working', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      if (!/שטח|היקף/.test(text)) continue;
      for (const f of p.html.matchAll(/<div class="calc-final[^"]*">([\s\S]*?)<\/div>\s*<\/div>/g)) {
        const plain = f[1]!.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        /* „לא לכתוב ההיקף הוא — לכתוב היקף המלבן הוא" (31.07.2026): the
           answer names the figure, in the construct form a textbook uses. */
        expect(plain, `page ${p.n}: a final answer that does not name the figure`).toMatch(/(היקף|שטח) ה\S+ הוא/);
        expect(plain, `page ${p.n}: a final answer without its unit`).toMatch(/יח/);
        expect(plain, `page ${p.n}: the answer written twice — P/S belong to the working slot`).not.toMatch(/[SP] =/);
      }
      /* Room to work is the squared notebook surface — or the named exercise
         lines („PQ = ____ = ____ יח'”). A box with neither is a calculation
         with nowhere to do it. */
      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 400);
        expect(
          /calc-squared|calc-ltr/.test(head),
          `page ${p.n}: a calculation with no room to write the working`,
        ).toBe(true);
      }
      /* And wherever a perimeter/area is computed, the LARGE letter leads. */
      if (/חישוב ההיקף|חישוב השטח/.test(text)) {
        expect(p.html, `page ${p.n}: no large textbook letter at the working slot`).toContain('calc-sym__math');
      }
    }
  });

  /* Yaniv, 31.07.2026: „צריך משבצת של מקום לתרגיל באופן נוח וכתוב ברור,
     ומתחתיה תשובה סופית". Two finals crushed onto one line rendered as
     „יחשטח" — so the working sits in a slot of its own, and every final
     answer stands on a row of its own. */
  it('every final answer stands on a row of its own', () => {
    for (const p of WORKBOOK) {
      for (const f of p.html.matchAll(/<div class="calc-final[^"]*">([\s\S]*?)<\/div>\s*<\/div>/g)) {
        const rows = f[1]!.split('calc-final__row').length - 1;
        const answers = (f[1]!.match(/[SP] =/g) ?? []).length;
        expect(rows, `page ${p.n}: a calc box with finals but no answer rows`).toBeGreaterThan(0);
        expect(answers, `page ${p.n}: two final answers share one row`).toBeLessThanOrEqual(rows);
      }
      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        expect(
          /calc-work|calc-ltr/.test(box.slice(0, 400)),
          `page ${p.n}: a calculation without its working slot`,
        ).toBe(true);
      }
      /* „תמחק את המילים דרך החישוב" — the only labels a calc box may carry are
         the tool's own תרגיל/תשובה, so a hand-written heading cannot drift. */
      expect(p.html, `page ${p.n}: a hand-written calc-box label`).not.toMatch(
        /<div class="calc-box"><b(?! class="calc-label")/,
      );
      expect(p.html.replace(/<[^>]+>/g, ' '), `page ${p.n} still says דרך החישוב`).not.toContain('דרך החישוב');
    }
  });

  /* USER_MEMORY §10. A rectangle has an אורך and a רוחב — the longer side and
     the shorter one. „הצלע האופקית” describes the picture, not the shape. */
  it('a rectangle is described by its אורך and רוחב, not by which way it points', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n}: „הצלע האופקית/האנכית” — say אורך and רוחב`)
        .not.toMatch(/הצלע ה(אופקית|אנכית)/);
    }
  });

  /* An exercise is worked left to right, whatever direction the sheet runs. */
  /* יניב, 02.08.2026, על עמוד 14: „יש כאן בעיה בכתיבה מתמטית". הדף כתב
     `<span dir="ltr">x =</span> 4` — הסימן והאות ננעצו משמאל-לימין, אבל
     **המספר נשאר בחוץ**, בזרימה העברית, ולכן נצבע משמאלם והמשוואה נקראה
     „4 = x". משוואה חייבת להיות **יחידה אחת** בתוך התיבה הנעוצה. */
  it('a pinned maths island never leaves its operand outside', () => {
    const bad: string[] = [];
    for (const p of WORKBOOK) {
      // an island that ENDS on an operator, with the number left behind it
      for (const m of p.html.matchAll(/<span[^>]*dir="ltr"[^>]*>([^<]*[=+−-])\s*<\/span>\s*([0-9(])/g)) {
        bad.push(`page ${p.n}: „${m[1]!.trim()}” is pinned but „${m[2]}” was left outside it`);
      }
      // …and the mirror image: the number outside, the operator pinned after it
      for (const m of p.html.matchAll(/([0-9])\s*<span[^>]*dir="ltr"[^>]*>\s*([=+−-])/g)) {
        bad.push(`page ${p.n}: „${m[1]}” sits outside the island that opens with „${m[2]}”`);
      }
    }
    expect([...new Set(bad)], bad.join(' | ')).toEqual([]);
  });

  /* יניב, 02.08.2026: „תוסיף את המילה הנקודה — מי הנקודה הימנית ביותר, ולא
     מי הימנית ביותר". שאלת „הכי" בלי שם העצם נשענת על ההקשר, והתלמיד צריך
     לנחש על מה נשאל. */
  it('a superlative question names what it is asking about', () => {
    const bad: string[] = [];
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      // „מי הימנית ביותר" — an adjective straight after מי/איזו, with no noun
      for (const m of t.matchAll(/(?:מי|איזו)\s+ה(ימנית|שמאלית|גבוהה|נמוכה|ארוכה|קצרה|קרובה|רחוקה)\s+ביותר/g)) {
        bad.push(`page ${p.n}: „${m[0]}" — say „מי הנקודה ה${m[1]} ביותר"`);
      }
      // „מי מהנקודות הגבוהה ביותר" — the partitive reads as a list, not a point
      for (const m of t.matchAll(/מי\s+מהנקודות\s+ה\S+\s+ביותר/g)) {
        bad.push(`page ${p.n}: „${m[0]}" — say „מי הנקודה …"`);
      }
    }
    expect([...new Set(bad)], bad.join(' | ')).toEqual([]);
  });

  it('an exercise line is pinned left to right', () => {
    for (const p of WORKBOOK) {
      for (const m of p.html.matchAll(/<div class="calc-ltr"([^>]*)>/g)) {
        expect(m[1], `page ${p.n}: an exercise line that is not pinned LTR`).toContain('dir="ltr"');
      }
    }
  });

  /* USER_MEMORY §8. A claim is „נכונה בהכרח / ייתכן שנכונה / לא ייתכן”. The old
     „תמיד / לפעמים / לעולם לא” describes frequency, not necessity. */
  it('a claim is judged as necessary, possible or impossible', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n}: „לעולם לא” — say „לא ייתכן”`).not.toContain('לעולם לא');
      if (/נכונה בהכרח/.test(text)) {
        expect(text, `page ${p.n}: the three options are not all offered`).toMatch(/ייתכן/);
      }
    }
  });

  /* A „find the mistake” task that states the mistake has already answered
     itself. Show the task and what was drawn; the gap is the work. */
  it('a find-the-mistake task does not give the mistake away', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n}: „סימן … במקום …” hands the answer over`)
        .not.toMatch(/סימן [^.]{0,30}במקום/);
    }
  });

  /* USER_MEMORY §5. A shared coordinate is stated as a whole sentence naming
     both points — „לשתי הנקודות A ו־B יש שיעור y זהה” — never as a bare
     „השיעור הזהה: ____”, and the sheet then asks the learner to PRODUCE two
     such points, which is the half that cannot be copied. */
  it('a shared coordinate is a sentence, and the learner is asked to make one', () => {
    for (const p of WORKBOOK) {
      const text = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(text, `page ${p.n}: „השיעור הזהה:” — say „לשתי הנקודות … יש שיעור … זהה”`)
        .not.toContain('השיעור הזהה');
    }
    const asked = WORKBOOK.filter((p) =>
      /כתבו שתי נקודות משלכם שיש להן שיעור/.test(p.html.replace(/<[^>]+>/g, ' ')),
    );
    expect(asked.length, 'nowhere asks the learner to produce two points with a shared coordinate')
      .toBeGreaterThan(0);
  });

  /* USER_MEMORY §5, applied to the whole booklet rather than page by page: an
     open line is where a child writes nothing. Every ruled line either carries
     the working of a calculation or is a completion the sheet leads them into. */
  it('no sheet leaves an open line that is not the working of a calculation', () => {
    for (const p of WORKBOOK) {
      const open = (p.html.match(/<div class="answer-line">/g) ?? []).length;
      /* אין יותר שורות מסורגלות בחוברת: משבצת החישוב היא משטח משבצות
         (`calc-squared`), וכל השלמה אחרת היא תיבה בתוך משפט. לכן כל
         `answer-line` שיופיע היום הוא בדיוק מה שהכלל אוסר — שורה פתוחה
         שאיש לא הוביל אליה. (עד 02.08.2026 נספרו כאן שורות בתוך
         `calc-work__lines`, מחלקה שכבר לא קיימת, ולכן הצד המתיר של
         ההשוואה היה מת. אם פורמט השורות יחזור — להתיר אותן שוב, אבל רק
         בתוך `calc-box`.) */
      expect(open, `page ${p.n}: ${open} open ruled line(s) with no guidance`).toBe(0);
    }
  });

  it('no sheet asks an open question instead of leading a completion', () => {
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      for (const w of ['הסבירו', 'ונמקו', 'שאלה פתוחה', 'שווה ל־', 'השיעור הזהה']) {
        expect(t, `page ${p.n}: „${w}”`).not.toContain(w);
      }
    }
  });

  /* USER_MEMORY §5. „הנקודה של היום הראשון” is possession; the point does not
     belong to the day, it CORRESPONDS to it. Yaniv's word is התאמה. */
  it('a point corresponds to its datum — it does not belong to it', () => {
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(t, `page ${p.n}: „הנקודה של …” — say „הנקודה שמתאימה ל…”`)
        .not.toMatch(/הנקוד(ה|ות) של ה?(יום|שנה|חודש|שעה|ריבוע|כיתה)/);
    }
  });

  /* A chapter carries one blue title; the subtitle is what tells the sheets
     apart. All six graph sheets are „קריאת גרפים ברביע הראשון”. */
  it('the graph chapter shows one title across all of its sheets', () => {
    const graphs = WORKBOOK.filter((p) => p.title.includes('קריאת גרפים'));
    expect(graphs.length, 'the graph chapter is gone').toBe(6);
    expect(new Set(graphs.map((p) => p.subtitle)).size, 'two sheets share a subtitle').toBe(6);
  });

  /* USER_MEMORY §8. Varying by rewriting the sentence is the opposite of the
     rule: the sentence is written once and the GAP moves inside it. „בשתי
     נקודותיו” is the shape that came from rewriting instead of moving. */
  it('a parallel-segment item keeps the one sentence and moves the gap', () => {
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      expect(t, `page ${p.n}: „בשתי נקודותיו” — say „בשתי הנקודות שעליו”`)
        .not.toContain('בשתי נקודותיו');
    }
  });

  /* The hole that let page 69 through: the old check only looked INSIDE a
     calc block, so a sheet that asked „היקף המלבן: ____ יח'” as a loose blank
     was never examined. An area or a perimeter is answered in the calculation
     block, with S and P — nowhere else. */
  it('an area or perimeter is never asked as a loose blank', () => {
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      if (!/היקף|שטח/.test(t)) continue;
      /* Only a sheet that CALCULATES — one with a working block. Reading a
         perimeter off a graph („ההיקף הוא ___ יח'”) has nothing to show. */
      if (!p.html.includes('calc-box')) continue;
      /* An ANSWER is a blank followed by its unit. „ההיקף והשטח ____, כי הזזה
         אינה משנה את הצורה” is a relation, not an answer, and stays. The
         canonical completion — „ההיקף הוא ____ יח'.” — lives inside the
         calc-final row, so the finals are stripped before looking for strays. */
      const outside = p.html.replace(/<div class="calc-final[^"]*">[\s\S]*?<\/div>\s*<\/div>/g, ' ');
      expect(
        outside,
        `page ${p.n}: „היקף/שטח: ____ יח'” outside a calculation block`,
      ).not.toMatch(/(היקף|שטח)[^<]{0,16}<span class="blank"[^>]*><\/span>\s*יח/);
    }
  });

  it('a sheet that asks for a calculation leaves space to do it', () => {
    for (const p of WORKBOOK) {
      if (!computes(p.html)) continue;
      expect(p.html, `page ${p.n} has no calc-box`).toContain('calc-box');
    }
  });
});

describe('pages stay easy to edit', () => {
  const dir = new URL('../src/data/workbook/pages/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f !== 'index.ts');

  it('every worksheet is its own file, named for what it teaches', () => {
    expect(files.length).toBeGreaterThan(25);
    for (const f of files) expect(f, f).toMatch(/^[a-z][a-z-]+\.ts$/);
  });

  it('no page file re-declares the wrapper the authoring layer owns', () => {
    // A hand-written header or footer is how a sheet ends up without the
    // canonical footer, or with a page number baked into the markup.
    for (const f of files) {
      const src = readFileSync(new URL(f, dir), 'utf8');
      expect(src, `${f} builds its own header`).not.toContain('sheet-header');
      expect(src, `${f} builds its own footer`).not.toContain('gz-footer');
      expect(src, `${f} hardcodes a page number`).not.toMatch(/id="page-\d/);
    }
  });

  it('page text is plain HTML — no escaped quotes to fight with', () => {
    for (const f of files) {
      const src = readFileSync(new URL(f, dir), 'utf8');
      expect(src, `${f} still has &quot;`).not.toContain('&quot;');
      expect(src, `${f} still has escaped quotes`).not.toContain('\\"');
    }
  });
});

describe('the booklet opens the way Yaniv asked', () => {
  it('page 1 is the half-page coordinate system, and asks the learner to write', () => {
    const first = pageByNumber(1)!;
    expect(first.html).toContain('grid-hero');
    expect(first.html).toMatch(/word-blank|class="blank"/);
  });

  it('page 1 asks about identification only — never the ordered pair', () => {
    // You cannot write an ordered pair before you know what each axis is
    // called, so page 1 names the axes and nothing else.
    const first = pageByNumber(1)!;
    const text = first.html.replace(/<[^>]+>/g, ' ');
    expect(first.html, 'ordered-pair boxes').not.toContain('pair-blank');
    expect(text, 'the words זוג סדור').not.toContain('זוג סדור');
    expect(text, 'the word שיעור').not.toContain('שיעור');
    expect(text, '(x,y) notation').not.toMatch(/\(\s*[\dxy]\s*,/);
    // and the drawing must not hand over the answer
    expect(first.html, 'axis names given away').toContain('data-axisnames="false"');
  });

  it('every sheet keeps the 13px body size', () => {
    expect(css).toContain('font-size: 13px;');
    for (const p of WORKBOOK) {
      expect(p.html.includes('font-size:1'), `page ${p.n} inline font-size`).toBe(false);
    }
  });
});

/* Yaniv's format for a calculation: „AB = 7 − 2 = ____ יח'”, on one left-to-right
   line — the side's name, the subtraction, the result. A subtraction buried in a
   Hebrew sentence is read right to left, which is not a subtraction; and the
   answer then sits a whole clause away from the exercise it belongs to. The rule
   was written on the rules page and applied on ONE page. („התרגיל לא כתוב לפי
   הכללים שלנו… אתה חייב להיות עקבי.”) */
describe('a calculation is written left to right', () => {
  it('no subtraction is left inside a sentence', () => {
    const loose: string[] = [];
    for (const page of WORKBOOK) {
      // strip the LTR calculation lines, then look for a subtraction in what is left
      /* Strip the calculation lines, THEN the tags. „6 − 1 =” inside a math-ltr
         span sat only tags away from the Hebrew around it, and the first version
         of this check refused to look across „<” — so it walked right past it. */
      const prose = page.html
        .replace(/<div class="calc-ltr"[^>]*>[\s\S]*?<\/div>/g, ' ')
        .replace(/<[^>]+>/g, ' ');
      if (/[֐-׿][^־]{0,40}\d\s*−\s*\d/.test(prose) || /\d\s*−\s*\d.{0,40}[֐-׿]/.test(prose)) {
        loose.push(`page ${page.n}`);
      }
    }
    expect(loose, `a subtraction is written inside a sentence on ${loose.join(', ')}`).toEqual([]);
  });

  /* The subtraction can also hide as a bare blank („תרגיל החיסור הוא ____”),
     which the regex above cannot see — that shape is how three of them survived
     the first sweep. If a page says „תרגיל החיסור”, it must show one. */
  it('a page that speaks of a subtraction shows one', () => {
    const talked: string[] = [];
    for (const page of WORKBOOK) {
      if (!/תרגיל החיסור/.test(page.html)) continue;
      if (!/class="calc-ltr"/.test(page.html)) talked.push(`page ${page.n}`);
    }
    expect(talked, `„תרגיל החיסור” with no calculation line on ${talked.join(', ')}`).toEqual([]);
  });

  /* An inline copy of the markup does not get the fixes the helper gets: the
     geresh fix reached every calculation except the two on the page that had
     been written by hand. */
  it('no page writes the calculation markup by hand', () => {
    /* המרקאפ שנכתב ביד מזוהה לפי היעדר `dir="rtl"` על יחידת המידה — התיקון
       של הגרש הגיע רק דרך הכלי. (היה כאן גם משתנה `inline` עם `&& false`
       בתנאי, כלומר תמיד ריק ותמיד עובר — הוסר, 02.08.2026.) */
    const handmade = WORKBOOK.filter((p) => /<span class="calc-ltr__unit">/.test(p.html));
    expect(handmade.map((p) => `page ${p.n}`), 'calc markup written by hand — use exercise()/exerciseGiven()/sideValue()').toEqual([]);
  });

  /* „יש תרגיל ותשובה מתחת… וצריך מספיק מקום לכל תרגיל ולכתוב תשובה בשורה
     מתחת." Page 74 had the exercises and no answers under them, because the two
     lines were two separate calls. exercise() emits both, and this makes sure
     nobody splits them again. */
  it('an exercise always has its answer on the line below', () => {
    for (const page of WORKBOOK) {
      /* An exercise the learner writes out („= ____ =”) must sit in a block
         with its answer line. A difference with no side name is one line by
         design, so it is exempt. */
      for (const line of page.html.match(/<div class="calc-ltr"[\s\S]*?<\/div>/g) ?? []) {
        if (!/calc-ltr__name/.test(line)) continue;
        const twoBlanks = (line.match(/class="blank"/g) ?? []).length === 2;
        if (!twoBlanks) continue;
        const at = page.html.indexOf(line);
        const before = page.html.slice(Math.max(0, at - 40), at);
        expect(before, `page ${page.n}: an exercise with no answer line under it`).toContain('calc-pair');
      }
    }
  });

  /* „צריך מספיק מקום לכל תרגיל.” A subtraction written by hand needs a real
     line to write it on, not a few characters. The rule holds where the learner
     WRITES the working (two blanks on the line); a printed subtraction from
     exerciseGiven() carries one short result blank by design and is exempt —
     the old greedy regex swallowed a given-block into the exercise after it
     and failed the wrong line. */
  it('every exercise leaves room to write the subtraction', () => {
    for (const page of WORKBOOK) {
      for (const seg of page.html.split('<div class="calc-pair">').slice(1)) {
        const line = seg.match(/<div class="calc-ltr"[\s\S]*?<\/div>/)?.[0] ?? '';
        const blanks = [...line.matchAll(/--blank-width:(\d+)ch/g)].map((m) => Number(m[1]));
        if (blanks.length < 2) continue;
        expect(blanks[0], `page ${page.n}: no room to write the exercise`).toBeGreaterThanOrEqual(14);
      }
    }
  });

  it('every calculation line carries its units', () => {
    const bare: string[] = [];
    for (const page of WORKBOOK) {
      for (const line of page.html.match(/<div class="calc-ltr"[\s\S]*?<\/div><\/div>|<div class="calc-ltr"[^>]*>[\s\S]*?<\/div>/g) ?? []) {
        if (!/calc-ltr__unit/.test(line)) bare.push(`page ${page.n}`);
      }
    }
    expect([...new Set(bare)], `a calculation has no units on ${bare.join(', ')}`).toEqual([]);
  });
});

/* An unbalanced tag does not fail loudly — the browser silently reparents what
   comes after it. One stray „</div>” on page 69 closed the SHEET, so that page's
   footer escaped and was painted across the contents page: „למה הוספת בטעות
   כיתובים באמצע עמוד השער". Nothing in the build or the tests noticed. */
describe('every page is valid markup', () => {
  const TAGS = ['div', 'section', 'ul', 'li', 'table', 'tbody', 'tr', 'td', 'p'];
  it('no page opens or closes a tag it does not balance', () => {
    for (const page of WORKBOOK) {
      for (const tag of TAGS) {
        const open = (page.html.match(new RegExp(`<${tag}[ >]`, 'g')) ?? []).length;
        const close = (page.html.match(new RegExp(`</${tag}>`, 'g')) ?? []).length;
        expect(open, `page ${page.n}: ${open} <${tag}> against ${close} </${tag}>`).toBe(close);
      }
    }
  });
});

/* RULES.md is the single rules page, and it is only worth reading if it
   is true. It kept drifting: it named a booklet of 55 pages when there were 74,
   it described a test that had been rewritten, it told the reader the arrow was
   drawn shorter after that had stopped being so. Anything it states in
   backticks about the code is checked here. */
describe('the rules page still matches the code', () => {
  const rules = readFileSync(new URL('../RULES.md', import.meta.url), 'utf8');
  const suites = readdirSync(new URL('../tests/e2e', import.meta.url))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => readFileSync(new URL('../tests/e2e/' + f, import.meta.url), 'utf8'))
    .concat(readFileSync(new URL('./layout-rules.test.ts', import.meta.url), 'utf8'),
            readFileSync(new URL('./workbook.test.ts', import.meta.url), 'utf8'))
    .join('\n');

  it('every test the rules page names actually exists', () => {
    /* A test title is an English sentence of three words or more. Shell
       commands (`npm run verify`, `git remote …`) and single identifiers are
       written the same way, so they are excluded by name. */
    const named = [...rules.matchAll(/`([a-z][a-zA-Z0-9 ,'-]{15,})…?`/g)]
      .map((m) => m[1]!.trim())
      .filter((t) => t.split(' ').length >= 3 && !/^(npm|npx|git|node) /.test(t));
    const missing = named.filter((t) => !suites.includes(t));
    expect(missing, `the rules page names tests that do not exist: ${missing.join(' | ')}`).toEqual([]);
  });

  /* The README drifted to „51 עמודים" while the booklet was at 74 — three times
     over, in the one document a newcomer reads first. Any page total stated in
     either document must be the real one. */
  it('the README states the page count there actually is', () => {
    const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
    const totals = [...readme.matchAll(/(\d+) עמודים/g)].map((m) => Number(m[1]));
    expect(totals.length, 'the README states no page count at all').toBeGreaterThan(0);
    for (const n of totals) {
      expect(n, 'the README states a stale page count').toBe(WORKBOOK.length);
    }
    // and it must not describe screens that no longer exist
    for (const gone of ['home-cover', 'workbookToc', 'אזור שעשועונים']) {
      expect(readme, `the README still describes ${gone}`).not.toContain(gone);
    }
  });

  it('the page count it states is the page count there is', () => {
    const stated = /\*\*החוברת = (\d+) עמודים ממוספרים\*\*/.exec(rules)?.[1];
    expect(Number(stated), 'the rules page states a stale page count').toBe(WORKBOOK.length);
    // and no other page total may be left lying around
    for (const m of rules.matchAll(/(\d+) עמודים ממוספרים/g)) {
      expect(Number(m[1]), 'a second, different page count in the rules').toBe(WORKBOOK.length);
    }
  });

  it('the constants it quotes are the constants in force', () => {
    const src = readFileSync(new URL('../src/lib/coordinateGrid.ts', import.meta.url), 'utf8');
    for (const name of ['MAX_GROWTH', 'MAX_DOT_GROWTH']) {
      if (!rules.includes(name)) continue;
      const inRules = new RegExp(`${name} = ([\d.]+)`).exec(rules)?.[1];
      const inCode = new RegExp(`const ${name} = ([\d.]+)`).exec(src)?.[1];
      expect(inRules, `${name} in the rules is not what the code uses`).toBe(inCode);
    }
  });
});

/* One vocabulary for motion. Every curve and every duration in the app is a
   named token, so a control added tomorrow inherits the feel instead of
   inventing a slightly different one — which is how an interface starts to feel
   assembled rather than designed. Delays are exempt: a stagger is the rhythm of
   one particular sequence, not a value to share. */
describe('the app moves in one vocabulary', () => {
  const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  const appCss = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');

  it('defines the curves and the durations in one place', () => {
    for (const t of ['--ease:', '--ease-pop:', '--ease-sweep:']) {
      expect(tokens, `${t} is not defined`).toContain(t);
    }
    for (const t of ['--dur-press:', '--dur-quick:', '--dur-move:', '--dur-enter:', '--dur-slow:']) {
      expect(tokens, `${t} is not defined`).toContain(t);
    }
  });

  it('no screen writes its own easing curve', () => {
    const raw = appCss.match(/cubic-bezier\([^)]*\)/g) ?? [];
    expect(raw, `raw curves in app.css: ${raw.join(', ')}`).toEqual([]);
  });

  /* Transitions are the app answering a person, and they all come off the same
     four-rung ladder. Keyframe animations are exempt: a badge turning for 14
     seconds is ambient, not a reply, and a shared duration would say nothing
     useful about it. */
  it('no transition writes its own duration', () => {
    const loose = (appCss.match(/transition:[^;]*;/g) ?? [])
      .flatMap((block) => block.split(','))
      .filter((part) => /(?<![\w-])(\.\d+|\d+(?:\.\d+)?)s(?![\w-])/.test(part) && !/var\(--dur-/.test(part))
      .map((part) => part.trim().slice(0, 60));
    expect(loose, `hand-written durations: ${loose.join(' | ')}`).toEqual([]);
  });

  it('turns motion off at the root for anyone who asked', () => {
    expect(tokens, 'reduced motion is not handled where the tokens live')
      .toMatch(/prefers-reduced-motion[\s\S]*--dur-slow:\s*0s/);
  });
});

/* „כל המילים… זה דמו — תמחק הכל מייד" (30.07.2026). מילות שיווק שנמחקו פעם
   אסור שיחזרו דרך העתק-הדבק עתידי: טקסט באתר אומר עובדה או פותח פעולה. */
describe('no demo copy anywhere', () => {
  it('the deleted marketing phrases stay deleted', () => {
    const files = readdirSync('src/views').filter((f) => f.endsWith('.ts'));
    const banned = ['יחידת לימוד מתוקשבת', 'הכוללת חוברת עבודה של'];
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(`src/views/${f}`, 'utf8');
      for (const phrase of banned) if (text.includes(phrase)) hits.push(`${f}: ${phrase}`);
    }
    expect(hits, hits.join(' | ')).toEqual([]);
  });
});

/* „חובה שיהיה במקרה כזה מחסן מילים" (31.07.2026): השלמות-פתיח מושגיות בלי
   מחסן השאירו את הלומד לנחש מילים. כל עמוד עם קופסת השלמות נושא מחסן. */
describe('a completion box always brings its word bank', () => {
  /* חריג יחיד ומכוון (יניב, 02.08.2026: „באופן חד פעמי מחסן המילים מיותר").
     בעמוד „מתי x=0 ומתי y=0" שלוש קופסאות ההשלמה עונות זו על זו: הקופסה
     השנייה כתוב בה „ערך ה־x הוא 0", והראשונה מבקשת בדיוק את ה-0 הזה; המילה
     „y" מודפסת בקופסה השנייה עצמה. מחסן שחוזר על מה שכבר כתוב מעל הוא רעש,
     לא עזרה. מזוהה לפי כותרת המשנה, שהיא ייחודית לעמוד הזה בלבד. */
  const BANK_NOT_NEEDED = new Set(['מתי x=0 ומתי y=0']);

  it('every completion-intro page carries a word bank', () => {
    const bad = WORKBOOK
      .filter((p) => p.html.includes('completion-intro') && !p.html.includes('word-bank'))
      .filter((p) => !BANK_NOT_NEEDED.has(p.subtitle))
      .map((p) => `page ${p.n} (${p.title})`);
    expect(bad, bad.join(', ')).toEqual([]);
  });

  it('the one page excused from a word bank is still the page we excused', () => {
    for (const sub of BANK_NOT_NEEDED) {
      const p = WORKBOOK.find((x) => x.subtitle === sub);
      expect(p, `the excused page „${sub}" is gone — drop it from the list`).toBeDefined();
      expect(p!.html, `„${sub}" grew a word bank — the exception is stale`).not.toContain('word-bank');
    }
  });
});

/* „לא איקס של E אלא של הנקודה E" (31.07.2026): אות של נקודה לעולם לא עומדת
   לבדה אחרי „של" — תמיד „של הנקודה E". */
describe('a point letter never stands bare after של', () => {
  it('every "של X" is written "של הנקודה X"', () => {
    const bare = /(?<!הנקודה )(?<!הנקודות )של ה?<span class="math-ltr" dir="ltr">[A-Z]<\/span>/;
    const bad = WORKBOOK
      .filter((p) => bare.test(p.html))
      .map((p) => `page ${p.n}`);
    expect(bad, bad.join(', ')).toEqual([]);
  });
});

/* „לא לכתוב ראשית — לכתוב ראשית הצירים" (31.07.2026). המילה נבדקת בטקסט
   שהלומד קורא בלבד: פריט במחסן מילים הוא מילה בודדת בכוונה, כי „ראשית
   הצירים" נכתב בשתי תיבות נפרדות — וזה כלל אחר, ותיק, עם בדיקה משלו. */
describe('the origin is always named in full', () => {
  it('no sheet says "ראשית" without "הצירים" in its prose', () => {
    const bad: string[] = [];
    for (const p of WORKBOOK) {
      const prose = p.html
        .replace(/<div class="word-bank">[\s\S]*?<\/div>/g, ' ')  // bank items
        .replace(/aria-label="[^"]*"/g, ' ')                       // box hints
        .replace(/<[^>]+>/g, ' ');
      if (/ראשית(?! הצירים)/.test(prose)) bad.push(`page ${p.n}`);
    }
    expect(bad, bad.join(', ')).toEqual([]);
  });
});

/* Every drawing's geometry, validated against the axis range it is drawn in.
   graph-years marked a point at (8,7) inside a grid that defaulted to ymax 6,
   so the point fell outside the axes („הנקודה יצאה מהמערכת", 02.08.2026). This
   sweeps all 94 drawings: no point, segment end, arrow end or polygon vertex
   ever sits outside its own system, and no letter labels two different points. */
describe('every drawing keeps its geometry inside the system', () => {
  type Pt = { x: number; y: number; label?: string };
  const grids = (html: string): string[] =>
    [...html.matchAll(/class="[^"]*coordinate-grid[^"]*"[\s\S]*?role="img"/g)].map((m) => m[0]);
  const attrNum = (g: string, a: string, d: number): number => {
    const m = g.match(new RegExp(`data-${a}="(\d+)"`));
    return m ? Number(m[1]) : d;
  };
  const attrJson = (g: string, a: string): any[] => {
    const m = g.match(new RegExp(`data-${a}='([^']*)'`));
    if (!m) return [];
    try { return JSON.parse(m[1]!.replace(/&#39;/g, "'")); } catch { return []; }
  };

  it('no point, endpoint or vertex is drawn outside its own axes', () => {
    const bad: string[] = [];
    for (const p of WORKBOOK) {
      for (const g of grids(p.html)) {
        const xmax = attrNum(g, 'xmax', 8);
        const ymax = attrNum(g, 'ymax', 6);
        const inRange = (x: number, y: number): boolean => x >= 0 && y >= 0 && x <= xmax && y <= ymax;
        for (const pt of attrJson(g, 'points') as Pt[])
          if (!inRange(pt.x, pt.y)) bad.push(`page ${p.n}: point ${pt.label ?? ''}(${pt.x},${pt.y}) outside ${xmax}×${ymax}`);
        for (const s of [...attrJson(g, 'segments'), ...attrJson(g, 'arrows')] as { from: number[]; to: number[] }[])
          for (const e of [s.from, s.to])
            if (e && !inRange(e[0]!, e[1]!)) bad.push(`page ${p.n}: endpoint (${e[0]},${e[1]}) outside ${xmax}×${ymax}`);
        for (const poly of attrJson(g, 'polygons') as ({ points: number[][] } | number[][])[]) {
          const verts = Array.isArray(poly) ? poly : poly.points;
          for (const v of verts ?? [])
            if (!inRange(v[0]!, v[1]!)) bad.push(`page ${p.n}: polygon vertex (${v[0]},${v[1]}) outside ${xmax}×${ymax}`);
        }
      }
    }
    expect(bad, bad.join(' | ')).toEqual([]);
  });

  it('within one drawing a letter never labels two different points', () => {
    const bad: string[] = [];
    for (const p of WORKBOOK) {
      for (const g of grids(p.html)) {
        const seen = new Map<string, string>();
        for (const pt of attrJson(g, 'points') as Pt[]) {
          if (!pt.label) continue;
          const at = `${pt.x},${pt.y}`;
          const prev = seen.get(pt.label);
          if (prev && prev !== at) bad.push(`page ${p.n}: "${pt.label}" at (${at}) and (${prev})`);
          seen.set(pt.label, at);
        }
      }
    }
    expect(bad, bad.join(' | ')).toEqual([]);
  });
});
