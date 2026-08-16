/* Authoring helpers — the layer that makes a page easy to edit.
   A page file says what the sheet TEACHES; everything mechanical (the A4
   wrapper, the heading, the page number, the canonical footer) is built here,
   once. To change wording, open the page file and edit plain HTML: normal
   double quotes, no escaping, one element per line. */
import type { WorkbookPageContent } from './types';

/* The district's badge stands with the credit lines it belongs to. It is built
   here, in the one place the footer is built, so every sheet carries it and no
   page can be authored without it. `BASE_URL` keeps the Pages subpath working. */
const BADGE_SRC = `${import.meta.env.BASE_URL}assets/brand/district-logo.webp`;
const BADGE_PNG = `${import.meta.env.BASE_URL}assets/brand/district-logo.png`;

/** THE canonical footer. Exported, because a second copy of it is how eight
    game sheets ended up without the district's badge. */
export const FOOTER =
  '<footer class="gz-footer">' +
  '<picture class="gz-badge">' +
  `<source srcset="${BADGE_SRC}" type="image/webp">` +
  `<img src="${BADGE_PNG}" alt="יחד מתמטיקה — מחוז ירושלים והעיר ירושלים" width="34" height="34" decoding="async" loading="lazy">` +
  '</picture>' +
  '<div class="gz-lines">' +
  '<div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>' +
  '<div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>' +
  '</div>' +
  '</footer>';

/* Page numbers come from the position in BOOK (see index.ts), so a page is
   authored without one. This placeholder only has to be unique until then. */
let placeholder = 500;

export interface SheetSpec {
  /** `sheet guided`, `sheet practice`, `sheet guided dense`… */
  sectionClass: string;
  title: string;
  subtitle?: string;
  /** The sheet body: q-cards, rule boxes, drawings. Plain HTML. */
  content: string;
  /** `main` on most sheets; a few legacy sheets use `div`. */
  contentTag?: 'main' | 'div';
  gameId?: string;
}

export function sheet(spec: SheetSpec): WorkbookPageContent {
  const n = ++placeholder;
  const tag = spec.contentTag ?? 'main';
  const sub = spec.subtitle ? `<p>${spec.subtitle}</p>` : '';
  const html =
    `<section aria-labelledby="title-${n}" class="${spec.sectionClass}" id="page-${n}">` +
    `<header class="sheet-header"><div><h1 id="title-${n}">${spec.title}</h1>${sub}</div>` +
    `<div aria-label="עמוד ${n}" class="sheet-number">${n}</div></header>` +
    `<${tag} class="sheet-content">${spec.content}</${tag}>` +
    FOOTER +
    '</section>';
  return {
    n,
    id: `page-${n}`,
    sectionClass: spec.sectionClass,
    title: spec.title,
    subtitle: spec.subtitle ?? '',
    ...(spec.gameId === undefined ? {} : { gameId: spec.gameId }),
    html,
  };
}

/* A ready-made poster sheet: the artwork fills the whole A4 and carries its own
   heading, so this sheet prints NO header and NO page number — Yaniv's rule, so
   the design is not damaged. It still counts as a numbered page and still
   carries the canonical footer. */
export function posterSheet(spec: { file: string; title: string; alt: string }): WorkbookPageContent {
  const n = ++placeholder;
  const src = `${import.meta.env.BASE_URL}assets/games/${spec.file}`;
  /* The same artwork at a tenth of the weight; the PNG stays behind it so a
     browser that cannot take WebP still prints the poster. */
  const webp = src.replace(/\.png$/, '.webp');
  return {
    n,
    id: `page-${n}`,
    sectionClass: 'sheet poster-sheet',
    title: spec.title,
    subtitle: 'שעשועון',
    html:
      `<section aria-label="${spec.alt}" class="sheet poster-sheet" id="page-${n}">` +
      `<main class="sheet-content">` +
      '<picture>' +
      `<source srcset="${webp}" type="image/webp">` +
      `<img alt="${spec.alt}" class="poster" src="${src}" decoding="async">` +
      '</picture>' +
      `<div aria-label="עמוד ${n}" class="sheet-number poster-number">${n}</div>` +
      `</main>` +
      FOOTER +
      '</section>',
  };
}

