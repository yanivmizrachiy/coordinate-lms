import { elem } from '../lib/dom';
import { navigate } from '../router';
import { TOTAL_PAGES } from '../data/workbook';
import { DISTRICT_BADGE } from '../data/cover';
import { openActionChooser } from './printChoice';
import type { ViewContext } from './context';
import { goToContents } from './tocSheet';

/* ===========================================================================
   The menu — everything you can do, one press past the opening.

   The opening screen has one job; this one has all the others. Keeping them
   apart is what lets the film fill a phone screen without a row of buttons
   crowding it, and it is why „התחל" leads somewhere rather than just dismissing
   something.
   =========================================================================== */

/** Public address of this build — used for the WhatsApp share text. */
const shareUrl = (): string => location.href.split('#')[0]!;

export function menu({ outlet, setTitle }: ViewContext): void {
  setTitle('מערכת צירים — הרביע הראשון');
  const c = elem('div', { class: 'container menu' });

  const badge = elem('picture', { class: 'menu__badge' });
  badge.append(
    elem('source', { srcset: DISTRICT_BADGE.webp, type: 'image/webp' }),
    elem('img', { src: DISTRICT_BADGE.png, alt: DISTRICT_BADGE.alt, decoding: 'async' }),
  );

  c.append(
    elem('header', { class: 'menu__head' },
      badge,
      elem('div', {},
        elem('h1', { class: 'menu__title', text: 'מערכת צירים — הרביע הראשון' }),
        elem('p', { class: 'menu__sub', text: `חוברת עבודה · ${TOTAL_PAGES} עמודים` }),
      ),
    ),
  );

  /* ---- the four things you can do ---- */
  const actions = elem('div', { class: 'act-row' });

  const act = (cls: string, icon: string, label: string, note: string, onClick: () => void): HTMLElement => {
    const b = elem('button', { class: `act ${cls}`, type: 'button' },
      elem('span', { class: 'act__sheen', 'aria-hidden': 'true' }),
      elem('span', { class: 'act__icon', 'aria-hidden': 'true', text: icon }),
      elem('span', { class: 'act__label', text: label }),
      elem('span', { class: 'act__note', text: note }),
    );
    b.addEventListener('click', onClick);
    return b;
  };

  actions.append(
    act('act--view', '📖', 'תצוגה', 'החוברת הנפתחת', () => navigate('#/book')),
    act('act--download', '⬇️', 'הורדה', 'הכול או דפים · צבע או שחור-לבן', () => openActionChooser('download')),
    act('act--print', '🖨️', 'הדפסה', 'הכול או דפים · צבע או שחור-לבן', () => openActionChooser('print')),
  );

  const wa = elem('a', {
    class: 'act act--wa',
    href: `https://wa.me/?text=${encodeURIComponent('מערכת צירים — הרביע הראשון · חוברת עבודה\n' + shareUrl())}`,
    target: '_blank',
    rel: 'noopener',
    'aria-label': 'שיתוף בוואטסאפ',
  },
    elem('span', { class: 'act__sheen', 'aria-hidden': 'true' }),
    elem('span', { class: 'act__icon', 'aria-hidden': 'true', text: '💬' }),
    elem('span', { class: 'act__label', text: 'וואטסאפ' }),
    elem('span', { class: 'act__note', text: 'שיתוף הקישור' }),
  );
  actions.append(wa);
  c.append(actions);

  /* ---- paging: jump straight to any page ---- */
  const nav = elem('div', { class: 'jump' });
  const select = elem('select', { class: 'jump__select', 'aria-label': 'בחירת עמוד' }) as HTMLSelectElement;
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    select.append(elem('option', { value: String(i), text: `עמוד ${i}` }) as HTMLOptionElement);
  }
  const go = elem('button', { class: 'jump__go', type: 'button', text: 'מעבר' });
  go.addEventListener('click', () => navigate(`#/workbook/${select.value}`));
  select.addEventListener('change', () => navigate(`#/workbook/${select.value}`));

  nav.append(
    elem('button', { class: 'jump__first', type: 'button', text: '⏮ עמוד 1' }),
    select,
    go,
    elem('button', { class: 'jump__toc', type: 'button', text: '☰ תוכן העניינים' }),
  );
  (nav.querySelector('.jump__first') as HTMLElement).addEventListener('click', () => navigate('#/workbook/1'));
  (nav.querySelector('.jump__toc') as HTMLElement).addEventListener('click', goToContents);
  c.append(nav);

  outlet.append(c);
  requestAnimationFrame(() => c.classList.add('menu--in'));
}
