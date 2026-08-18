import { elem, fromHTML } from '../lib/dom';
import { hydrateGrids } from '../lib/coordinateGrid';
import { fitSheets } from '../lib/fitSheet';
import { bookletBar } from './wsbar';
import { WORKBOOK } from '../data/workbook';
import { renderCoverSheet } from './coverSheet';
import { renderTocSheet } from './tocSheet';
import type { ViewContext } from './context';

/* The continuous booklet — every sheet in one scroll, true A4. This is the
   layout the PRINTER sees; reading happens in the flipbook (#/book). */
export function book({ outlet, setTitle }: ViewContext): (() => void) | void {
  setTitle('החוברת המלאה');
  const c = elem('div', { class: 'container' });

  const bookEl = elem('div', { class: 'book' });

  // One control row, in the zaviyot bar language.
  c.append(bookletBar());

  // Approved cover first, then all worksheets — no math content is altered.
  bookEl.append(renderCoverSheet(), renderTocSheet());
  for (const page of WORKBOOK) {
    bookEl.append(fromHTML(page.html));
  }
  hydrateGrids(bookEl);
  fitSheets(bookEl);

  /* בטלפון אין 794px לרוחב גיליון A4, והפתרון הישן היה לפרוס את העמוד מחדש —
     מה שיצר מסמך שונה מזה שמודפס. במקום זה מוסרים ל-CSS את יחס ההקטנה והוא
     מכווץ את הגיליון כמו תצלום. 210mm = 794px ב-96dpi. */
  const fitToScreen = (): void => {
    const room = document.documentElement.clientWidth;
    bookEl.style.setProperty('--sheet-fit', Math.min(1, (room - 8) / 794).toFixed(4));
  };
  fitToScreen();
  window.addEventListener('resize', fitToScreen);

  /* אין יותר מה להטעין: „המשימות שלנו הן להדפסה" (31.07.2026) — כל עמוד
     בחוברת הוא דף מודפס, ואין עמוד שמארח שעשועון. */
  c.append(bookEl);
  outlet.append(c);
  window.scrollTo({ top: 0 });
  return () => window.removeEventListener('resize', fitToScreen);
}
