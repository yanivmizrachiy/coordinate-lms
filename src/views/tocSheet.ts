/* The contents page, as the second sheet of the booklet — right after the
   cover, before page 1. It is a real A4 sheet, so it prints with the rest; on
   screen every chapter is a button that jumps to that chapter's first page.

   The design Yaniv chose (31.07.2026): „דף עיזבון על נייר" — the Hermès/Aesop
   estate page. Warm cream paper, a centred serif title, and one chapter per
   row: the chapter name in a large serif on the right, a dotted leader, and the
   page it starts on as a big colour number on the left. Large type and generous
   spacing so the entries fill the whole A4 page — „תגדיל מספרי העמודים ותגדיל
   כתב של שמות הפרקים, יותר רווחים כדי לנצל כל העמוד".
   Serif faces are bundled locally (no runtime fetch). */
/* רק תת-הקבוצות והמשקלים שבאמת בשימוש. הייבוא הכללי (`400.css`) מושך את כל
   תת-הקבוצות — כולל קירילית וּויאטנמית — ומכניס 30 קובצי Cormorant לבנייה
   כדי לצייר ספרות. Frank Ruhl נדרש לעברית במשקלים 300 (הכותרת) ו-400 (השאר),
   ו-latin לספרות/אותיות לועזיות שעשויות להופיע בשם פרק. Cormorant משמש רק
   למספרי העמודים — משקל 700, לטינית בלבד. (02.08.2026) */
import '@fontsource/frank-ruhl-libre/hebrew-300.css';
import '@fontsource/frank-ruhl-libre/hebrew-400.css';
import '@fontsource/frank-ruhl-libre/latin-300.css';
import '@fontsource/frank-ruhl-libre/latin-400.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import { elem } from '../lib/dom';
import { navigate } from '../router';
/* The contents Yaniv asked for: the chapters he named, each opening the page he
   named. It is NOT derived from BOOK any more — he wants a reader's map, not an
   index of every section, and „כל השאר תמחק מהתוכן".
   A test checks that every page number here exists. */
/* הפרקים בשמות שיניב נתן (31.07.2026) — הכותרת בתוכן זהה מילה במילה לכותרת
   האחידה שעל דפי הפרק. */
export const CONTENTS: ReadonlyArray<{ title: string; page: number }> = [
  { title: 'הרביע הראשון — מושגים בסיסיים', page: 1 },
  { title: 'נקודות ברביע הראשון', page: 4 },
  { title: 'נקודות שעל הצירים', page: 15 },
  { title: 'קטעים מקבילים לצירים', page: 46 },
  { title: 'המלבן ברביע הראשון', page: 51 },
  { title: 'קריאת גרפים ברביע הראשון', page: 65 },
];
import { DISTRICT_BADGE } from '../data/cover';

/* One colour per chapter — Yaniv's palette family (blue, green, orange,
   magenta, blue), each DARKENED so it clears 4.5:1 as large ink on the cream
   paper. A saturated hue that reads on white would vanish on cream; a test
   measures the real ratio and fails if a number goes faint. */
const CHAPTER_COLOURS = [
  '#1A4FD1', '#1B6E36', '#9C4A0A', '#A312C0', '#0A6FA8',
] as const;

export function renderTocSheet(): HTMLElement {
  const section = elem('section', {
    class: 'sheet toc-sheet', id: 'toc', 'aria-label': 'תוכן העניינים',
  });

  /* The heading is centred: the unit's name as a letterspaced kicker between
     two hairlines, the title in a large light serif, then the unit in italic. */
  const head = elem('header', { class: 'toc-head' },
    elem('div', { class: 'toc-head__frame' },
      elem('p', { class: 'toc-head__kicker', text: 'חוברת עבודה' }),
    ),
    elem('h1', { class: 'toc-head__title', text: 'תוכן העניינים' }),
    elem('p', { class: 'toc-head__sub', text: 'מערכת צירים — הרביע הראשון' }),
  );

  const list = elem('div', { class: 'toc-buttons' });
  for (const [i, topic] of CONTENTS.entries()) {
    const colour = CHAPTER_COLOURS[i % CHAPTER_COLOURS.length]!;
    const first = topic.page;
    const btn = elem('button', {
      class: 'toc-btn',
      type: 'button',
      style: `--toc-colour:${colour}`,
      'aria-label': `${topic.title}, מתחיל בעמוד ${first}`,
    },
      /* מספר אחד בלבד — „לא צריך כפל מספרים" (31.07.2026): המספר הצבעוני
         הגדול הוא מספר העמוד, בקצה השמאלי, וקו מנוקד מוביל אליו מהכותרת —
         כמו בתוכן עניינים של ספר אמיתי. */
      elem('span', { class: 'toc-btn__name', text: topic.title }),
      elem('span', { class: 'toc-btn__leader', 'aria-hidden': 'true' }),
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