/* ---- fragments used on nearly every sheet ---- */

/* What the learner has to supply. Yaniv's rule: consecutive completions must
   ask for DIFFERENT kinds of thing — never the same one three times in a row.
   Tagging each blank is what lets a test enforce that instead of hoping. */
export type Missing =
  | 'letter'    // שם הציר: x / y
  | 'property'  // תכונה: אופקי / אנכי
  | 'direction' // כיוון: ימינה / למעלה
  | 'concept'   // מושג: ראשית הצירים
  | 'number'    // מספר
  | 'relation'  // מה קורה: גדלים / קטנים / זהה
  | 'pair';     // זוג סדור

/** A line for the learner to write on: `blank(4, 'number')` → four wide. */
export const blank = (width = 4, missing?: Missing): string =>
  `<span class="blank"${missing ? ` data-missing="${missing}"` : ''} style="--blank-width:${width}ch"></span>`;

/** The wider box used inside a completion sentence. */
export const wordBlank = (size: 'short' | 'medium' | 'long', missing: Missing, aria: string): string =>
  `<span class="word-blank word-${size}" data-missing="${missing}" aria-label="${aria}"></span>`;

/** An empty ordered pair, optionally named: `pair('B')` → `B( __ , __ )`. */
export const pair = (name = ''): string =>
  `<span class="pair math-ltr" dir="ltr">${name}(<span class="pair-blank"></span>,` +
  '<span class="pair-blank"></span>)</span>';

/** Latin letters and equations inside Hebrew text must be pinned LTR. */
export const ltr = (math: string): string =>
  `<span class="math-ltr" dir="ltr">${math}</span>`;

/** A fraction the way a textbook sets it: numerator over denominator. */
export const frac = (num: number, den: number): string =>
  `<span class="frac" aria-label="${num} חלקי ${den}">` +
  `<span class="frac__n">${num}</span><span class="frac__d">${den}</span></span>`;

/** A mixed number — digits, never words: `mixed(3, 1, 2)` → 3½. */
export const mixed = (whole: number, num: number, den: number): string =>
  `<span class="mixed math-ltr" dir="ltr" aria-label="${whole} ו-${num} חלקי ${den}">` +
  `${whole}${frac(num, den)}</span>`;

/* Room to work, and then the answer — Yaniv's rule: „הדרך חשובה מאוד מאוד, לא
   לוותר על הכתיבה של הדרך”, and the answer is not an answer without its unit.
   `S` is area and `P` is perimeter, the letters an Israeli textbook uses. */
export const calcBox = (o: { lines?: number; perimeter?: boolean; area?: boolean; name?: string; shape?: string }): string => {
  /* Yaniv, 31.07.2026 — the binding format: the working is written on REAL
     squared notebook paper („מחברת משבצות"), not ruled lines. The quantity's
     letter opens the exercise at the LEFT with its equals sign — „P = ‎" —
     and the learner continues writing after the equals, on the squares.
     The answer is a construct phrase: „היקף המלבן הוא ____ יח'." — never
     „ההיקף הוא". `shape` names the figure („המלבן" unless told otherwise —
     „הריבוע" on the squares pages, „הצורה" where naming it would give the
     answer away). Two quantities still sit side by side. */
  const rows = o.lines ?? 2;
  const shape = o.shape ?? 'המלבן';
  const slot = (heading: string, letter: string, word: string): string =>
    '<div class="calc-sec">' +
    `<b class="calc-label">${heading}</b>` +
    `<div class="calc-work calc-squared" style="--calc-rows:${rows}">` +
    '<span class="calc-squared__opener" dir="ltr">' +
    `<span class="calc-sym"><span class="calc-sym__math" dir="ltr">${letter}${o.name ? `<sub>${o.name}</sub>` : ''}</span>` +
    `<span class="calc-sym__hint">${word}</span></span>` +
    '<span class="calc-squared__eq">=</span>' +
    '</span>' +
    '</div>' +
    '</div>';
  const answer = (word: string, unit: string): string =>
    `<div class="calc-final__row">${word} ${shape} הוא ${blank(6, 'number')} ${unit}.</div>`;
  const slots: string[] = [];
  const answers: string[] = [];
  if (o.perimeter) { slots.push(slot('חישוב היקף המלבן:', 'P', 'היקף')); answers.push(answer('היקף', "יח'")); }
  if (o.area) { slots.push(slot('חישוב שטח המלבן:', 'S', 'שטח')); answers.push(answer('שטח', 'יח"ר')); }
  if (!slots.length) {
    slots.push(`<b class="calc-label">תרגיל:</b><div class="calc-work calc-squared" style="--calc-rows:${rows}"></div>`);
  }
  const body = slots.length === 2 ? `<div class="calc-cols">${slots.join('')}</div>` : slots.join('');
  const finals = answers.length
    ? `<div class="calc-final${answers.length === 2 ? ' calc-cols' : ''}">${answers.join('')}</div>`
    : '';
  return `<div class="calc-box">${body}${finals}</div>`;
};

