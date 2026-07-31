/* ===========================================================================
   Workbook model — the single ordered list of pages plus the topic map used by
   the table of contents.

   Worksheets and the 8 games are interleaved by topic: each game is a numbered
   worksheet page that hosts the interactive game (see `gameId`). Page numbers
   are assigned by POSITION here, so a page can be inserted, split or reordered
   without hand-editing the number baked into every sheet.
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
} from './pages';
import { GAMES, type GameDefinition } from '../../games';
import { FOOTER } from './authoring';
import type { WorkbookPageContent, WorkbookTopic } from './types';

export type { WorkbookPageContent, WorkbookTopic } from './types';

const game = (id: string): GameDefinition => {
  const g = GAMES.find((x) => x.id === id);
  if (!g) throw new Error(`game ${id} missing`);
  return g;
};

/* The one footer, from the one place that builds it. It used to be copied out
   here, and the copy is exactly why the eight game sheets had no badge on them
   when the badge was added to the original. */
const FOOTER_HTML = FOOTER;

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
  // Any class list containing sheet-number — a poster's circle also carries
  // poster-number, and an exact-match swap left it showing its placeholder.
  html = html.replace(new RegExp(`(class="[^"]*sheet-number[^"]*">)${o}<`), `$1${n}<`);
  html = swap(html, `name="tf-${o}-`, `name="tf-${n}-`);
  return { ...page, n, id: `page-${n}`, html };
}

/** A game becomes a numbered worksheet page hosting the interactive game. */
function gamePage(g: GameDefinition, n: number): WorkbookPageContent {
  const html =
    `<section aria-labelledby="title-${n}" class="sheet game-sheet" id="page-${n}">` +
    `<header class="sheet-header"><div><h1 id="title-${n}">${g.icon} ${g.title}</h1><p>${g.short}</p></div>` +
    `<div aria-label="עמוד ${n}" class="sheet-number">${n}</div></header>` +
    `<main class="sheet-content"><div class="game-host" data-game-host="${g.id}"></div></main>` +
    FOOTER_HTML +
    '</section>';
  return {
    n,
    id: `page-${n}`,
    sectionClass: 'sheet game-sheet',
    title: g.title,
    subtitle: g.skill,
    html,
    gameId: g.id,
  };
}

type Slot = WorkbookPageContent | GameDefinition;
const isGame = (s: Slot): s is GameDefinition => typeof (s as GameDefinition).mount === 'function';

/* The canonical order — worksheets and games interleaved, grouped by topic.
   Page numbers AND the topic map are both derived from this one list, so
   inserting or splitting a page is a single-line change: never renumber by
   hand, and a topic can never drift out of sync with the pages it names. */
const BOOK: { id: string; title: string; slots: Slot[] }[] = [
  { id: 'intro', title: 'היכרות עם מערכת הצירים', slots: [
    // Identification first: names of the axes and the origin, nothing more.
    // The ordered pair only starts in the next topic (Yaniv's rule).
    AXES_IDENTIFY, AXES_INTRO, AXES_PRACTICE,
  ] },
  { id: 'coords', title: 'שיעור x, שיעור y והזוג הסדור', slots: [
    HERO_INTRO,
    COORDS_INTRO, READ_PAIRS, READ_FROM_DRAWING, COORDS_PRACTICE, ORDERED_PAIR_DRILL, ORDERED_PAIR_INTRO, ORDERED_PAIR_PRACTICE,
  ] },
  { id: 'read', title: 'קריאת נקודות ונקודות על הצירים', slots: [
    READ_INTRO, READ_PRACTICE, ON_AXES_INTRO, ON_AXES_PRACTICE, POSTER_SECRET_WORD, GRAPH_REAL, SECRET_WORD_PRINT,
  ] },
  { id: 'plot', title: 'סימון נקודות', slots: [
    PLOT_A, PLOT_B, PLOT_PRACTICE, POSTER_SECRET_PICTURE, PLOT_SHAPE, game('hidden-drawing'),
  ] },
  { id: 'language', title: 'שפה של מיקום', slots: [
    POSITION_LANGUAGE_INTRO, POSITION_LANGUAGE_OWN, POSITION_LANGUAGE_PRACTICE, game('color-decode'),
  ] },
  { id: 'same', title: 'שיעורים זהים וקטעים מקבילים', slots: [
    SAME_COORD_INTRO, SEGMENT_LENGTH, SAME_COORD_PRACTICE, game('same-axis'),
  ] },
  { id: 'relations', title: 'יחסים בין שיעורים', slots: [
    RELATIONS_INTRO, RELATIONS_PRACTICE,
  ] },
  { id: 'move', title: 'הזזה ומרחק במערכת הצירים', slots: [
    MOVE_INTRO, MOVE_PRACTICE, POSTER_ROUTE_RACE, DISTANCE_INTRO, DISTANCE_PRACTICE, SHAPE_MOVE, POSTER_TREASURE_MAZE,
    game('encrypted-route'), game('coordinate-maze'),
  ] },
  { id: 'missing', title: 'שיעור חסר ודפוסים', slots: [
    // From a pattern the learner NAMES a rule; here the rule is GIVEN and the
    // learner builds the table and the points — the same road, walked back.
    MISSING_COORD_INTRO, MISSING_COORD_PRACTICE, RULE_TO_GRAPH, game('coordinate-safe'),
  ] },
  { id: 'errors', title: 'זיהוי ותיקון טעויות', slots: [
    ERRORS_INTRO, ERRORS_PRACTICE, game('suspect-point'),
  ] },
  { id: 'rect', title: 'מלבנים, ריבועים, היקף ושטח', slots: [
    RECTANGLES_INTRO, RECTANGLES_PRACTICE, RECTANGLES_VERTICES, SQUARES_INTRO, SQUARES_SUMMARY, SQUARES_PRACTICE,
    // The chapter's closing sheet: claims that need everything above them —
    // coordinates, moves, area and perimeter — and the counterexample craft.
    SHAPES_CLAIMS,
  ] },
  { id: 'life', title: 'מערכת צירים בחיים שלנו', slots: [
    LIFE_PHONE_SCREEN, LIFE_HALL_SEATS, LIFE_PIXEL_ART, LIFE_DELIVERY_ROUTE, LIFE_PARK_MAP,
  ] },
  { id: 'graphs', title: 'קריאת גרפים ברביע הראשון', slots: [
    GRAPH_READING_INTRO, GRAPH_YEARS, GRAPH_SQUARE_AREA,
    GRAPH_CONSTANT_RATE, GRAPH_TWO_SERIES, GRAPH_OWN_DATA,
  ] },
  { id: 'rightangle', title: 'מקביל, מאונך וזווית ישרה', slots: [
    PARALLEL_PERPENDICULAR, RIGHT_ANGLE_INTRO, RIGHT_ANGLE_PRACTICE, RIGHT_ANGLE_BUILD, RAYS_RIGHT_ANGLE, RAYS_BUILD_RIGHT_ANGLE, RAYS_VERTEX_OFF_ORIGIN, RAYS_CLAIMS, RIGHT_ANGLE_SUMMARY,
  ] },
];

const ORDER: Slot[] = BOOK.flatMap((t) => t.slots);

export const WORKBOOK: WorkbookPageContent[] = ORDER.map((slot, i) =>
  isGame(slot) ? gamePage(slot, i + 1) : renumber(slot, i + 1),
);

export const TOTAL_PAGES = WORKBOOK.length;

/* Derived from BOOK — never hand-numbered. */
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
