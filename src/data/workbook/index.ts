/* ===========================================================================
   Workbook model — the single ordered list of pages plus the topic map used by
   the table of contents.

   Every numbered page is a printed worksheet — „המשימות שלנו הן להדפסה"
   (31.07.2026), so the last five interactive games became printed pages too and
   nothing here mounts a widget. Page numbers are assigned by POSITION, so a page
   can be inserted, split or reordered without hand-editing the number baked in.
   =========================================================================== */
import {
  AXES_IDENTIFY,
  POSTER_SECRET_PICTURE,
  POSTER_SECRET_WORD,
  POSTER_TREASURE_MAZE,
  POSTER_ROUTE_RACE,
  HERO_INTRO,
  PLOT_A,
  PLOT_B,
  PLOT_SHAPE,
  GRAPH_REAL,
  SHAPE_MOVE,
  READ_PAIRS,
  SECRET_WORD_PRINT,
  HIDDEN_DRAWING_PRINT,
  COLOR_DECODE_PRINT,
  ENCRYPTED_ROUTE_PRINT,
  COORDINATE_MAZE_PRINT,
  COORDINATE_SAFE_PRINT,
  SUSPECT_POINT_PRINT,
  SAME_AXIS_PRINT,
  READ_FROM_DRAWING,
  ORDERED_PAIR_DRILL,
  PARALLEL_PERPENDICULAR,
  RIGHT_ANGLE_INTRO,
  RIGHT_ANGLE_PRACTICE,
  RIGHT_ANGLE_BUILD,
  RIGHT_ANGLE_SUMMARY,
  RAYS_RIGHT_ANGLE,
  RAYS_BUILD_RIGHT_ANGLE,
  RAYS_VERTEX_OFF_ORIGIN,
  RAYS_CLAIMS,
  AXES_INTRO,
  AXES_PRACTICE,
  COORDS_INTRO,
  COORDS_PRACTICE,
  ORDERED_PAIR_INTRO,
  ORDERED_PAIR_PRACTICE,
  PLOT_PRACTICE,
  READ_INTRO,
  READ_PRACTICE,
  ON_AXES_INTRO,
  ON_AXES_PRACTICE,
  POSITION_LANGUAGE_INTRO,
  POSITION_LANGUAGE_OWN,
  POSITION_LANGUAGE_PRACTICE,
  SAME_COORD_INTRO,
  SAME_COORD_PRACTICE,
  RELATIONS_INTRO,
  RELATIONS_PRACTICE,
  MOVE_INTRO,
  MOVE_PRACTICE,
  DISTANCE_INTRO,
  DISTANCE_PRACTICE,
  MISSING_COORD_INTRO,
  MISSING_COORD_PRACTICE,
  ERRORS_INTRO,
  ERRORS_PRACTICE,
  RECTANGLES_INTRO,
  RECTANGLES_PRACTICE,
  RECTANGLES_VERTICES,
  SQUARES_INTRO,
  SQUARES_SUMMARY,
  SQUARES_PRACTICE,
  SEGMENT_LENGTH,
  LIFE_PHONE_SCREEN,
  LIFE_HALL_SEATS,
  LIFE_PIXEL_ART,
  LIFE_DELIVERY_ROUTE,
  GRAPH_READING_INTRO,
  GRAPH_YEARS,
  GRAPH_SQUARE_AREA,
  GRAPH_CONSTANT_RATE,
  GRAPH_TWO_SERIES,
  GRAPH_OWN_DATA,
  RULE_TO_GRAPH,
  SHAPES_CLAIMS,
  LIFE_PARK_MAP,
  LIFE_PARK_ROUTE,
} from './pages';
import type { WorkbookPageContent, WorkbookTopic } from './types';

export type { WorkbookPageContent, WorkbookTopic } from './types';

/** Re-stamp a sheet with its final page number (id, aria, visible number, tf group names). */
function renumber(page: WorkbookPageContent, n: number): WorkbookPageContent {
  if (page.n === n) return page;
  const o = page.n;
  const swap = (s: string, a: string, b: string): string => s.split(a).join(b);
  let html = page.html;
  html = swap(html, `id="page-${o}"`, `id="page-${n}"`);
  html = swap(html, `id="title-${o}"`, `id="title-${n}"`);
  html = swap(html, `aria-labelledby="title-${o}"`, `aria-labelledby="title-${n}"`);
  html = swap(html, `aria-label="עמוד ${o}"`, `aria-label="עמוד ${n}"`);
  html = html.replace(new RegExp(`(class="[^"]*sheet-number[^"]*">)${o}<`), `$1${n}<`);
  html = swap(html, `name="tf-${o}-`, `name="tf-${n}-`);
  return { ...page, n, id: `page-${n}`, html };
}

type Slot = WorkbookPageContent;

function rechapter(page: WorkbookPageContent, chapterTitle: string): WorkbookPageContent {
  if (page.title === chapterTitle || page.sectionClass.includes('poster-sheet')) return page;
  const oldSub = page.subtitle ? `<p>${page.subtitle}</p>` : '';
  const html = page.html.replace(
    `>${page.title}</h1>${oldSub}`,
    `>${chapterTitle}</h1><p>${page.title}</p>`,
  );
  return { ...page, title: chapterTitle, subtitle: page.title, html };
}

