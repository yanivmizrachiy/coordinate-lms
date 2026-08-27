import '../styles/question-submit.css';
import '../styles/practice-shell.css';
import { elem, fromHTML } from '../lib/dom';
import { navigate } from '../router';
import { hydrateGrids } from '../lib/coordinateGrid';
import { fitSheets } from '../lib/fitSheet';
import { pageByNumber, TOTAL_PAGES, topicOfPage } from '../data/workbook';
import { lastPage, sheetZoom } from '../lib/storage';
import { gameById } from '../games';
import type { ViewContext } from './context';
import { goToContents } from './tocSheet';
import { attachLmsToPage } from '../lms/engine';
import { hydrateGridAnswerInputs } from '../lms/gridInputs';
import { hydrateChoiceAnswerInputs } from '../lms/choiceInputs';
import { hydrateExplicitAuthoringAnswers } from '../lms/implicitAnswers';
import { installHintCoach } from '../lms/hintCoach';
import { installAttemptFeedback } from '../lms/attemptFeedback';

export function pageViewer(n: number): (ctx: ViewContext) => (() => void) | void {
  return ({ outlet, setTitle }) => {
    const page = Math.min(Math.max(1, Math.trunc(n) || 1), TOTAL_PAGES);
    const data = pageByNumber(page);
    const topic = topicOfPage(page);
    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);
    lastPage.set(page);

    /* This is the STUDENT PRACTICE shell. The canonical worksheet itself is
       shared with print; only the surrounding controls differ. Print/download
       actions therefore do not belong here. */
    const c = elem('div', { class: 'container practice-container' });
    const viewer = elem('div', { class: 'pageviewer pageviewer--practice' });
    const sheetWrap = elem('div', { class: 'pageviewer__sheetwrap' });

    const zoomOut = elem('button', { class: 'zoombtn', type: 'button', text: '−', 'aria-label': 'הקטנת העמוד' });
    const zoomIn = elem('button', { class: 'zoombtn', type: 'button', text: '+', 'aria-label': 'הגדלת העמוד' });
    const zoomLabel = elem('button', { class: 'zoombtn zoombtn--label', type: 'button', text: 'התאמה למסך', title: 'חזרה להתאמה למסך' });
    const zoom = elem('div', { class: 'zoomer', role: 'group', 'aria-label': 'גודל התצוגה' }, zoomOut, zoomLabel, zoomIn);
    let gameCleanup: (() => void) | undefined;
    let choiceCleanup: (() => void) | undefined;

    if (data) {
      /* One source of truth: this exact canonical HTML also feeds print. The
         LMS hydrates/overlays it; it never owns a second copy of the task. */
      sheetWrap.append(fromHTML(data.html));
      hydrateGrids(sheetWrap);
      hydrateGridAnswerInputs(sheetWrap);
      choiceCleanup = hydrateChoiceAnswerInputs(sheetWrap);
      hydrateExplicitAuthoringAnswers(sheetWrap);
      fitSheets(sheetWrap);
      if (data.gameId) {
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
    const hintCleanup = data && lms
      ? installHintCoach(sheetWrap)
      : undefined;
    const attemptFeedbackCleanup = data && lms
      ? installAttemptFeedback(sheetWrap)
      : undefined;

    /* One calm app-like navigation row. Page turning is primary; contents,
       zoom and fullscreen are secondary tools under one small overflow control. */
    const nav = elem('div', { class: 'pagenav pagenav--practice no-print', 'aria-label': 'ניווט בתרגול' });

    const pageInput = elem('input', {
      class: 'pagenav__input', type: 'number', inputmode: 'numeric',
      min: '1', max: String(TOTAL_PAGES), value: String(page), 'aria-label': 'מספר עמוד',
    }) as HTMLInputElement;
    const jump = (): void => {
      const targetPage = Math.min(
        TOTAL_PAGES,
        Math.max(1, Math.trunc(Number(pageInput.value)) || page),
      );
      if (targetPage !== page) navigate(`#/workbook/${targetPage}`);
      else pageInput.value = String(page);
    };
    pageInput.addEventListener('change', jump);
    pageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') jump();
    });

    const prevB = elem(
      'button',
      { class: 'btn btn--sm btn--nav btn--prev', type: 'button', 'aria-label': 'לעמוד הקודם' },
      elem('span', { class: 'btn__arrow', 'aria-hidden': 'true', text: '→' }),
      elem('span', { class: 'btn__label', text: 'הקודם' }),
    ) as HTMLButtonElement;
    const nextB = elem(
      'button',
      { class: 'btn btn--sm btn--nav btn--next', type: 'button', 'aria-label': 'לעמוד הבא' },
      elem('span', { class: 'btn__label', text: 'הבא' }),
      elem('span', { class: 'btn__arrow', 'aria-hidden': 'true', text: '←' }),
    ) as HTMLButtonElement;
    prevB.disabled = page <= 1;
    nextB.disabled = page >= TOTAL_PAGES;
    prevB.classList.toggle('btn--disabled', prevB.disabled);
    nextB.classList.toggle('btn--disabled', nextB.disabled);
    prevB.addEventListener('click', () => navigate(`#/workbook/${page - 1}`));
    nextB.addEventListener('click', () => navigate(`#/workbook/${page + 1}`));

    const pagePosition = elem(
      'label',
      { class: 'pagenav__jump pagenav__jump--compact' },
      pageInput,
      elem('span', { class: 'pagenav__of', text: `/ ${TOTAL_PAGES}` }),
    );

    const tools = elem('details', { class: 'practice-tools' });
    const toolsSummary = elem(
      'summary',
      {
        class: 'practice-tools__trigger',
        'aria-label': 'כלים נוספים',
        title: 'כלים נוספים',
      },
      elem('span', { 'aria-hidden': 'true', text: '⋯' }),
    );
    const toolsPanel = elem(
      'div',
      { class: 'practice-tools__panel' },
      linkBtn('☰ תוכן', goToContents),
      zoom,
      iconOnly('⛶', 'מסך מלא', () => toggleFullscreen(sheetWrap)),
    );
    tools.append(toolsSummary, toolsPanel);

    nav.append(prevB, pagePosition, nextB, tools);

    /* The submitted page grade greets the learner at the TOP of the page,
       above the worksheet; the action panel stays below the sheet. */
    if (lms) viewer.append(lms.scoreBanner);
    viewer.append(sheetWrap);
    if (lms) viewer.append(lms.panel);
    viewer.append(nav);
    c.append(viewer);
    outlet.append(c);
    window.scrollTo({ top: 0 });

    const applyZoom = (): void => {
      const sheetEl = sheetWrap.querySelector<HTMLElement>('.sheet');
      if (!sheetEl) return;
      sheetWrap.style.height = '';
      const h = sheetEl.offsetHeight;
      const w = sheetEl.offsetWidth;
      if (!h || !w) return;
      const z = sheetZoom.get();
      /* Fit means fit-to-WIDTH. The practice sheet grows below one A4 once the
         per-question controls are laid in, so fitting the whole height would
         shrink the type below readability on a phone; vertical scrolling is the
         natural reading motion for a worksheet. */
      const scale =
        z === 'fit'
          ? Math.max(0.4, Math.min(1, sheetWrap.clientWidth / w))
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
    zoomLabel.addEventListener('click', () => {
      sheetZoom.set('fit');
      applyZoom();
    });

    applyZoom();
    const settle = window.setTimeout(applyZoom, 420);
    window.addEventListener('resize', applyZoom);
    for (const img of sheetWrap.querySelectorAll('img')) {
      if (!img.complete) img.addEventListener('load', applyZoom, { once: true });
    }

    /* Feedback, hints and submission verdicts are injected after first render
       and can make the canonical sheet taller. Keep the scaled wrapper's
       reserved footprint synchronized with every real sheet-height change so
       the footer and final question can never be clipped behind the LMS panel. */
    const observedSheet = sheetWrap.querySelector<HTMLElement>('.sheet');
    let sheetResizeObserver: ResizeObserver | undefined;
    if (observedSheet && typeof ResizeObserver !== 'undefined') {
      sheetResizeObserver = new ResizeObserver(() => applyZoom());
      sheetResizeObserver.observe(observedSheet);
    }

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', applyZoom);
      sheetResizeObserver?.disconnect();
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
  const b = elem('button', { class: 'iconbtn', type: 'button', text });
  b.addEventListener('click', onClick);
  return b;
}

function toggleFullscreen(elm: HTMLElement): void {
  if (!document.fullscreenElement) elm.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
}
