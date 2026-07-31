import { elem, fromHTML } from '../lib/dom';
import { hydrateGrids } from '../lib/coordinateGrid';
import { fitSheets } from '../lib/fitSheet';
import { bookletBar } from './wsbar';
import { WORKBOOK } from '../data/workbook';
import { gameById } from '../games';
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

  // Game sheets host their interactive game inline, like any other page.
  const cleanups: Array<() => void> = [];
  for (const page of WORKBOOK) {
    if (!page.gameId) continue;
    const host = bookEl.querySelector<HTMLElement>(`#${page.id} [data-game-host]`);
    const g = gameById(page.gameId);
    if (host && g) cleanups.push(g.mount(host));
  }

  c.append(bookEl);
  outlet.append(c);
  window.scrollTo({ top: 0 });
  return () => { for (const fn of cleanups) fn(); };
}
