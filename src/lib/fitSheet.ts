import { normaliseGridText } from './coordinateGrid';
/* Fill the sheet, don't leave it half empty.

   A worksheet whose questions happen to be short used to end at 55% of the A4
   page with a band of white below it — the learner gets less room to write and
   the page looks unfinished. The leftover height is measured after the page has
   rendered and handed back to the spaces BETWEEN the blocks, so the sheet
   breathes evenly instead of being padded at the bottom.

   It adds padding rather than switching the container to flex: some sheets lay
   their cards out side by side with inline-block, and a flex COLUMN stacks
   those into one column — the page then doubles in height and is cut off.
   Padding leaves every existing layout exactly as it was.

   Bounded on purpose: never below BASE (a full page stays readable) and never
   above MAX (two blocks on an empty page must not end up at opposite edges of
   the paper). Space left after the cap simply stays as margin — a page may be
   airy, it may not look broken. */

const BASE = 0;
const MAX = 44;
/** How much taller a single drawing may get, at most. */
const GRID_GROWTH = 120;
/** How much air a task item the learner writes in may gain, top and bottom. */
const ANSWER_AIR = 12;
/** How much taller a single writing line may get, at most. */
const LINE_GROWTH = 21;

/** Are these children stacked one under the other, rather than side by side? */
function stacked(box: Element): boolean {
  const kids = [...box.children];
  for (let i = 1; i < kids.length; i++) {
    const prev = kids[i - 1]!.getBoundingClientRect();
    const here = kids[i]!.getBoundingClientRect();
    if (here.height && prev.height && here.top < prev.bottom - 1) return false;
  }
  return true;
}

