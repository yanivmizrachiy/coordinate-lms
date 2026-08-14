import { elem, fromHTML } from '../lib/dom';
import { navigate } from '../router';
import { hydrateGrids } from '../lib/coordinateGrid';
import { fitSheets } from '../lib/fitSheet';
import { readerBar } from './wsbar';
import { pageByNumber, TOTAL_PAGES, topicOfPage } from '../data/workbook';
import { lastPage, sheetZoom } from '../lib/storage';
import { gameById } from '../games';
import type { ViewContext } from './context';
import { goToContents } from './tocSheet';
import {
  attachLmsToPage,
  canAccessPage,
  renderAccessGate,
} from '../lms/engine';
import { currentSession } from '../lms/auth';
import { hydrateGridAnswerInputs } from '../lms/gridInputs';
import { hydrateChoiceAnswerInputs } from '../lms/choiceInputs';
import { hydrateExplicitAuthoringAnswers } from '../lms/implicitAnswers';
import { hydrateInlineAnswerChecks } from '../lms/inlineAnswerChecks';

export function pageViewer(n: number): (ctx: ViewContext) => (() => void) | void {
  return ({ outlet, setTitle }) => {
    const page = Math.min(Math.max(1, Math.trunc(n) || 1), TOTAL_PAGES);
    const data = pageByNumber(page);
    const topic = topicOfPage(page);
    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);
    if (!canAccessPage(page)) {
      renderAccessGate(outlet, page);
      return;
    }
    lastPage.set(page);

    const c = elem('div', { class: 'container' });
    const viewer = elem('div', { class: 'pageviewer' });

    const sheetWrap = elem('div', { class: 'pageviewer__sheetwrap' });

    const zoomOut = elem('button', { class: 'zoombtn', type: 'button', text: '−', 'aria-label': 'הקטנת העמוד' });
    const zoomIn = elem('button', { class: 'zoombtn', type: 'button', text: '+', 'aria-label': 'הגדלת העמוד' });
    const zoomLabel = elem('button', { class: 'zoombtn zoombtn--label', type: 'button', text: 'התאמה למסך', title: 'חזרה להתאמה למסך' });
    const zoom = elem('div', { class: 'zoomer', role: 'group', 'aria-label': 'גודל התצוגה' }, zoomOut, zoomLabel, zoomIn);
    let gameCleanup: (() => void) | undefined;
    let choiceCleanup: (() => void) | undefined;
    let predicateCleanup: (() => void) | undefined;
    if (data) {
      sheetWrap.append(fromHTML(data.html));
      hydrateGrids(sheetWrap);
      hydrateGridAnswerInputs(sheetWrap);
      choiceCleanup = hydrateChoiceAnswerInputs(sheetWrap);
      predicateCleanup = hydrateExplicitAuthoringAnswers(sheetWrap);
      fitSheets(sheetWrap);
      if (data.gameId) {
        const host = sheetWrap.querySelector<HTMLElement>('[data-game-host]');
        const g = gameById(data.gameId);
        if (host && g) gameCleanup = g.mount(host);
      }
    } else {
      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));
    }

    const lms = data
      ? attachLmsToPage(sheetWrap, page)
      : undefined;
    const inlineCheckCleanup = data
      ? hydrateInlineAnswerChecks(sheetWrap)
      : undefined;

    const nav = elem('div', { class: 'pagenav no-print' });
    const select = elem('select', { 'aria-label': 'בחירת עמוד' }) as HTMLSelectElement;
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const opt = elem('option', { value: String(i), text: `עמוד ${i}` }) as HTMLOptionElement;
      if (i === page) opt.selected = true;
      select.append(opt);
    }
    select.addEventListener('change', () => navigate(`#/workbook/${select.value}`));

    const prevB = elem('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '› הקודם' }) as HTMLButtonElement;
    const nextB = elem('button', { class: 'btn btn--gold btn--sm', type: 'button', text: 'הבא ‹' }) as HTMLButtonElement;
    prevB.disabled = page <= 1;
    nextB.disabled = page >= TOTAL_PAGES;
    prevB.classList.toggle('btn--disabled', prevB.disabled);
    nextB.classList.toggle('btn--disabled', nextB.disabled);
    prevB.addEventListener('click', () => navigate(`#/workbook/${page - 1}`));
    nextB.addEventListener('click', () => navigate(`#/workbook/${page + 1}`));

    nav.append(
      prevB,
      elem('span', { class: 'pagenav__indicator', text: `${page} / ${TOTAL_PAGES}` }),
      select,
      nextB,
      linkBtn('☰ תוכן העניינים', goToContents),
      zoom,
      iconOnly('⛶', 'מסך מלא', () => toggleFullscreen(sheetWrap)),
    );

    viewer.append(readerBar(page));
    if (page === 1) viewer.append(registrationNotice());
    viewer.append(sheetWrap);
    if (lms) viewer.append(lms.panel);
    viewer.append(nav);
    c.append(viewer);
    outlet.append(c);
    window.scrollTo({ top: 0 });

    const roomForSheet = (): number => {
      const docTop = sheetWrap.getBoundingClientRect().top + window.scrollY;
      return window.innerHeight - docTop - nav.offsetHeight - 14;
    };
    const applyZoom = (): void => {
      const sheetEl = sheetWrap.querySelector<HTMLElement>('.sheet');
      if (!sheetEl) return;
      sheetWrap.style.height = '';
      const h = sheetEl.offsetHeight;
      const w = sheetEl.offsetWidth;
      if (!h || !w) return;
      const z = sheetZoom.get();
      const scale =
        z === 'fit'
          ? Math.max(0.4, Math.min(1, roomForSheet() / h, sheetWrap.clientWidth / w))
          : Math.min(z, sheetWrap.clientWidth / w);
      sheetWrap.style.setProperty('--sheet-scale', scale.toFixed(3));
      sheetWrap.style.height = `${Math.ceil(h * scale)}px`;
      zoomLabel.textContent = z === 'fit' ? 'התאמה למסך' : `${Math.round(scale * 100)}%`;
    };
    const step = (by: number): void => {
      const now = Number(getComputedStyle(sheetWrap).getPropertyValue('--sheet-scale')) || 1;
      sheetZoom.set(Math.min(1.6, Math.max(0.4, Math.round((now + by) * 20) / 20)));
      applyZoom();
    };
    zoomOut.addEventListener('click', () => step(-0.1));
    zoomIn.addEventListener('click', () => step(0.1));
    zoomLabel.addEventListener('click', () => { sheetZoom.set('fit'); applyZoom(); });

    applyZoom();
    const settle = window.setTimeout(applyZoom, 420);
    window.addEventListener('resize', applyZoom);
    for (const img of sheetWrap.querySelectorAll('img')) {
      if (!img.complete) img.addEventListener('load', applyZoom, { once: true });
    }

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', applyZoom);
      inlineCheckCleanup?.();
      predicateCleanup?.();
      choiceCleanup?.();
      gameCleanup?.();
      lms?.cleanup();
    };
  };
}

