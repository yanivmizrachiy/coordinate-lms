import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/landing.css';
import './styles/welcome.css';
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
import './styles/page-score.css';

import { startRouter, navigate, type RouteMatch } from './router';
import { elem, clear } from './lib/dom';
import type { View, ViewContext } from './views/context';
import { ensureFreshBuild } from './lib/freshBuild';

const app = document.getElementById('app');
if (!app) throw new Error('#app root missing');

let pageScoreFeedbackInstalled = false;

const homeBtn = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: '⌂ בית', 'aria-label': 'מסך הבית' });
homeBtn.addEventListener('click', () => navigate('#/'));

const menuBtn = elem('button', { class: 'iconbtn', type: 'button', text: '☰ תפריט', 'aria-label': 'תפריט הפעולות' });
menuBtn.addEventListener('click', () => navigate('#/menu'));

const titleEl = elem('div', { class: 'appbar__title', text: 'מערכת צירים — הרביע הראשון' });
const appbar = elem('header', { class: 'appbar no-print' }, homeBtn, menuBtn, titleEl);
const outlet = elem('main', { class: 'app-main', id: 'main', tabindex: '-1' });
const skip = elem('a', { class: 'skip-link', href: '#main', text: 'דלגו לתוכן' });
app.append(skip, appbar, outlet);

const setTitle = (t: string): void => {
  titleEl.textContent = t;
  document.title = `${t} | מערכת צירים`;
};

function resolve(match: RouteMatch): Promise<View> {
  switch (match.name) {
    case 'welcome': return import('./views/welcome').then((m) => m.welcome);
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
let navigationToken = 0;
const CROSSFADE = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150;

function render(match: RouteMatch): void {
  const token = ++navigationToken;
  if (cleanup) { cleanup(); cleanup = undefined; }
  clear(outlet);

  const practice = match.name === 'page';
  const fullScreen = match.name === 'welcome' || match.name === 'home' || match.name === 'book';
  homeBtn.style.visibility = fullScreen ? 'hidden' : 'visible';
  homeBtn.textContent = practice ? '⌂' : '⌂ בית';
  appbar.classList.toggle('appbar--hidden', fullScreen);
  appbar.classList.toggle('appbar--practice', practice);

  /* Keep score-feedback wording out of the lightweight first-entry download.
     It is loaded only when computerized practice is actually opened. */
  if (practice && !pageScoreFeedbackInstalled) {
    pageScoreFeedbackInstalled = true;
    void import('./lms/pageScoreFeedback').then(({ installPageScoreFeedback }) => {
      installPageScoreFeedback(app);
    });
  }

  /* Numbered practice is intentionally focused. Print/booklet/account utilities
     do not appear inside it; the page owns its small practice-only controls. */
  menuBtn.hidden = match.name === 'menu' || practice;

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
    cleanup = typeof result === 'function' ? result : undefined;

    if (CROSSFADE) {
      outlet.classList.remove('app-main--in');
      requestAnimationFrame(() => outlet.classList.add('app-main--in'));
    }
  }).catch(() => {
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

startRouter(render);
void ensureFreshBuild();