/** Space out one sheet's blocks so it uses the height it actually has. */
export function fitSheet(sheet: HTMLElement): void {
  sheet.classList.remove('sheet--overflow-tight');
  const content = sheet.querySelector<HTMLElement>('.sheet-content');
  const footer = sheet.querySelector<HTMLElement>('.gz-footer');
  if (!content || !footer) return;
  /* A game sheet grows with its board, so its DRAWINGS must not be stretched —
     but it now carries printed questions under the grid, and those deserve the
     same room to write in as anywhere else. */
  const isGame = sheet.classList.contains('game-sheet');

  /* The page viewer shrinks the sheet to fit the screen. getBoundingClientRect
     reports those shrunken pixels, but `style.height` is written in unscaled
     ones — so measuring 200px on a half-size sheet and writing it back would
     halve the drawing every pass. offsetWidth ignores the transform, so the
     ratio between the two IS the scale, and every measurement divides by it. */
  const scale = sheet.getBoundingClientRect().width / (sheet.offsetWidth || 1) || 1;
  const px = (measured: number): number => measured / scale;

  // Descend past wrappers that hold everything in one box, but never into a
  // row whose children sit next to each other.
  let box: HTMLElement = content;
  while (box.childElementCount === 1 && box.firstElementChild instanceof HTMLElement) {
    box = box.firstElementChild;
  }
  /* Padding can only be shared between blocks that sit one under the other —
     but a drawing and a writing line can grow on ANY sheet, including the ones
     that lay their cards out side by side. Those were the pages left at 58%. */
  const canSpace = box.childElementCount >= 2 && stacked(box);
  const kids = [...box.children] as HTMLElement[];
  for (const k of kids) k.style.paddingTop = '';

  /* Safe to run twice: anything this function resized remembers the height it
     started at, so a second pass measures the sheet as authored rather than
     growing what the first pass already grew. */
  const reset = (el: HTMLElement): void => {
    const base = el.dataset['fitBase'];
    if (base === undefined) el.dataset['fitBase'] = String(Math.round(px(el.getBoundingClientRect().height)));
    else el.style.height = `${base}px`;
  };
  content.querySelectorAll<HTMLElement>('.coordinate-grid, .answer-line').forEach(reset);

  const room = (): number => {
    let lowest = 0;
    for (const el of content.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.height && r.bottom > lowest) lowest = r.bottom;
    }
    return px(footer.getBoundingClientRect().top - lowest);
  };

  /* Canonical pages occasionally become a few pixels taller after wording or
     font changes. Tighten spacing only on a sheet that actually overflows; the
     authored page content and every printable element remain unchanged. */
  if (room() < 0) sheet.classList.add('sheet--overflow-tight');

  /* Spare height goes to the drawings first — a bigger system is worth more to
     a learner than a wider margin. Grown a step at a time and re-measured,
     because two systems sharing a row grow the page once, not twice.

     Two stops guard every step, because CSS cannot be trusted to (a class once
     carried max-width:580px and a grown drawing sailed onto its neighbour):
     - the drawing must stay INSIDE its parent's width — a page may never show
       one drawing painted over another;
     - the box must stay the DRAWING's shape. Once max-width binds, more height
       is only empty bands above and below the drawing, not a bigger drawing. */
  const grids = isGame ? [] : [...content.querySelectorAll<HTMLElement>('.coordinate-grid')];
  const RATIO = 560 / 380;
  const wasted = (g: HTMLElement): boolean => {
    const r = g.getBoundingClientRect();
    const host = g.parentElement?.getBoundingClientRect();
    if (host && r.width > host.width + 1) return true; // escapes the card
    return r.height > 0 && r.width / r.height < RATIO - 0.02; // letterboxing
  };
  const grown = new Map<HTMLElement, number>();
  for (let pass = 0; pass < 5 && grids.length; pass++) {
    if (room() < 110) break;
    let changed = false;
    for (const g of grids) {
      const added = grown.get(g) ?? 0;
      if (added >= GRID_GROWTH) continue;
      const step = Math.min(26, GRID_GROWTH - added);
      const before = g.style.height;
      g.style.height = `${Math.round(px(g.getBoundingClientRect().height) + step)}px`;
      if (wasted(g)) {
        g.style.height = before;
        grown.set(g, GRID_GROWTH); // done growing this one
        continue;
      }
      grown.set(g, added + step);
      changed = true;
    }
    if (!changed) break;
  }
  /* One step too far is possible on the last pass, so give it back — but only
     what this function added. An unbounded loop here hangs the page whenever
     the overflow comes from something other than a drawing. */
  for (let back = 0; back < 6 && room() < 0; back++) {
    let shrank = false;
    for (const g of grids) {
      const added = grown.get(g) ?? 0;
      if (added <= 0) continue;
      const step = Math.min(14, added);
      g.style.height = `${Math.round(px(g.getBoundingClientRect().height) - step)}px`;
      grown.set(g, added - step);
      shrank = true;
    }
    if (!shrank) break;
  }

  /* Still short? Then the writing lines get the room. A wider line to answer on
     is worth more to a learner than a wider margin — and unlike a margin, it is
     something the sheet actually asks them to use. */
  const lines = [...content.querySelectorAll<HTMLElement>('.answer-line')];
  const taller = new Map<HTMLElement, number>();
  for (let pass = 0; pass < 4 && lines.length; pass++) {
    if (room() < 90) break;
    let changed = false;
    for (const l of lines) {
      const added = taller.get(l) ?? 0;
      if (added >= LINE_GROWTH) continue;
      const step = Math.min(7, LINE_GROWTH - added);
      l.style.height = `${Math.round(px(l.getBoundingClientRect().height) + step)}px`;
      taller.set(l, added + step);
      changed = true;
    }
    if (!changed) break;
  }
  for (let back = 0; back < 5 && room() < 0; back++) {
    let shrank = false;
    for (const l of lines) {
      const added = taller.get(l) ?? 0;
      if (added <= 0) continue;
      l.style.height = `${Math.round(px(l.getBoundingClientRect().height) - 7)}px`;
      taller.set(l, added - 7);
      shrank = true;
    }
    if (!shrank) break;
  }

  /* Room still going spare? Then it belongs to the lines the learner writes ON.
     A task list packed at its natural line height leaves a child nowhere to put
     an answer, however much white space sits at the foot of the page — which is
     exactly what Yaniv reported: „יש מקום, אז למה הכל צפוף?”. Only items that
     actually contain a box get the air; a list of instructions stays tight. */
  const writable = [...content.querySelectorAll<HTMLElement>('.tasks li')].filter(
    (li) => li.querySelector('.blank, .word-blank, .pair-blank'),
  );
  for (const li of writable) li.style.paddingBlock = '';
  let air = 0;
  for (let pass = 0; pass < 4 && writable.length; pass++) {
    if (room() < 34) break;
    if (air >= ANSWER_AIR) break;
    air += 3;
    for (const li of writable) li.style.paddingBlock = `${air}px`;
  }
  while (air > 0 && room() < 0) {
    air -= 3;
    for (const li of writable) li.style.paddingBlock = air > 0 ? `${air}px` : '';
  }

  const leftover = room();
  if (!canSpace || leftover <= 8) return;

  const extra = Math.min(MAX, BASE + leftover / (kids.length - 1));
  for (let i = 1; i < kids.length; i++) kids[i]!.style.paddingTop = `${Math.round(extra)}px`;
}

/** Measure only once the sheets are in the document and laid out — off-document
    elements report a height of zero, and every page would keep its own spacing. */
export function fitSheets(root: ParentNode = document): void {
  const run = (): void => {
    root.querySelectorAll<HTMLElement>('.sheet').forEach((s) => {
      // one bad sheet must not stop the rest
      try {
        fitSheet(s);
      } catch {
        /* leave that sheet as authored */
      }
    });
    // growing a drawing changes its scale, so the type has to be re-measured
    normaliseGridText(root);
  };
  requestAnimationFrame(() => requestAnimationFrame(run));
  // A tab that is not visible never fires rAF, and the booklet would then print
  // with every page at the height it happened to be authored at.
  setTimeout(run, 300);
}
