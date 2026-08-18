import { describe, it, expect } from 'vitest';
import { WORKBOOK } from '../src/data/workbook';
import { decodeTargets, decodeSolved, targetsAreFirstQuadrant, decodeXMax, decodeYMax }
  from '../src/data/colorDecode';

/* ===========================================================================
   הוכחות על החידות ש**באמת מודפסות** בחוברת.

   עד 01.08.2026 היו הוכחות רק על `src/games/*` — נתוני השעשועונים המקוונים.
   אחרי שכל השעשועונים הומרו לדפי הדפסה, הדפים נכתבו **מחדש** עם נתונים
   אחרים: המודול מוכיח „אמת" ו„ישר", והחוברת מדפיסה „זהים" ומבוך אחר. כלומר
   ההוכחות שמרו על חידות שאף עמוד לא מציג, והחידות שהילד פותר על הנייר לא
   נבדקו כלל.

   הקובץ הזה סוגר את הפער: כל בדיקה כאן **קוראת את ה-HTML של העמוד המודפס**,
   מוודאת שהנתונים שהיא מסתמכת עליהם באמת מופיעים בו (כדי שהבדיקה והעמוד לא
   יוכלו להיפרד), ורק אז מוכיחה את התכונה המתמטית — פתירוּת, יחידוּת, והמילה
   או הקוד שמתקבלים.
   =========================================================================== */

type Pt = { x: number; y: number; label?: string };

const pageByTitle = (t: string): { n: number; html: string } => {
  const p = WORKBOOK.find((x) => x.title === t || x.subtitle === t);
  if (!p) throw new Error(`no printed page titled ${t}`);
  return { n: p.n, html: p.html };
};