const BOOK: { id: string; title: string; chapterTitle?: string; slots: Slot[] }[] = [
  { id: 'intro', title: 'היכרות עם מערכת הצירים', chapterTitle: 'הרביע הראשון — מושגים בסיסיים', slots: [
    AXES_IDENTIFY, AXES_INTRO, AXES_PRACTICE,
  ] },
  { id: 'points', title: 'נקודות ברביע הראשון', chapterTitle: 'נקודות ברביע הראשון', slots: [
    HERO_INTRO, COORDS_INTRO, READ_PAIRS, READ_FROM_DRAWING, COORDS_PRACTICE,
    ORDERED_PAIR_INTRO, ORDERED_PAIR_DRILL, ORDERED_PAIR_PRACTICE,
    READ_INTRO, READ_PRACTICE, PLOT_A,
  ] },
  { id: 'onaxes', title: 'נקודות שעל הצירים', chapterTitle: 'נקודות שעל הצירים', slots: [
    ON_AXES_INTRO, ON_AXES_PRACTICE,
  ] },
  { id: 'plot', title: 'סימון נקודות ויישומים', slots: [
    PLOT_B, PLOT_PRACTICE, POSTER_SECRET_PICTURE, HIDDEN_DRAWING_PRINT,
    POSTER_SECRET_WORD, SECRET_WORD_PRINT, GRAPH_REAL,
  ] },
  { id: 'language', title: 'שפה של מיקום', slots: [
    POSITION_LANGUAGE_INTRO, POSITION_LANGUAGE_OWN, POSITION_LANGUAGE_PRACTICE, COLOR_DECODE_PRINT,
  ] },
  { id: 'relations', title: 'יחסים בין שיעורים', slots: [
    RELATIONS_INTRO, RELATIONS_PRACTICE,
  ] },
  { id: 'move', title: 'הזזה ומרחק במערכת הצירים', slots: [
    MOVE_INTRO, MOVE_PRACTICE, POSTER_ROUTE_RACE, DISTANCE_INTRO, DISTANCE_PRACTICE, SHAPE_MOVE, POSTER_TREASURE_MAZE,
    ENCRYPTED_ROUTE_PRINT, COORDINATE_MAZE_PRINT,
  ] },
  { id: 'missing', title: 'שיעור חסר ודפוסים', slots: [
    MISSING_COORD_INTRO, MISSING_COORD_PRACTICE, RULE_TO_GRAPH, COORDINATE_SAFE_PRINT,
  ] },
  { id: 'errors', title: 'זיהוי ותיקון טעויות', slots: [
    ERRORS_INTRO, ERRORS_PRACTICE, SUSPECT_POINT_PRINT,
  ] },
  { id: 'parallel', title: 'קטעים מקבילים לצירים', chapterTitle: 'קטעים מקבילים לצירים', slots: [
    SAME_COORD_INTRO, SEGMENT_LENGTH, SAME_COORD_PRACTICE, SAME_AXIS_PRINT, PARALLEL_PERPENDICULAR,
  ] },
  { id: 'rect', title: 'המלבן ברביע הראשון', chapterTitle: 'המלבן ברביע הראשון', slots: [
    PLOT_SHAPE,
    RECTANGLES_INTRO, RECTANGLES_PRACTICE, RECTANGLES_VERTICES, SQUARES_INTRO, SQUARES_SUMMARY, SQUARES_PRACTICE,
    SHAPES_CLAIMS,
  ] },
  { id: 'life', title: 'מערכת צירים בחיים שלנו', slots: [
    LIFE_PHONE_SCREEN, LIFE_HALL_SEATS, LIFE_PIXEL_ART, LIFE_DELIVERY_ROUTE, LIFE_PARK_MAP, LIFE_PARK_ROUTE,
  ] },
  { id: 'graphs', title: 'קריאת גרפים ברביע הראשון', slots: [
    GRAPH_READING_INTRO, GRAPH_YEARS, GRAPH_SQUARE_AREA,
    GRAPH_CONSTANT_RATE, GRAPH_TWO_SERIES, GRAPH_OWN_DATA,
  ] },
  { id: 'rightangle', title: 'מאונכות וזווית ישרה', slots: [
    RIGHT_ANGLE_INTRO, RIGHT_ANGLE_PRACTICE, RIGHT_ANGLE_BUILD, RAYS_RIGHT_ANGLE, RAYS_BUILD_RIGHT_ANGLE, RAYS_VERTEX_OFF_ORIGIN, RAYS_CLAIMS, RIGHT_ANGLE_SUMMARY,
  ] },
];

const ORDER: Array<{ slot: Slot; chapterTitle?: string }> = BOOK.flatMap((t) =>
  t.slots.map((slot) => ({ slot, ...(t.chapterTitle ? { chapterTitle: t.chapterTitle } : {}) })),
);

export const WORKBOOK: WorkbookPageContent[] = ORDER.map(({ slot, chapterTitle }, i) => {
  const page = chapterTitle ? rechapter(slot, chapterTitle) : slot;
  return renumber(page, i + 1);
});

export const TOTAL_PAGES = WORKBOOK.length;

export const TOPICS: WorkbookTopic[] = (() => {
  let n = 0;
  return BOOK.map((t) => ({
    id: t.id,
    title: t.title,
    pages: t.slots.map(() => ++n),
  }));
})();

const byNumber = new Map(WORKBOOK.map((p) => [p.n, p]));

export const pageByNumber = (n: number): WorkbookPageContent | undefined => byNumber.get(n);

export function topicOfPage(n: number): WorkbookTopic | undefined {
  return TOPICS.find((t) => t.pages.includes(n));
}
