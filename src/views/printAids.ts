import { elem } from '../lib/dom';
import { navigate } from '../router';
import { PRINT_AIDS, AID_CREDIT_SOURCE, type PrintAid } from '../data/printAids';
import type { ViewContext } from './context';

/* המחשות להדפסה — a printable illustration presented as a true A4 aid sheet,
   in the misparim AidSheet design (gold-bordered card, centred title, credit).
   Reached from the menu; prints as a full A4 page. */

function renderAidSheet(aid: PrintAid): HTMLElement {
  const sheet = elem('section', { class: 'aid-sheet', 'aria-label': aid.title });

  sheet.append(
    elem('div', { class: 'aid-head' },
      elem('h1', { class: 'aid-title', text: aid.title }),
      elem('div', { class: 'aid-headline', 'aria-hidden': 'true' }),
    ),
  );

  const body = elem('div', { class: 'aid-body' });
  const img = elem('img', { class: 'aid-image', src: aid.image, alt: aid.alt, decoding: 'async' }) as HTMLImageElement;
  img.addEventListener('error', () => {
    img.remove();
    sheet.classList.add('aid-sheet--placeholder');
    body.append(
      elem('div', { text: aid.title }),
      elem('div', { class: 'aid-placeholder__file', text: aid.image }),
    );
  });
  body.append(img);
  sheet.append(body);

  sheet.append(
    elem('footer', { class: 'aid-foot' },
      elem('p', { class: 'aid-credit', text: AID_CREDIT_SOURCE }),
      elem('div', { class: 'aid-footline', 'aria-hidden': 'true' }),
    ),
  );
  return sheet;
}

export function printAids({ outlet, setTitle }: ViewContext): void {
  const aid = PRINT_AIDS[0]!;
  setTitle(aid.title);

  const page = elem('div', { class: 'aid-page' });

  const back = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: '☰ תפריט' });
  back.addEventListener('click', () => navigate('#/menu'));
  const print = elem('button', { class: 'iconbtn', type: 'button', text: '🖨️ הורדה / הדפסה' });
  print.addEventListener('click', () => window.print());

  page.append(
    elem('div', { class: 'aid-toolbar no-print' }, back, print),
    renderAidSheet(aid),
  );

  outlet.append(page);
  window.scrollTo({ top: 0 });
}
