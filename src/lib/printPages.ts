import { navigate } from '../router';

/* Printing a chosen set of pages.

   Every sheet is already in the document, so choosing pages costs nothing at
   print time: a sheet outside the choice is marked `print-skip` and the print
   stylesheet drops it. No re-render, no reload, no second copy of the booklet.

   This lives apart from the bars that call it because both the print bar and
   the page picker choose pages, and they must choose them the same way. */

const SKIP = 'print-skip';

/** The page number a sheet carries, or 0 for the cover and the contents page. */
function numberOf(sheet: HTMLElement): number {
  const label = sheet.querySelector('.sheet-number')?.textContent?.trim();
  return label ? Number(label) : 0;
}

/** Show every sheet again — whatever was hidden for one print must not stay
    hidden for the next one. */
export function clearSelection(): void {
  for (const sheet of document.querySelectorAll<HTMLElement>('.sheet')) {
    sheet.classList.remove(SKIP);
  }
}

/** Mark every sheet outside `pages`. The cover and the contents page have no
    number of their own, so they go to the paper only when everything does. */
export function applySelection(pages: ReadonlySet<number> | 'all'): void {
  const all = pages === 'all';
  for (const sheet of document.querySelectorAll<HTMLElement>('.sheet')) {
    const n = numberOf(sheet);
    const keep = all || (n > 0 && (pages as ReadonlySet<number>).has(n));
    sheet.classList.toggle(SKIP, !keep);
  }
}

/** The continuous booklet has to be on screen before it can be printed — the
    flipbook is a stage, not a print layout, so printing goes through #/print. */
function withBooklet(then: () => void): void {
  if (document.querySelectorAll('.book > .sheet').length > 1) { then(); return; }
  navigate('#/print');
  const wait = (): void => {
    if (document.querySelectorAll('.book > .sheet').length > 1) requestAnimationFrame(then);
    else setTimeout(wait, 120);
  };
  setTimeout(wait, 200);
}

/** Send the chosen pages to the printer. The screen always shows colour —
    black-and-white exists only as a PRINT choice, so the class goes on just
    before the dialog and comes off the moment it closes. */
export function printPages(pages: ReadonlySet<number> | 'all', bw = false): void {
  withBooklet(() => {
    applySelection(pages);
    document.body.classList.toggle('bw-print', bw);
    window.print();
  });
}

window.addEventListener('afterprint', () => {
  clearSelection();
  document.body.classList.remove('bw-print');
});
