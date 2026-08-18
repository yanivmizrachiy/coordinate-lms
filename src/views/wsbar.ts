import { elem } from '../lib/dom';
import { navigate } from '../router';
import { TOTAL_PAGES } from '../data/workbook';
import { openActionChooser } from './printChoice';
import { goToContents } from './tocSheet';

/* ===========================================================================
   סרגלי הקריאה — שפת סרגלי הזוויות: נייבי דביק, חזרה לאתר מימין, הכותרת
   במרכז, והפעולות משמאל.

   שני עקרונות של יניב (30.07.2026):
   - „כפתורים של הורדה והדפסה צריכים להיות שונים!" — הורדה נותנת קובץ PDF
     מוכן, מיד; הדפסה פותחת בחירת צבע/שחור-לבן ואז את המדפסת.
   - „החוברת מוצגת בצבעוני" — אין מתג שחור-לבן על המסך; הבחירה קיימת רק
     בלחיצת הדפסה.
   =========================================================================== */

const ghost = (text: string, onClick: () => void): HTMLButtonElement => {
  const b = elem('button', { class: 'btn btn--ghost btn--sm', type: 'button', text }) as HTMLButtonElement;
  b.addEventListener('click', onClick);
  return b;
};
const gold = (text: string, onClick: () => void): HTMLButtonElement => {
  const b = elem('button', { class: 'btn btn--gold btn--sm', type: 'button', text }) as HTMLButtonElement;
  b.addEventListener('click', onClick);
  return b;
};

/** סרגל החוברת המלאה. */
export function bookletBar(): HTMLElement {
  return elem('div', { class: 'wsbar no-print', 'data-noprint': '' },
    elem('span', { class: 'wsbar__side' },
      ghost('‹ חזרה לאתר', () => navigate('#/')),
      ghost('☰ תוכן העניינים', goToContents),
    ),
    elem('span', { class: 'wsbar__title', text: `חוברת העבודה · ${TOTAL_PAGES} עמודים ממוספרים` }),
    elem('span', { class: 'wsbar__side wsbar__side--acts' },
      ghost('⬇ הורדה (PDF)', () => openActionChooser('download')),
      gold('🖨 הדפסה', () => openActionChooser('print')),
    ),
  );
}

/** סרגל הדף הבודד. */
export function readerBar(page: number): HTMLElement {
  const navBtn = (arrow: string, label: string, cls: string, go: () => void): HTMLButtonElement => {
    const b = elem('button', { class: `btn btn--sm btn--nav ${cls}`, type: 'button' }) as HTMLButtonElement;
    const a = elem('span', { class: 'btn__arrow', 'aria-hidden': 'true', text: arrow });
    const t = elem('span', { text: label });
    if (cls === 'btn--prev') b.append(a, t); else b.append(t, a);
    b.addEventListener('click', go);
    return b;
  };
  const prev = navBtn('→', 'הקודם', 'btn--prev', () => navigate(`#/workbook/${page - 1}`));
  const next = navBtn('←', 'הבא', 'btn--next', () => navigate(`#/workbook/${page + 1}`));
  prev.disabled = page <= 1;
  next.disabled = page >= TOTAL_PAGES;
  prev.classList.toggle('btn--disabled', prev.disabled);
  next.classList.toggle('btn--disabled', next.disabled);

  return elem('div', { class: 'wsbar no-print', 'data-noprint': '' },
    elem('span', { class: 'wsbar__side' },
      ghost('‹ חזרה לאתר', () => navigate('#/')),
      elem('span', { class: 'wsbar__nav' }, prev, next),
    ),
    elem('span', { class: 'wsbar__title', text: `דף עבודה מספר ${page} מתוך ${TOTAL_PAGES}` }),
    elem('span', { class: 'wsbar__side wsbar__side--acts' },
      ghost('⬇ הורדת הדף', () => openActionChooser('download', new Set([page]))),
      gold('🖨 הדפסה', () => openActionChooser('print', new Set([page]))),
    ),
  );
}