/* An exercise is written the way it is worked: LEFT to right. „BC = תרגיל =
   תוצאה”, on one pinned line, and then the value of that side on the line under
   it. Yaniv's format — a subtraction that reads backwards is not a subtraction. */
/** The value of that side, stated on its own line: „BC = ____ יח'”. */
export const sideValue = (name: string, unit = "יח'"): string =>
  '<div class="calc-ltr" dir="ltr">' +
  `<span class="calc-ltr__name">${name}</span><span class="calc-ltr__eq">=</span>` +
  `${blank(4, 'number')}<span class="calc-ltr__unit" dir="rtl">${unit}</span></div>`;

/* Yaniv's format is TWO lines, and they may never come apart: „יש תרגיל ותשובה
   מתחת… וצריך מספיק מקום לכל תרגיל ולכתוב תשובה בשורה מתחת." So one call emits
   both — the working, with room to write it, and the value on the line below.
   Splitting them into two calls is how page 74 ended up with exercises and no
   answers under them. */
export const exercise = (name: string, unit = "יח'"): string =>
  '<div class="calc-pair">' +
  '<div class="calc-ltr" dir="ltr">' +
  `<span class="calc-ltr__name">${name}</span><span class="calc-ltr__eq">=</span>` +
  `${blank(16, 'number')}<span class="calc-ltr__eq">=</span>${blank(5, 'number')}` +
  `<span class="calc-ltr__unit" dir="rtl">${unit}</span></div>` +
  sideValue(name, unit) +
  '</div>';

/* The unit („יח'”, „יח\"ר”) is a Hebrew word, and the geresh at its end is a
   NEUTRAL character: inside the dir="ltr" calculation line it takes the line's
   direction and lands to the RIGHT of the word — „the geresh is in the wrong
   place”. Measured: י at 460, ח at 451, and the geresh at 464. So the unit keeps
   its own Hebrew direction, and only the calculation around it runs LTR. */

/** „AB = 7 − 2 = ____ יח'” — the subtraction is GIVEN and the learner writes the
    result. Same left-to-right line as exercise(); the name may be left out where
    the quantity has none (a difference in years, in centimetres, in seats). */
export const exerciseGiven = (name: string, calc: string, unit = "יח'"): string =>
  '<div class="calc-pair">' +
  '<div class="calc-ltr" dir="ltr">' +
  (name ? `<span class="calc-ltr__name">${name}</span><span class="calc-ltr__eq">=</span>` : '') +
  `<span>${calc}</span><span class="calc-ltr__eq">=</span>${blank(5, 'number')}` +
  `<span class="calc-ltr__unit" dir="rtl">${unit}</span></div>` +
  /* No value line here, and that is the point: the subtraction is printed, so
     the blank on this line already IS the answer. Repeating it underneath asks
     the same thing twice. The two-line block belongs to exercise(), where the
     learner writes the working and then states what the side equals. */
  '</div>';

/** A labelled cell grid the learner COLOURS by hand — the printable stand-in
    for the colour-decode game. Columns x:0..xmax, rows y:0..ymax. `.color-grid`
    is `direction: ltr` so the origin sits bottom-LEFT and x grows to the right,
    exactly like every coordinate drawing in the booklet — the first quadrant,
    not a mirror of it. Plain spans, never a <button>: „המשימות שלנו הן
    להדפסה", and a printed page carries no widget. */
