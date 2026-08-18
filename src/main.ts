import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/landing.css';
import './styles/actions.css';
import './styles/flipbook.css';
import './styles/workbook.css';
import './styles/grayscale.css';
import './styles/print-aids.css';
import './styles/solutions.css';
import './styles/lms.css';
import './styles/lms-phase3.css';
import './styles/lms-grid-inputs.css';

import { startRouter, navigate, type RouteMatch } from './router';
import { elem, clear } from './lib/dom';
import type { View, ViewContext } from './views/context';
import { home } from './views/home';
import { menu } from './views/menu';
import { pageViewer } from './views/pageViewer';
import { book } from './views/book';
import { flipbook } from './views/flipbook';
import { ensureFreshBuild } from './lib/freshBuild';
import { solutions } from './views/solutions';
import { printAids } from './views/printAids';
import { lmsLogin } from './views/lmsLogin';
import { lmsAdmin } from './views/lmsAdmin';
import { lmsProgress } from './views/lmsProgress';
import { lmsKeys } from './views/lmsKeys';

const app = document.getElementById('app');
if (!app) throw new Error('#app root missing');

/* ---- app bar ----------------------------------------------------------- */
const homeBtn = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: '⌂ בית', 'aria-label': 'מסך הבית' });
homeBtn.addEventListener('click', () => navigate('#/'));

/* Pointing התחל straight at the cover left #/menu with nothing linking to it,
   and with it הורדה, הדפסה, וואטסאפ and the page picker. The bar is on every
   screen except the opening, so this is where the way back to them belongs. */
const menuBtn = elem('button', { class: 'iconbtn', type: 'button', text: '☰ תפריט', 'aria-label': 'תפריט הפעולות' });
menuBtn.addEventListener('click', () => navigate('#/menu'));

const titleEl = elem('div', { class: 'appbar__title', text: 'מערכת צירים — הרביע הראשון' });

const appbar = elem('header', { class: 'appbar no-print' }, homeBtn, menuBtn, titleEl);
const outlet = elem('main', { class: 'app-main', id: 'main', tabindex: '-1' });
const skip = elem('a', { class: 'skip-link', href: '#main', text: 'דלגו לתוכן' });

app.append(skip, appbar, outlet);

/* ---- routing ----------------------------------------------------------- */
const setTitle = (t: string): void => {
  titleEl.textContent = t;
  document.title = `${t} | מערכת צירים`;
};

/* ONE site, ONE link — Yaniv (31.07.2026): the ORIGINAL address he already
   gave people carries the FULL site; there is no booklet-only variant. */
function resolve(match: RouteMatch): View {
  switch (match.name) {
    case 'home': return home;
    case 'menu': return menu;
    case 'page': return pageViewer(Number(match.params['n'] ?? '1'));
    case 'book': return flipbook;
    case 'print': return book;
    case 'solutions': return solutions;
    case 'aids': return printAids;
    case 'login': return lmsLogin;
    case 'admin': return lmsAdmin;
    case 'progress': return lmsProgress;
    case 'keys': return lmsKeys;
  }
}

let cleanup: (() => void) | undefined;

/* A view swap is instant — the whole booklet is already in memory — so the only
   thing to soften is the swap itself. The outgoing screen is not waited for:
   the new one is built at once and fades up over a single frame, which reads as
   quick rather than as an animation to sit through. */
const CROSSFADE = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150;

function render(match: RouteMatch): void {
  if (cleanup) { cleanup(); cleanup = undefined; }
  clear(outlet);
  homeBtn.style.visibility = match.name === 'home' ? 'hidden' : 'visible';
  /* The landing and the flipbook are whole screens with bars of their own —
     the app bar would sit on the film or on the book's stage. */
  appbar.classList.toggle('appbar--hidden', match.name === 'home' || match.name === 'book');
  menuBtn.style.visibility = match.name === 'menu' ? 'hidden' : 'visible';
  const ctx: ViewContext = { outlet, setTitle };
  const result = resolve(match)(ctx);
  cleanup = typeof result === 'function' ? result : undefined;

  if (CROSSFADE) {
    outlet.classList.remove('app-main--in');
    requestAnimationFrame(() => outlet.classList.add('app-main--in'));
  }
}

// The screen always shows colour — „החוברת מוצגת בצבעוני". Black and white
// exists only as a choice at PRINT time (printChoice), applied for the length
// of the print dialog and removed on afterprint.
startRouter(render);

// A device that opened the site earlier can be holding an old index.html;
// this notices that and reloads once so nobody reads a stale booklet.
void ensureFreshBuild();
