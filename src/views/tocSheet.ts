/* The contents page, as the second sheet of the booklet — right after the
   cover, before page 1. It is a real A4 sheet, so it prints with the rest; on
   screen every chapter is a button that jumps to that chapter's first page.

   The colours are the palette Yaniv chose. The chapters come from BOOK, so this
   page can never go stale; there are more chapters than colours, so the palette
   cycles — and two chapters of one colour are never neighbours, because the
   cycle is longer than any run of related work. */
import { elem } from '../lib/dom';
import { navigate } from '../router';
/* The contents Yaniv asked for: five chapters, named by him, each opening the
   page he named. It is NOT derived from BOOK any more — he wants a reader's
   map, not an index of every section, and „כל השאר תמחק מהתוכן".
   A test checks that every page number here exists. */
export const CONTENTS: ReadonlyArray<{ title: string; page: number }> = [
  { title: 'הרביע הראשון — מושגים בסיסיים', page: 1 },
  { title: 'נקודות במערכת הצירים', page: 12 },
  { title: 'קטעים מקבילים לצירים', page: 29 },
  { title: 'שטחים והיקפים במערכת הצירים', page: 51 },
  { title: 'קריאת גרפים ברביע הראשון', page: 63 },
];
import { DISTRICT_BADGE } from '../data/cover';

/* Yaniv's ten colours, in the order he gave them — „אלה הצבעים של תוכן העניינים
   המסודר שלנו". I had reordered them so no two neighbours shared a hue family;
   the palette is his, so it goes back the way he wrote it. */
const PALETTE = [
  '#2962FF', '#00C853', '#FF6D00', '#D500F9', '#AA00FF',
  '#0091EA', '#FFD600', '#FF1744', '#00E5FF', '#64FFDA',
] as const;

/** The ink that sits ON the coloured tile itself: white where white reads,
    near-black where the tile is too bright to carry it. Measured, not guessed —
    the hand-picked guess was wrong on 8 of these 10 colours once already. */
function textOn(hex: string): string {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin(rgb[0]!) + 0.7152 * lin(rgb[1]!) + 0.0722 * lin(rgb[2]!);
  const whiteRatio = 1.05 / (L + 0.05);
  if (whiteRatio >= 4.5) return '#ffffff';
  /* A mid-luminance tile (the magenta) defeats the navy too — then only true
     black clears the bar. Checked, because 4.1:1 already slipped through once. */
  const navyL = 0.0142; // #0b1f3a
  return (L + 0.05) / (navyL + 0.05) >= 4.6 ? '#0b1f3a' : '#000000';
}

export function renderTocSheet(): HTMLElement {
  const section = elem('section', {
    class: 'sheet toc-sheet', id: 'toc', 'aria-label': 'תוכן העניינים',
  });

  const head = elem('header', { class: 'sheet-header' },
    elem('div', {},
      elem('h1', { text: 'תוכן העניינים' }),
      elem('p', { text: 'מערכת צירים — הרביע הראשון' }),
    ),
  );

  const list = elem('div', { class: 'toc-buttons' });
  for (const [i, topic] of CONTENTS.entries()) {
    const colour = PALETTE[i % PALETTE.length]!;
    const first = topic.page;
    const btn = elem('button', {
      class: 'toc-btn',
      type: 'button',
      style: `--toc-colour:${colour};--toc-text:${textOn(colour)}`,
      'aria-label': `${topic.title}, מתחיל בעמוד ${first}`,
    },
      /* The tile IS the chapter's colour — „כל פרק במשבצת בצבע שונה". The
         white disc carries the chapter number; the CSS reads it from data-no. */
      elem('span', { class: 'toc-btn__rule', 'aria-hidden': 'true', 'data-no': String(i + 1) }),
      elem('span', { class: 'toc-btn__body' },
        elem('span', { class: 'toc-btn__kicker', text: `פרק ${i + 1}` }),
        elem('span', { class: 'toc-btn__name', text: topic.title }),
      ),
      elem('span', { class: 'toc-btn__no', dir: 'ltr', text: String(first) }),
    );
    btn.addEventListener('click', () => navigate(`#/workbook/${first}`));
    list.append(btn);
  }

  const badge = elem('picture', { class: 'gz-badge' });
  badge.append(
    elem('source', { srcset: DISTRICT_BADGE.webp, type: 'image/webp' }),
    elem('img', { src: DISTRICT_BADGE.png, alt: DISTRICT_BADGE.alt, width: 34, height: 34, decoding: 'async' }),
  );
  const foot = elem('footer', { class: 'gz-footer' },
    badge,
    elem('div', { class: 'gz-lines' },
      elem('div', { class: 'f1', text: 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים' }),
      elem('div', { class: 'f2', text: 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין' }),
    ),
  );

  section.append(head, elem('main', { class: 'sheet-content' }, list), foot);
  return section;
}

/** Each chapter with the span of pages it covers. The page picker's presets and
    the flipbook's contents both need spans rather than starting pages, and
    deriving them here is what keeps one list of chapters in the project. */
export function chapterSpans(total: number): Array<{ title: string; from: number; to: number }> {
  return CONTENTS.map((c, i) => ({
    title: c.title,
    from: c.page,
    to: (CONTENTS[i + 1]?.page ?? total + 1) - 1,
  }));
}

/** Go to the contents page — it is the booklet's second sheet, so this opens the
    booklet and brings that sheet into view. Every „תוכן העניינים" button in the
    app calls this, so there is one behaviour and not three. */
export function goToContents(): void {
  navigate('#/book');
  requestAnimationFrame(() => {
    document.getElementById('toc')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}
