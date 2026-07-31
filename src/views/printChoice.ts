import { elem } from '../lib/dom';
import { printPages } from '../lib/printPages';
import { downloadBooklet, downloadPages } from '../lib/downloadPdf';
import { openPagePicker } from './pagePicker';

/* הבוחר האחד — יניב (31.07.2026): „אחרי שלוחצים על הורדת החוברת יהיה אפשרות
   להוריד הכל או דפים, צבע או שחור-לבן; גם אם לוחצים על הדפסה". לחיצה על
   הורדה או על הדפסה פותחת חלונית אחת נוחה עם שתי שאלות — מה (הכול / דפים
   נבחרים) ובאיזה צבע (צבע / שחור-לבן) — וכפתור פעולה אחד. אין יותר כפתור
   „דפים נבחרים" נפרד בסרגלים.

   כשבוחרים „דפים נבחרים", כפתור הפעולה פותח את רשת העמודים, כשהצבע שנבחר
   כבר נישא איתה — שם נשארת רק לחיצת הביצוע. */

export type ActionMode = 'download' | 'print';

export function openActionChooser(mode: ActionMode, fixedPages?: ReadonlySet<number>): void {
  let scope: 'all' | 'pick' = 'all';
  let bw = false;

  const overlay = elem('div', { class: 'pick', role: 'presentation' });
  const modal = elem('div', {
    class: 'pick__modal pick__modal--choice', role: 'dialog', 'aria-modal': 'true',
    'aria-label': mode === 'download' ? 'הורדת החוברת' : 'הדפסת החוברת', dir: 'rtl',
  });

  const closeBtn = elem('button', {
    class: 'btn btn--ghost btn--sm pick__close', type: 'button', text: 'ביטול ✕', 'aria-label': 'ביטול',
  }) as HTMLButtonElement;

  const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') close(); };
  const opener = document.activeElement as HTMLElement | null;
  function close(): void {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', close);
    overlay.remove();
    opener?.focus?.();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', close);

  /* ---- the two questions, as chip rows ---------------------------------- */
  const chip = (text: string, on: () => boolean, set: () => void): HTMLButtonElement => {
    const b = elem('button', { class: 'pick__chip', type: 'button', text }) as HTMLButtonElement;
    b.addEventListener('click', () => { set(); sync(); });
    chips.push({ el: b, on });
    return b;
  };
  const chips: Array<{ el: HTMLButtonElement; on: () => boolean }> = [];
  const sync = (): void => {
    for (const c of chips) c.el.setAttribute('aria-pressed', String(c.on()));
    act.textContent = label();
  };
  const label = (): string => {
    const verb = mode === 'download' ? '⬇ הורדה' : '🖨 הדפסה';
    const what = fixedPages ? 'הדף הזה' : scope === 'all' ? 'כל החוברת' : 'דפים נבחרים';
    return `${verb} — ${what}, ${bw ? 'שחור־לבן' : 'בצבע'}`;
  };

  const rows: HTMLElement[] = [];
  if (!fixedPages) {
    rows.push(elem('div', { class: 'pick__q' },
      elem('span', { class: 'pick__qlabel', text: 'מה?' }),
      chip('כל החוברת', () => scope === 'all', () => { scope = 'all'; }),
      chip('דפים נבחרים', () => scope === 'pick', () => { scope = 'pick'; }),
    ));
  }
  rows.push(elem('div', { class: 'pick__q' },
    elem('span', { class: 'pick__qlabel', text: 'באיזה צבע?' }),
    chip('בצבע', () => !bw, () => { bw = false; }),
    chip('שחור־לבן', () => bw, () => { bw = true; }),
  ));

  /* ---- the one action ---------------------------------------------------- */
  const act = elem('button', { class: 'btn btn--gold', type: 'button' }) as HTMLButtonElement;
  act.addEventListener('click', () => {
    close();
    if (scope === 'pick' && !fixedPages) { openPagePicker({ mode, bw }); return; }
    const pages = fixedPages ? new Set(fixedPages) : 'all' as const;
    if (mode === 'print') { printPages(pages, bw); return; }
    if (pages === 'all') downloadBooklet(bw);
    else void downloadPages(pages, bw);
  });

  modal.append(
    elem('div', { class: 'pick__head' },
      elem('strong', { class: 'pick__title', text: mode === 'download' ? 'הורדת החוברת' : 'הדפסת החוברת' }),
      closeBtn,
    ),
    elem('div', { class: 'pick__choice' }, ...rows, act),
  );
  overlay.append(modal);
  document.body.append(overlay);
  sync();
  act.focus();
}