/** Every point of every drawing on the sheet, as the page actually prints them. */
const pointsOf = (html: string): Pt[][] =>
  [...html.matchAll(/data-points='([^']*)'/g)].map(
    (m) => JSON.parse(m[1]!.replace(/&#39;/g, "'")) as Pt[],
  );

/** The sheet's readable text, tags stripped — for asserting a number is stated. */
const readable = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('מבוך הקואורדינטות — המבוך המודפס פתיר', () => {
  const { html } = pageByTitle('מבוך הקואורדינטות');
  const START = { x: 0, y: 0 };
  const TARGET = { x: 6, y: 4 };
  const XM = 8;
  const YM = 6;

  /* הקירות נלקחים מהשרטוט עצמו — הסימן ■ הוא קיר. אם מישהו יזיז קיר בעמוד,
     הבדיקה תרוץ על הקירות החדשים ותיפול אם המבוך נחסם. */
  const walls = pointsOf(html).flat().filter((p) => p.label === '■');

  it('the drawing really carries the walls, the start and the target', () => {
    expect(walls.length, 'no ■ walls on the printed maze').toBeGreaterThan(0);
    const all = pointsOf(html).flat();
    expect(all.some((p) => p.x === START.x && p.y === START.y), 'no start point').toBe(true);
    expect(all.some((p) => p.x === TARGET.x && p.y === TARGET.y), 'no target point').toBe(true);
    // and the page states them in words, so the drawing and the text agree
    expect(readable(html)).toContain('(0,0)');
    expect(readable(html)).toContain('(6,4)');
  });

  it('a route exists from the start to the target — every step changes one coordinate', () => {
    const blocked = new Set(walls.map((w) => `${w.x},${w.y}`));
    const seen = new Set([`${START.x},${START.y}`]);
    const queue: Pt[] = [START];
    let found = false;
    while (queue.length) {
      const p = queue.shift()!;
      if (p.x === TARGET.x && p.y === TARGET.y) { found = true; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const q = { x: p.x + dx, y: p.y + dy };
        const k = `${q.x},${q.y}`;
        if (q.x < 0 || q.y < 0 || q.x > XM || q.y > YM) continue;
        if (blocked.has(k) || seen.has(k)) continue;
        seen.add(k);
        queue.push(q);
      }
    }
    expect(found, 'the printed maze cannot be solved').toBe(true);
  });

  it('the walls really block the direct route, or the maze teaches nothing', () => {
    const blocked = new Set(walls.map((w) => `${w.x},${w.y}`));
    // walking straight along y=0 then up x=6 is the naive route; a wall must stop it
    const naive = [] as string[];
    for (let x = 1; x <= TARGET.x; x++) naive.push(`${x},0`);
    expect(naive.some((k) => blocked.has(k)), 'nothing blocks the straight route').toBe(true);
  });
});

describe('הנקודה החשודה — לכל סיבוב מודפס יש בדיוק נקודה אחת', () => {
  const { html } = pageByTitle('הנקודה החשודה');
  const pts = pointsOf(html).flat().filter((p) => p.label);

  /* הרמזים כפי שהם מודפסים בעמוד. הבדיקה מוודאת שהניסוח קיים בעמוד לפני
     שהיא מסתמכת עליו — כך שינוי בעמוד בלי שינוי כאן ייתפס. */
  const ROUNDS: Array<{ stated: string[]; test: (p: Pt) => boolean }> = [
    { stated: ['שיעור ה־', 'שווה 5', 'גדול מ־2'], test: (p) => p.x === 5 && p.y > 2 },
    { stated: ['קטן מ־3', '(7,0)'], test: (p) => p.y < 3 && p.x === 7 },
  ];

  it('the six candidates are on the drawing', () => {
    expect(pts.length, 'the printed sheet does not carry six candidates').toBe(6);
  });

  for (const [i, r] of ROUNDS.entries()) {
    it(`round ${i + 1}: the clues are printed, and exactly one point satisfies them`, () => {
      for (const s of r.stated) {
        expect(readable(html), `round ${i + 1} no longer states „${s}"`).toContain(s);
      }
      const hits = pts.filter(r.test);
      expect(hits.length, `round ${i + 1} has ${hits.length} answers, not one`).toBe(1);
    });
  }

  it('the two answers are different points — two rounds, two suspects', () => {
    const [a, b] = ROUNDS.map((r) => pts.filter(r.test)[0]!);
    expect(`${a!.x},${a!.y}`).not.toBe(`${b!.x},${b!.y}`);
  });
});

describe('אותו x או אותו y — הנקודות שמוקפות מרכיבות „זהים"', () => {
  const { html } = pageByTitle('אותו x או אותו y');
  const grids = pointsOf(html);

  /* כל סרטוט: הנקודה המסומנת (שהתווית שלה היא זוג סדור) והאותיות סביבה.
     הבדיקה מחשבת מי חולק את השיעור הנדרש, ומרכיבה את המילה מהאותיות. */
  const SECTIONS = [
    { axis: 'x' as const, marked: '(3,1)', expect: ['ז', 'ה'] },
    { axis: 'y' as const, marked: '(2,2)', expect: ['י', 'ם'] },
  ];

  it('both drawings are on the sheet', () => {
    expect(grids.length, 'the sheet does not carry two drawings').toBeGreaterThanOrEqual(2);
  });

  for (const [i, sec] of SECTIONS.entries()) {
    it(`drawing ${i + 1}: the letters sharing the ${sec.axis} coordinate are ${sec.expect.join('')}`, () => {
      const g = grids[i]!;
      const target = g.find((p) => p.label === sec.marked);
      expect(target, `the marked point ${sec.marked} is not on drawing ${i + 1}`).toBeDefined();
      const share = g
        .filter((p) => p !== target && p.label && p.label !== sec.marked)
        .filter((p) => (sec.axis === 'x' ? p.x === target!.x : p.y === target!.y));
      /* ordered the way the page asks for them: section א reads top-down (y
         descending), section ב reads right-to-left (x descending). */
      share.sort((a, b) => (sec.axis === 'x' ? b.y - a.y : b.x - a.x));
      expect(share.map((p) => p.label)).toEqual(sec.expect);
    });
  }

  it('the four circled letters spell זהים, and the page never prints it for them', () => {
    const word = SECTIONS.flatMap((sec, i) => {
      const g = grids[i]!;
      const target = g.find((p) => p.label === sec.marked)!;
      return g
        .filter((p) => p !== target && p.label && p.label !== sec.marked)
        .filter((p) => (sec.axis === 'x' ? p.x === target.x : p.y === target.y))
        .sort((a, b) => (sec.axis === 'x' ? b.y - a.y : b.x - a.x))
        .map((p) => p.label!);
    }).join('');
    expect(word).toBe('זהים');
    /* The reveal is the exercise. A word bank listing „זהים” above it turned
       four letters the learner works out into a one-of-three guess, so the
       bank went (02.08.2026) — and the page must not hand the answer over
       anywhere else either. Tokenised, because the old check passed on the
       „זהים” buried inside the heading „ד. מזהים בלי סרטוט”. */
    const words = readable(html).replace(/[^֐-׿\s]/g, ' ').trim().split(/\s+/);
    expect(words, 'the page prints the very word it asks the learner to find').not.toContain('זהים');
  });

  it('each drawing carries a decoy that shares the OTHER coordinate', () => {
    for (const [i, sec] of SECTIONS.entries()) {
      const g = grids[i]!;
      const target = g.find((p) => p.label === sec.marked)!;
      const decoy = g.filter((p) => p !== target && p.label !== sec.marked)
        .some((p) => (sec.axis === 'x' ? p.y === target.y : p.x === target.x));
      expect(decoy, `drawing ${i + 1} has no decoy — guessing would work`).toBe(true);
    }
  });
});

describe('המסלול המוצפן — כל מסלול נוחת על התחנה שכתובה, והמילה היא „קסם"', () => {
  const { html } = pageByTitle('המסלול המוצפן');
  const text = readable(html);

  /* המסלולים כפי שהם מודפסים: נקודת פתיחה ושתי הזזות. */
  const ROUTES = [
    { from: { x: 1, y: 1 }, dx: 4, dy: 3, station: '(5,4)', letter: 'ק' },
    { from: { x: 2, y: 5 }, dx: 3, dy: -4, station: '(5,1)', letter: 'ס' },
    { from: { x: 0, y: 2 }, dx: 6, dy: 3, station: '(6,5)', letter: 'ם' },
  ];

  it('the three starting points are on the drawing', () => {
    const pts = pointsOf(html).flat();
    for (const r of ROUTES) {
      expect(pts.some((p) => p.x === r.from.x && p.y === r.from.y),
        `start (${r.from.x},${r.from.y}) is not on the drawing`).toBe(true);
    }
  });

  it('each route lands on the station the table names', () => {
    for (const r of ROUTES) {
      const end = { x: r.from.x + r.dx, y: r.from.y + r.dy };
      expect(`(${end.x},${end.y})`, 'the arithmetic no longer matches the printed station')
        .toBe(r.station);
      expect(text, `the station ${r.station} is missing from the table`).toContain(r.station);
    }
  });

  it('the three letters spell קסם, right to left', () => {
    expect(ROUTES.map((r) => r.letter).join('')).toBe('קסם');
  });

  it('the table carries decoy stations, so the word cannot be guessed', () => {
    const stations = [...text.matchAll(/\((\d),(\d)\)/g)].map((m) => `(${m[1]},${m[2]})`);
    const ends = new Set(ROUTES.map((r) => r.station));
    const decoys = new Set(stations.filter((s) => !ends.has(s)));
    expect(decoys.size, 'no decoy stations on the sheet').toBeGreaterThanOrEqual(2);
  });
});

describe('כספת הקואורדינטות — ארבע המשימות מרכיבות 4705', () => {
  const { html } = pageByTitle('כספת הקואורדינטות');
  const text = readable(html);
  const pts = pointsOf(html).flat();
  const at = (label: string): Pt => {
    const p = pts.find((q) => q.label === label);
    if (!p) throw new Error(`point ${label} is not on the printed drawing`);
    return p;
  };

  it('the six points the tasks speak about are all drawn', () => {
    for (const l of ['A', 'B', 'C', 'D', 'E', 'F']) expect(at(l)).toBeDefined();
  });

  it('each task yields its digit, and together they are the printed code', () => {
    const d1 = at('B').x - at('A').x;          // ההזזה הימנית
    const d2 = at('C').x;                       // שיעור x של C
    const d3 = at('D').x;                       // D על ציר y ⇒ 0
    const d4 = at('F').y - at('E').y;          // ההזזה למעלה
    expect([d1, d2, d3, d4].join('')).toBe('4705');
    // every digit must be a single digit, or it is not a safe code
    for (const d of [d1, d2, d3, d4]) expect(d).toBeGreaterThanOrEqual(0);
    for (const d of [d1, d2, d3, d4]) expect(d).toBeLessThanOrEqual(9);
  });

  it('the subtractions the page prints are the ones the digits come from', () => {
    expect(text).toContain('5 − 1');
    expect(text).toContain('6 − 1');
  });

  it('D really sits on the y axis, which is what makes its digit 0', () => {
    expect(at('D').x).toBe(0);
  });
});

describe('פענוח צבעוני — התאים לצביעה תקינים ומודפסים', () => {
  /* הדף היחיד שבאמת **מייבא** את נתוני החידה שלו (`decodeTargets`), ולכן כאן
     די להוכיח את הנתונים ולוודא שהם מגיעים אל הנייר. */
  const { html } = pageByTitle('פענוח צבעוני');
  const text = readable(html);

  it('every target cell is in the first quadrant and inside the printed grid', () => {
    expect(targetsAreFirstQuadrant(), 'a target cell falls outside the first quadrant').toBe(true);
    for (const p of decodeTargets) {
      expect(p.x, `x of (${p.x},${p.y}) is off the grid`).toBeLessThanOrEqual(decodeXMax);
      expect(p.y, `y of (${p.x},${p.y}) is off the grid`).toBeLessThanOrEqual(decodeYMax);
    }
  });

  it('colouring exactly the targets solves it, and one short does not', () => {
    const keys = decodeTargets.map((p) => `${p.x},${p.y}`);
    expect(decodeSolved(keys)).toBe(true);
    expect(decodeSolved(keys.slice(1)), 'a missing cell still counts as solved').toBe(false);
  });

  it('every target the page lists is one the data actually holds', () => {
    for (const p of decodeTargets) {
      expect(text, `the sheet no longer lists (${p.x},${p.y})`).toContain(`(${p.x},${p.y})`);
    }
  });
});

describe('ציור נסתר — התוכנית המודפסת סוגרת צורה ברביע הראשון', () => {
  const { html } = pageByTitle('ציור נסתר');
  const text = readable(html);

  /* שני הקווים כפי שהם מודפסים בעמוד. */
  const STROKES = [
    [[1, 2], [7, 2], [6, 1], [2, 1], [1, 2]],
    [[4, 2], [4, 6], [7, 3], [4, 3]],
  ] as const;

  it('both strokes are printed exactly as the test reads them', () => {
    for (const stroke of STROKES) {
      for (const [x, y] of stroke) {
        expect(text, `the plan no longer contains (${x},${y})`).toContain(`(${x},${y})`);
      }
    }
  });

  it('every point stays in the first quadrant and inside the drawing', () => {
    for (const stroke of STROKES) {
      for (const [x, y] of stroke) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(8);
        expect(y).toBeLessThanOrEqual(6);
      }
    }
  });

  it('the hull closes on itself, so the shape can be recognised', () => {
    const hull = STROKES[0];
    expect(hull[0]).toEqual(hull[hull.length - 1]);
  });

  it('no stroke is a single stray point', () => {
    for (const s of STROKES) expect(s.length).toBeGreaterThanOrEqual(2);
  });
});