export const colorGrid = (xmax: number, ymax: number): string => {
  const cols = xmax + 1;
  let body = '';
  for (let y = ymax; y >= 0; y--) {
    let row = `<span class="cg-lab cg-lab--y">${y}</span>`;
    for (let x = 0; x <= xmax; x++) row += `<span class="cg-cell" aria-label="תא ${x},${y}"></span>`;
    body += row;
  }
  let foot = '<span class="cg-lab"></span>';
  for (let x = 0; x <= xmax; x++) foot += `<span class="cg-lab cg-lab--x">${x}</span>`;
  return (
    `<div class="color-grid" role="img" aria-label="רשת תאים לצביעה" ` +
    `style="--cg-cols:${cols}">${body}${foot}</div>`
  );
};

/** „מחסן מילים” — the words to choose from, so the task needs no explaining. */
export const wordBank = (words: string[]): string =>
  '<div class="word-bank"><b>מחסן מילים:</b> ' +
  words.map((w) => `<span class="word-bank__item">${w}</span>`).join(' ') +
  '</div>';

export interface GridOptions {
  size?: 'hero' | 'lg' | 'md' | 'sm' | 'xs';
  label?: string;
  points?: unknown[];
  segments?: unknown[];
  polygons?: unknown[];
  arrows?: unknown[];
  labelboxes?: unknown[];
  /** false when naming the axes IS the task — printing them gives it away,
      so the drawing shows empty boxes to write the names in instead. */
  axisNames?: boolean;
  /** With axisNames:false — two boxes at the origin for „ראשית הצירים”
      (two words) instead of one box for the letter O. */
  originName?: boolean;
  /** The right-angle mark where the axes meet is drawn by default; set false
      only on a sheet that has a reason to hide it. */
  originAngle?: boolean;
  axisX?: string;
  axisY?: string;
  /** Axis ranges — 8×6 unless the page's data needs more room. A point must
      never be plotted outside the system it stands in. */
  xmax?: number;
  ymax?: number;
  /** Numbers along an axis; `''` leaves an empty box for the learner to fill.
      Index = the value on that axis, so ['', 1, 2] blanks the first tick. */
  xlabels?: (number | string)[];
  ylabels?: (number | string)[];
}

/** A coordinate system. Keeps the JSON out of hand-escaped attributes.

    The JSON sits inside a single-quoted attribute, so an apostrophe in a label
    („מרחק 4 יח'”) would close the attribute early and the browser would drop
    every box on the drawing — silently, with nothing in the console. Escaping
    here means no page has to remember. */
const attrJson = (value: unknown): string =>
  JSON.stringify(value).replace(/'/g, '&#39;');

export function grid(o: GridOptions = {}): string {
  const data = (name: string, value: unknown[] | undefined): string =>
    ` data-${name}='${attrJson(value ?? [])}'`;
  return (
    `<div class="coordinate-grid grid-${o.size ?? 'md'}" role="img"` +
    ` aria-label="${o.label ?? 'מערכת צירים ברביע הראשון'}"` +
    data('points', o.points) +
    data('segments', o.segments) +
    data('polygons', o.polygons) +
    data('arrows', o.arrows) +
    data('labelboxes', o.labelboxes) +
    (o.axisNames === false ? ' data-axisnames="false"' : '') +
    (o.originName ? ' data-originname="true"' : '') +
    (o.originAngle === false ? ' data-originangle="false"' : '') +
    (o.axisX ? ` data-axisx="${o.axisX}"` : '') +
    (o.axisY ? ` data-axisy="${o.axisY}"` : '') +
    (o.xmax ? ` data-xmax="${o.xmax}"` : '') +
    (o.ymax ? ` data-ymax="${o.ymax}"` : '') +
    (o.xlabels ? ` data-xlabels='${attrJson(o.xlabels)}'` : '') +
    (o.ylabels ? ` data-ylabels='${attrJson(o.ylabels)}'` : '') +
    '></div>'
  );
}
