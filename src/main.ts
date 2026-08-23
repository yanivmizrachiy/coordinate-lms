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
import './styles/controls-refined.css';
import './styles/question-submit.css';

import { startRouter, navigate, type RouteMatch } from './router';
import { elem, clear } from './lib/dom';
import type { View, ViewContext } from './views/context';
import { ensureFreshBuild } from './lib/freshBuild';
import { refineQuestionSubmitControls } from './lms/questionSubmitUi';

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

/* Each screen is fetched when it is first opened, not when the site loads.
   The opening film is the page everyone lands on, and it needs neither the
   78 sheets nor the Firebase SDK — statically importing every view made the
   first download carry both (measured: 1.18 MB, 281 kB gzip). The browser
   caches each chunk after its first visit, so this costs one small request
   the first time a screen is opened and nothing after that. */
function resolve(match: RouteMatch): Promise<View> {
  switch (match.name) {
    case 'home': return import('./views/home').then((m) => m.home);
    case 'menu': return import('./views/menu').then((m) => m.menu);
    case 'page': return import('./views/pageViewer')
      .then((m) => m.pageViewer(Number(match.params['n'] ?? '1')));
    case 'book': return import('./views/flipbook').then((m) => m.flipbook);
    case 'print': return import('./views/book').then((m) => m.book);
    case 'solutions': return import('./views/solutions').then((m) => m.solutions);
    case 'aids': return import('./views/printAids').then((m) => m.printAids);
    case 'login': return import('./views/lmsLogin').then((m) => m.lmsLogin);
    case 'admin': return import('./views/lmsAdmin').then((m) => m.lmsAdmin);
    case 'progress': return import('./views/lmsProgress').then((m) => m.lmsProgress);
    case 'keys': return import('./views/lmsKeys').then((m) => m.lmsKeys);
  }
}

let cleanup: (() => void) | undefined;
/* Which navigation is the current one. A chunk that arrives after the reader
   has already moved on belongs to a screen nobody asked for any more, and
   drawing it would overwrite the one they DID ask for. */
let navigationToken = 0;

/* A view swap is instant — the whole booklet is already in memory — so the only
   thing to soften is the swap itself. The outgoing screen is not waited for:
   the new one is built at once and fades up over a single frame, which reads as
   quick rather than as an animation to sit through. */
const CROSSFADE = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150;

function render(match: RouteMatch): void {
  const token = ++navigationToken;
  if (cleanup) { cleanup(); cleanup = undefined; }
  clear(outlet);
  homeBtn.style.visibility = match.name === 'home' ? 'hidden' : 'visible';
  /* The landing and the flipbook are whole screens with bars of their own —
     the app bar would sit on the film or on the book's stage. */
  appbar.classList.toggle('appbar--hidden', match.name === 'home' || match.name === 'book');
  menuBtn.style.visibility = match.name === 'menu' ? 'hidden' : 'visible';

  /* A screen that arrives instantly (its chunk is cached, or the connection is
     quick) should show nothing at all — a spinner that flashes for one frame
     reads as a stutter. So the notice is scheduled, and a screen that beats it
     cancels it. Only a wait long enough to feel like a wait is ever explained
     to the reader, which on school wi-fi is the wait that matters. */
  const notice = window.setTimeout(() => {
    if (token !== navigationToken) return;
    outlet.append(
      elem('div', {
        class: 'route-loading',
        role: 'status',
        'aria-live': 'polite',
        text: 'טוען…',
      }),
    );
  }, 250);

  void resolve(match).then((view) => {
    window.clearTimeout(notice);
    if (token !== navigationToken) return;
    clear(outlet);
    const ctx: ViewContext = { outlet, setTitle };
    const result = view(ctx);
    refineQuestionSubmitControls(outlet);
    cleanup = typeof result === 'function' ? result : undefined;

    if (CROSSFADE) {
      outlet.classList.remove('app-main--in');
      requestAnimationFrame(() => outlet.classList.add('app-main--in'));
    }
  }).catch(() => {
    /* The screen's code never arrived — a dropped connection, or a device
       holding a build whose chunks are gone. Say so and offer the way back
       instead of leaving the reader looking at nothing. */
    window.clearTimeout(notice);
    if (token !== navigationToken) return;
    clear(outlet);
    const again = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'נסו שוב',
    });
    again.addEventListener('click', () => { location.reload(); });
    outlet.append(
      elem('div', { class: 'route-loading', role: 'alert' },
        elem('p', { text: 'טעינת המסך לא הושלמה. בדקו את החיבור לאינטרנט.' }),
        again,
      ),
    );
  });
}

// The screen always shows colour — „החוברת מוצגת בצבעוני". Black and white
// exists only as a choice at PRINT time (printChoice), applied for the length
// of the print dialog and removed on afterprint.
startRouter(render);

// A device that opened the site earlier can be holding an old index.html;
// this notices that and reloads once so nobody reads a stale booklet.
void ensureFreshBuild();
