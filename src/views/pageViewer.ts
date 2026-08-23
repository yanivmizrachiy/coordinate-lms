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
import { hydrateGridAnswerInputs } from '../lms/gridInputs';
import { hydrateChoiceAnswerInputs } from '../lms/choiceInputs';
import { hydrateExplicitAuthoringAnswers } from '../lms/implicitAnswers';
import { installHintCoach } from '../lms/hintCoach';
import { installAttemptFeedback } from '../lms/attemptFeedback';
import { focusPracticePanel } from '../lms/practiceFocus';
import { refineQuestionSubmitControls } from '../lms/questionSubmitUi';

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
    if (data) {
      sheetWrap.append(fromHTML(data.html));
      hydrateGrids(sheetWrap);
      hydrateGridAnswerInputs(sheetWrap);
      choiceCleanup = hydrateChoiceAnswerInputs(sheetWrap);
      hydrateExplicitAuthoringAnswers(sheetWrap);
      fitSheets(sheetWrap);
      if (data.gameId) {
        /* The canonical sheet is pure print; the game plays ON SCREEN. A page
           that carries its own [data-game-host] uses it; a printed puzzle page
           gets a no-print host mounted after the sheet, so paper and screen
           come from the same single content source. */
        let host = sheetWrap.querySelector<HTMLElement>('[data-game-host]');
        if (!host) {
          host = elem('div', {
            class: 'game-host game-host--screen no-print',
            'data-game-host': data.gameId,
          });
          const screenGame = elem(
            'section',
            {
              class: 'game-screen-layer no-print',
              'aria-label': 'המשחק המקוון של העמוד',
            },
            elem('h2', { class: 'game-screen-layer__title', text: '🎮 המשחק על המסך — אותה משימה, אינטראקטיבית' }),
            host,
          );
          sheetWrap.append(screenGame);
        }
        const g = gameById(data.gameId);
        if (host && g) gameCleanup = g.mount(host);
      }
    } else {
      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));
    }

    const lms = data
      ? attachLmsToPage(sheetWrap, page)
      : undefined;
    if (lms) focusPracticePanel(lms.panel);
    refineQuestionSubmitControls(sheetWrap);
    const hintCleanup = data && lms
      ? installHintCoach(sheetWrap)
      : undefined;
    const attemptFeedbackCleanup = data && lms
      ? installAttemptFeedback(sheetWrap)
      : undefined;

    /* The bottom row: page-turning MUST be comfortable from here too —
       „אפשרי לדפדף עמוד הבא ועמוד קודם באופן נוח גם מתחתית העמוד" — on a
       phone the reader is at the bottom when the page ends, and the way to
       the next page has to be under the thumb, not back at the top. */
    const nav = elem('div', { class: 'pagenav no-print' });

    /* מספר עמוד בכתיבה חופשית — „תוסיף אפשרות לכתוב חופשי מספר עמוד וזה
       יעבור מייד" (31.07.2026). Enter או יציאה מהשדה קופצים; הרשימה הנפתחת
       של כל האפשרויות נמחקה — היא סתרה את זה. */
    const pageInput = elem('input', {
      class: 'pagenav__input', type: 'number', inputmode: 'numeric',
      min: '1', max: String(TOTAL_PAGES), value: String(page), 'aria-label': 'מספר עמוד',
    }) as HTMLInputElement;
    const jump = (): void => {
      const n = Math.min(TOTAL_PAGES, Math.max(1, Math.trunc(Number(pageInput.value)) || page));
      if (n !== page) navigate(`#/workbook/${n}`);
      else pageInput.value = String(page);
    };
    pageInput.addEventListener('change', jump);
    pageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') jump(); });

    /* חצים גדולים, בכיוון הדפדוף העברי: הקודם חוזר ימינה, הבא ממשיך שמאלה. */
    const prevB = elem('button', { class: 'btn btn--sm btn--nav btn--prev', type: 'button' },
      elem('span', { class: 'btn__arrow', 'aria-hidden': 'true', text: '→' }),
      elem('span', { text: 'הקודם' }),
    ) as HTMLButtonElement;
    const nextB = elem('button', { class: 'btn btn--sm btn--nav btn--next', type: 'button' },
      elem('span', { text: 'הבא' }),
      elem('span', { class: 'btn__arrow', 'aria-hidden': 'true', text: '←' }),
    ) as HTMLButtonElement;
    prevB.disabled = page <= 1;
    nextB.disabled = page >= TOTAL_PAGES;
    prevB.classList.toggle('btn--disabled', prevB.disabled);
    nextB.classList.toggle('btn--disabled', nextB.disabled);
    prevB.addEventListener('click', () => navigate(`#/workbook/${page - 1}`));
    nextB.addEventListener('click', () => navigate(`#/workbook/${page + 1}`));

    nav.append(
      prevB,
      elem('span', { class: 'pagenav__indicator', text: `${page} / ${TOTAL_PAGES}` }),
      elem('label', { class: 'pagenav__jump' }, elem('span', { text: 'עמוד' }), pageInput),
      nextB,
      linkBtn('☰ תוכן העניינים', goToContents),
      zoom,
      iconOnly('⛶', 'מסך מלא', () => toggleFullscreen(sheetWrap)),
    );

    viewer.append(readerBar(page), sheetWrap);
    if (lms) viewer.append(lms.panel);
    viewer.append(nav);
    c.append(viewer);
    outlet.append(c);
    window.scrollTo({ top: 0 });

    /* A4 is 1123px tall and a laptop viewport is not. Left alone the viewer
       shows two thirds of a page and asks the reader to scroll for the rest.
       „התאמה למסך” puts the whole sheet on screen; anyone who would rather have
       the text bigger and scroll can say so, and we remember which they chose.
       Only this view scales — the booklet stays true A4 for printing. */
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
    // …and again once fitSheet has finished growing the drawings.
    const settle = window.setTimeout(applyZoom, 420);
    window.addEventListener('resize', applyZoom);
    /* A poster page is one big image; measured before it loads, the wrap got
       the height of an empty sheet and CLIPPED the footer's second line —
       the broken footer Yaniv photographed on page 16. Re-fit as each image
       arrives. */
    for (const img of sheetWrap.querySelectorAll('img')) {
      if (!img.complete) img.addEventListener('load', applyZoom, { once: true });
    }

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', applyZoom);
      attemptFeedbackCleanup?.();
      hintCleanup?.();
      choiceCleanup?.();
      gameCleanup?.();
      lms?.cleanup();
    };
  };
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
