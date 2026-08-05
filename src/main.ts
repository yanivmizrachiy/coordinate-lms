import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/landing.css';
import './styles/actions.css';
import './styles/flipbook.css';
import './styles/workbook.css';
import './styles/grayscale.css';
import './styles/lms.css';
import './styles/lms-phase3.css';
import './styles/lms-grid-inputs.css';
import './styles/lms-live-feedback.css';

import { startRouter, navigate, type RouteMatch } from './router';
import { elem, clear } from './lib/dom';
import type { View, ViewContext } from './views/context';
import { home } from './views/home';
import { ensureFreshBuild } from './lib/freshBuild';

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

/* The opening route stays in the entry bundle. Workbook, print and LMS views
   are fetched only when a learner enters them, so opening the site does not
   download the complete 78-page workbook or the Firebase administration UI. */
async function loadView(match: RouteMatch): Promise<View> {
  switch (match.name) {
    case 'home':
      return home;
    case 'menu':
      return (await import('./views/menu')).menu;
    case 'page': {
      const { pageViewer } = await import('./views/pageViewer');
      return pageViewer(Number(match.params['n'] ?? '1'));
    }
    case 'book':
      return (await import('./views/flipbook')).flipbook;
    case 'print':
      return (await import('./views/book')).book;
    case 'login':
      return (await import('./views/lmsLogin')).lmsLogin;
    case 'admin':
      return (await import('./views/lmsAdmin')).lmsAdmin;
    case 'progress':
      return (await import('./views/lmsProgress')).lmsProgress;
    case 'keys':
      return (await import('./views/lmsKeys')).lmsKeys;
  }
}

let cleanup: (() => void) | undefined;
let latestRenderRequest = 0;

/* Route modules can finish loading in a different order from navigation. The
   request token prevents a slow old route from replacing the screen after the
   learner has already moved elsewhere. */
const CROSSFADE = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150;

async function render(match: RouteMatch): Promise<void> {
  const requestId = ++latestRenderRequest;
  if (cleanup) { cleanup(); cleanup = undefined; }
  clear(outlet);
  outlet.setAttribute('aria-busy', 'true');

  homeBtn.style.visibility = match.name === 'home' ? 'hidden' : 'visible';
  /* The landing and the flipbook are whole screens with bars of their own —
     the app bar would sit on the film or on the book's stage. */
  appbar.classList.toggle('appbar--hidden', match.name === 'home' || match.name === 'book');
  menuBtn.style.visibility = match.name === 'menu' ? 'hidden' : 'visible';

  try {
    const view = await loadView(match);
    if (requestId !== latestRenderRequest) return;

    clear(outlet);
    outlet.removeAttribute('aria-busy');
    const ctx: ViewContext = { outlet, setTitle };
    const result = view(ctx);
    cleanup = typeof result === 'function' ? result : undefined;

    if (CROSSFADE) {
      outlet.classList.remove('app-main--in');
      requestAnimationFrame(() => outlet.classList.add('app-main--in'));
    }
  } catch (error) {
    if (requestId !== latestRenderRequest) return;
    console.error('Failed to load route', error);
    clear(outlet);
    outlet.removeAttribute('aria-busy');
    outlet.append(elem('p', {
      class: 'empty-state',
      role: 'alert',
      text: 'העמוד לא נטען. רעננו את האתר ונסו שוב.',
    }));
  }
}

// The screen always shows colour — „החוברת מוצגת בצבעוני". Black and white
// exists only as a choice at PRINT time (printChoice), applied for the length
// of the print dialog and removed on afterprint.
startRouter((match) => { void render(match); });

// A device that opened the site earlier can be holding an old index.html;
// this notices that and reloads once so nobody reads a stale booklet.
void ensureFreshBuild();