function registrationNotice(): HTMLElement {
  const session = currentSession();
  const box = elem('section', {
    class: 'lms-registration-note no-print' + (session ? ' lms-registration-note--signed' : ''),
    role: 'note',
    'aria-label': session ? 'הלמידה שלך נשמרת' : 'שמירה ודוחות באמצעות הרשמה',
  });

  box.append(
    elem('div', {
      class: 'lms-registration-note__text',
    },
      elem('strong', {
        text: session
          ? 'החשבון שלך מחובר — הלמידה מתועדת'
          : 'אפשר לתרגל את כל האתר בלי להירשם',
      }),
      elem('span', {
        text: session
          ? ' התוצאות, הניסיונות וההתקדמות שתבצע בזמן שאתה מחובר נשמרים בחשבון שלך וניתנים להצגה בדוחות.'
          : ' רוצה לשמור את התוצאות, לתעד את ההתקדמות ולקבל דוחות על הלמידה שלך? הירשם או התחבר. רק פעילות של משתמש רשום נשמרת ומתועדת.',
      }),
    ),
  );

  const action = elem('button', {
    class: 'btn btn--gold btn--sm',
    type: 'button',
    text: session ? 'הדוחות שלי' : 'הרשמה / התחברות',
  });
  action.addEventListener('click', () => {
    navigate(session ? '#/progress' : '#/login');
  });
  box.append(action);
  return box;
}

function iconOnly(glyph: string, label: string, onClick: () => void): HTMLElement {
  const b = elem('button', { class: 'iconbtn', type: 'button', text: glyph, 'aria-label': label, title: label });
  b.addEventListener('click', onClick);
  return b;
}
function linkBtn(text: string, onClick: () => void): HTMLElement {
  const b = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text });
  b.addEventListener('click', onClick);
  return b;
}
function toggleFullscreen(elm: HTMLElement): void {
  if (!document.fullscreenElement) elm.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
}
