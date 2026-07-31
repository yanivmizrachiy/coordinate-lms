import type { WorkbookPageContent } from '../types';
import { posterSheet } from '../authoring';

/* Yaniv's colourful puzzle sheets, placed each right after the page that
   teaches the skill it needs. They are artwork: full A4, their own heading, no
   page number printed on them. Where each one sits is decided in index.ts. */

/** Plot a list of ordered pairs, join them, a picture appears. */
export const POSTER_SECRET_PICTURE: WorkbookPageContent = posterSheet({
  file: 'secret-picture.png',
  title: 'מגלים ציור סודי',
  alt: 'שעשועון ציור סודי: מסמנים קבוצות נקודות בצבעים, מחברים לפי הסדר ומגלים את הציור',
});

/** Read a marked point and identify it by a property. */
export const POSTER_SECRET_WORD: WorkbookPageContent = posterSheet({
  file: 'secret-word-poster.png',
  title: 'מילת הצופן',
  alt: 'שעשועון מילת הצופן: מזהים אותיות לפי שיעורים ולפי תכונות, ומרכיבים את המילה',
});

/** Movement along the grid, and recording where you passed. */
export const POSTER_TREASURE_MAZE: WorkbookPageContent = posterSheet({
  file: 'treasure-maze.png',
  title: 'מבוך האוצר',
  alt: 'שעשועון מבוך: נעים על קווי הרשת מהראשית אל האוצר ורושמים את שיעורי הכוכבים',
});

/** Follow written movement instructions, land on an end point. */
export const POSTER_ROUTE_RACE: WorkbookPageContent = posterSheet({
  file: 'route-race.png',
  title: 'מרוץ המסלולים',
  alt: 'שעשועון מרוץ מסלולים: עוקבים אחרי הוראות תנועה וכותבים את נקודת הסיום של כל מסלול',
});
