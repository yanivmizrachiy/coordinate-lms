import { elem, fromHTML } from '../lib/dom';
import { hydrateGrids } from '../lib/coordinateGrid';
import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';
import { downloadPages } from '../lib/downloadPdf';
import { printPages } from '../lib/printPages';
import { chapterSpans } from './tocSheet';

/* ===========================================================================
   בורר עמודים — המורה בוחר בדיוק אילו עמודים להוריד או להדפיס.

   מועתק מבורר העמודים של פרויקט הזוויות (WorksheetPicker): אותה חלונית, אותם
   פריסטים לפי שערי החוברת, אותה רשת ממוזערות עם סימן וי בפינה, ואותה שורת
   פעולות למטה. ההבדל היחיד הוא שאצלנו העמוד הוא DOM חי ולא תמונה — ולכן
   הממוזערת נבנית רק כשהיא נכנסת למסך, ולא 77 פעמים מראש.
   =========================================================================== */

export interface PickerAction {
  mode: 'download' | 'print';
  bw: boolean;
}

export function openPagePicker(action: PickerAction = { mode: 'print', bw: false }): void {
  const selected = new Set<number>();
  const groups = chapterSpans(TOTAL_PAGES);

  const overlay = elem('div', { class: 'pick', role: 'presentation' });
  const modal = elem('div', {
    class: 'pick__modal', role: 'dialog', 'aria-modal': 'true',
    'aria-label': 'בחירת עמודים להורדה או הדפסה', dir: 'rtl',
  });

  /* ---- head ------------------------------------------------------------- */
  const closeBtn = elem('button', {
    class: 'btn btn--ghost btn--sm pick__close', type: 'button', text: 'סגירה ✕', 'aria-label': 'סגירה',
  }) as HTMLButtonElement;
  modal.append(
    elem('div', { class: 'pick__head' },
      elem('strong', { class: 'pick__title', text: 'בחירת עמודים — הורדה או הדפסה' }),
      closeBtn,
    ),
  );

  /* ---- presets ---------------------------------------------------------- */
  const presets = elem('div', { class: 'pick__presets' });
  const chips: Array<{ el: HTMLElement; pages: number[] | null }> = [];

  const chip = (label: string, pages: number[] | null): HTMLElement => {
    const b = elem('button', { class: 'pick__chip', type: 'button', text: label });
    b.addEventListener('click', () => {
      selected.clear();
      if (pages) for (const p of pages) selected.add(p);
      syncAll();
    });
    chips.push({ el: b, pages });
    presets.append(b);
    return b;
  };

  const everyPage = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
  chip(`כל החוברת (${TOTAL_PAGES})`, everyPage);
  for (const g of groups) {
    const pages = everyPage.filter((p) => p >= g.from && p <= g.to);
    chip(`רק ${g.title} (${pages.length})`, pages);
  }
  chip('ניקוי הבחירה', null);
  modal.append(presets);

  /* ---- the grid of pages ------------------------------------------------ */
  const grid = elem('div', { class: 'pick__grid' });
  const cards = new Map<number, HTMLButtonElement>();

  /* A real miniature of the page, built only when the card reaches the screen.
     Building all 77 up front means 77 sheets of SVG before the teacher has
     chosen anything — the reason their picker uses flat images and ours does
     not have any to use. */
  const lazy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const card = entry.target as HTMLElement;
      lazy.unobserve(card);
      const n = Number(card.dataset['page']);
      const page = WORKBOOK[n - 1];
      const slot = card.querySelector('.pick__paper');
      if (!page || !slot) continue;
      const mini = elem('div', { class: 'pick__mini', 'aria-hidden': 'true' });
      const sheet = fromHTML(page.html);
      hydrateGrids(sheet);
      mini.append(sheet);
      slot.replaceChildren(mini);
    }
  }, { root: grid, rootMargin: '400px 0px' });

  for (const g of groups) {
    grid.append(elem('p', { class: 'pick__group', text: g.title }));
    for (const n of everyPage.filter((p) => p >= g.from && p <= g.to)) {
      const page = WORKBOOK[n - 1];
      const card = elem('button', {
        class: 'pick__card', type: 'button', 'data-page': String(n),
        title: `${page?.title ?? ''} — עמוד ${n}`,
        'aria-label': `עמוד ${n} — ${page?.title ?? ''}`,
      },
        elem('span', { class: 'pick__tick', 'aria-hidden': 'true' }),
        elem('span', { class: 'pick__paper' }),
        elem('span', { class: 'pick__no', text: `עמוד ${n}` }),
        elem('span', { class: 'pick__name', text: page?.title ?? '' }),
      ) as HTMLButtonElement;
      card.addEventListener('click', () => {
        if (selected.has(n)) selected.delete(n); else selected.add(n);
        syncAll();
      });
      cards.set(n, card);
      grid.append(card);
      lazy.observe(card);
    }
  }
  modal.append(grid);

  /* ---- foot: ONE action — the chooser already decided what and in which
     colour; here the teacher only marks the pages and fires. ------------- */
  const count = elem('span', { class: 'pick__count' });

  const actText = action.mode === 'download'
    ? `⬇ הורדת הנבחרים (${action.bw ? 'שחור־לבן' : 'צבע'})`
    : `🖨 הדפסת הנבחרים (${action.bw ? 'שחור־לבן' : 'צבע'})`;
  const goBtn = elem('button', { class: 'btn btn--gold btn--sm', type: 'button', text: actText }) as HTMLButtonElement;
  goBtn.addEventListener('click', () => {
    const pages = new Set(selected);
    close();
    if (action.mode === 'download') void downloadPages(pages, action.bw);
    else printPages(pages, action.bw);
  });

  modal.append(
    elem('div', { class: 'pick__foot' },
      count,
      elem('span', { class: 'pick__acts' }, goBtn),
    ),
  );

  /* ---- keeping every control in step with the selection ----------------- */
  function syncAll(): void {
    for (const [n, card] of cards) card.setAttribute('aria-pressed', String(selected.has(n)));
    for (const c of chips) {
      const on = c.pages !== null
        && c.pages.length === selected.size
        && c.pages.every((p) => selected.has(p));
      c.el.setAttribute('aria-pressed', String(on));
    }
    count.textContent = selected.size ? `נבחרו ${selected.size} עמודים` : 'לא נבחרו עמודים';
    count.classList.toggle('pick__count--empty', selected.size === 0);
    goBtn.disabled = selected.size === 0;
  }
  syncAll();

  /* ---- opening and closing ---------------------------------------------- */
  const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') close(); };
  const prevOverflow = document.body.style.overflow;
  const opener = document.activeElement as HTMLElement | null;

  function close(): void {
    lazy.disconnect();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', close);
    document.body.style.overflow = prevOverflow;
    overlay.remove();
    opener?.focus?.();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
  /* The modal lives on <body>, outside the router's outlet — a route change
     would swap the screen underneath and leave it standing. */
  window.addEventListener('hashchange', close);
  document.body.style.overflow = 'hidden';

  overlay.append(modal);
  document.body.append(overlay);
  closeBtn.focus();
}