describe('מילת הצופן — סדר השאלות מרכיב „נקודה"', () => {
  /* עמוד 22. הבדיקה נולדה מתקלה אמיתית (02.08.2026): ההוראה „כתבו את חמש
     האותיות לפי סדר השאלות" — אבל סדר השאלות היה נ,ו,ד,ה,ק, שמרכיב „נודהק".
     כאן קוראים את חמש שאלות סעיף ב, מזהים את האות של כל אחת (לפי הנקודה
     שהיא מצביעה עליה, או לפי האות המודגשת), ומוודאים שברצף הן „נקודה". */
  const { html } = pageByTitle('קוראים נקודות, מזהים תכונות — ומפענחים מילה');
  const pts = pointsOf(html).flat();
  const letterAt = (x: number, y: number): string => {
    const p = pts.find((q) => q.x === x && q.y === y);
    if (!p?.label) throw new Error(`no lettered point at (${x},${y})`);
    return p.label;
  };

  it('the five questions of section ב, read in order, spell נקודה', () => {
    const card = html.split('מפענחים אות')[1]!.split('</section>')[0]!;
    const items = [...card.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]!);
    expect(items.length, 'section ב should carry exactly five questions').toBe(5);
    const letters = items.map((li) => {
      const pt = li.match(/\((\d),\s*(\d)\)/);
      if (pt && /האות שממוקמת בנקודה/.test(li)) return letterAt(+pt[1]!, +pt[2]!);
      const strong = li.match(/<strong>([^<]+)<\/strong>/);
      if (strong) return strong[1]!.trim();
      throw new Error(`cannot tell which letter this question is about: ${li.slice(0, 50)}`);
    });
    expect(letters.join(''), `by question order the word assembles as „${letters.join('')}"`).toBe('נקודה');
  });

  it('the sheet really does tell the student to assemble by the order of the questions', () => {
    expect(readable(html)).toContain('לפי סדר השאלות');
  });

  it('the same point ד is never asked for the same superlative twice', () => {
    // ד(7,1) is BOTH the rightmost and the lowest, so two bare „ה___ ביותר”
    // questions about it would have no single answer. Each must carry a cue.
    const supers = [...html.matchAll(/של האות <strong>ד<\/strong>[^<]*?ה<span class="blank"[^>]*data-missing="property"[^>]*><\/span> ביותר/g)];
    for (const m of supers) {
      const tail = html.slice(m.index! + m[0].length, m.index! + m[0].length + 80);
      expect(tail.trimStart().startsWith('במערכת — '), 'a superlative about ד must carry a distinguishing cue').toBe(true);
    }
  });
});
