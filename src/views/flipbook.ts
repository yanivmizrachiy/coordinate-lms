import { elem, fromHTML } from '../lib/dom';
import { hydrateGrids } from '../lib/coordinateGrid';
import { fitSheets } from '../lib/fitSheet';
import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';
import { gameById } from '../games';
import { renderCoverSheet } from './coverSheet';
import { renderTocSheet, CONTENTS } from './tocSheet';
import { openActionChooser } from './printChoice';
import {
  backCoverPos, bookShift, clampPos, lastOpenSpread, pageAtPos, pagesAtSpread,
  posOfSpread, spreadOfPos, visiblePagesAtSpread, type PageRef,
} from '../lib/spreads';
import type { ViewContext } from './context';

/* ===========================================================================
   החוברת המדפדפת — הועתקה מפרויקט הזוויות (FlipbookViewer), אחד לאחד במראה
   ובהתנהגות: RTL אמיתי (הדף מתהפך סביב השדרה ימינה), כפולה על מסך רחב ודף
   יחיד על צר, גרירת דף, החלקה, מקלדת, זום, מסך מלא, תוכן עניינים צף ושמירת
   הדף הנוכחי. אצלם העמוד הוא תמונה; אצלנו הוא ה-DOM החי של הדף — אותם דפים
   בדיוק שמודפסים — ולכן השעשועונים משחקים גם בתוך החוברת הפתוחה.
   =========================================================================== */

const SHEET_W = 794; // 210 מ"מ בפיקסלים של CSS
const SHEET_H = 1123; // 297 מ"מ
const STORAGE_KEY = 'quadrant:lxbook:pos';
const FLIP_MS = 900;
const COVER_MS = 1000;

/* מודל הדפים: דף 1 = השער, דף 2 = תוכן העניינים, דף n+2 = עמוד n בחוברת. */
const MODEL_TOTAL = TOTAL_PAGES + 2;
const innerOf = (pos: number): number => Math.min(TOTAL_PAGES, Math.max(1, pos - 2));

type Flip = { dir: 'fwd' | 'back'; A: number; B: number };

const easeInOutQuart = (x: number): number => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

const svgBtn = (cls: string, label: string, path: string, extra?: string): HTMLButtonElement => {
  const b = elem('button', { class: cls, type: 'button', 'aria-label': label, title: label }) as HTMLButtonElement;
  b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}${extra ?? ''}</svg>`;
  return b;
};

export function flipbook({ outlet, setTitle }: ViewContext): (() => void) | void {
  setTitle('חוברת העבודה');

  /* ---- כל הדפים נבנים פעם אחת, במחסן מחוץ למסך ------------------------- */
  const store = elem('div', { class: 'lx-store', 'aria-hidden': 'true' });
  const sheets: HTMLElement[] = [renderCoverSheet(), renderTocSheet()];
  for (const page of WORKBOOK) {
    const sheet = fromHTML(page.html).firstElementChild as HTMLElement;
    sheets.push(sheet);
  }
  store.append(...sheets);

  const cleanups: Array<() => void> = [];

  /* ---- שלד הבמה --------------------------------------------------------- */
  const root = elem('div', { class: 'lxbook', 'data-open': 'false', 'data-view': 'double', dir: 'rtl' });
  const stage = elem('div', {
    class: 'lx-stage', role: 'region', tabindex: '0',
    'aria-label': 'החוברת הדיגיטלית — מערכת צירים ברביע הראשון',
    'aria-roledescription': 'חוברת דפדוף',
  });
  root.append(stage);

  stage.append(elem('div', { class: 'lx-stage__glow', 'aria-hidden': 'true' }));
  const lines = elem('div', {});
  lines.innerHTML =
    '<svg class="lx-stage__lines" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<line x1="-40" y1="690" x2="1240" y2="560"/><line x1="-40" y1="120" x2="620" y2="-40"/>' +
    '<path d="M 1050 840 A 560 560 0 0 0 585 -60"/><path d="M -80 430 A 640 640 0 0 1 520 860"/>' +
    '<circle cx="1063" cy="577" r="2.2"/><circle cx="150" cy="662" r="2.2"/></svg>';
  stage.append(lines.firstElementChild as SVGElement, elem('div', { class: 'lx-stage__grain', 'aria-hidden': 'true' }));

  const viewport = elem('div', { class: 'lx-viewport' });
  const zoomer = elem('div', { class: 'lx-zoomer' });
  const scene = elem('div', { class: 'lx-scene' });
  const book = elem('div', { class: 'lx-book' });
  scene.append(book);
  zoomer.append(scene);
  viewport.append(zoomer);
  stage.append(viewport, store);

  const edgeL = elem('div', { class: 'lx-edges lx-edges--left', 'aria-hidden': 'true' });
  const edgeR = elem('div', { class: 'lx-edges lx-edges--right', 'aria-hidden': 'true' });
  const halfR = elem('div', { class: 'lx-half lx-half--right' });
  const halfL = elem('div', { class: 'lx-half lx-half--left' });
  const spine = elem('div', { class: 'lx-spineline', 'aria-hidden': 'true' });
  book.append(edgeL, edgeR, halfR, halfL, spine);

  /* ---- מצב --------------------------------------------------------------- */
  let pos = 1;
  let view: 'double' | 'single' = 'double';
  let pw = 0;
  let flip: Flip | null = null;
  let fade = false;
  let zoom = 1;
  let fsFallback = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const single = (): boolean => view === 'single';
  const lastSpread = (): number => lastOpenSpread(MODEL_TOTAL) + 1;
  const backPos = backCoverPos(MODEL_TOTAL);
  const cur = (): number => (single() ? pos : spreadOfPos(pos, MODEL_TOTAL));
  const lastState = (): number => (single() ? backPos : lastSpread());

  /* ---- תוכן דף בתוך חצי / פאה ------------------------------------------- */
  const colophon = (): HTMLElement =>
    elem('div', { class: 'lx-cover lx-cover--colophon', lang: 'he', dir: 'rtl' },
      elem('h4', { class: 'lx-colophon__title', text: 'מערכת צירים — הרביע הראשון' }),
      elem('p', { class: 'lx-colophon__line', text: 'חוברת עבודה לכיתה ז\'' }),
      elem('p', { class: 'lx-colophon__line', text: 'הדרכה במחוז ירושלים והעיר ירושלים — מנח"י, בהובלת איילת קריספין' }),
      elem('p', { class: 'lx-colophon__line', text: 'עיבוד דיגיטלי: יניב רז · מדריך מחוזי חט"ב בעיר ירושלים' }),
      elem('p', { class: 'lx-colophon__year', text: 'שנה"ל תשפ"ז' }),
    );
  const backCover = (): HTMLElement =>
    elem('div', { class: 'lx-cover lx-cover--back', lang: 'he', dir: 'rtl' },
      elem('p', { class: 'lx-cover__backtitle', text: 'מערכת צירים — הרביע הראשון' }),
      elem('p', { class: 'lx-cover__org', text: 'מחוז ירושלים — מנח"י · תשפ"ז' }),
    );

  /** הדף החי מוחזר למחסן לפני שהוא מוצב מחדש — צומת DOM חי בשני מקומות לא קיים. */
  const contentFor = (pr: PageRef): HTMLElement | null => {
    switch (pr.kind) {
      case 'none': return null;
      case 'blank': return elem('div', { class: 'lx-blankpage', 'aria-hidden': 'true' });
      case 'back-inner': return colophon();
      case 'back-cover': return backCover();
      case 'page': {
        const sheet = sheets[pr.page - 1];
        if (!sheet) return null;
        const scale = pw ? pw / SHEET_W : 0;
        const wrap = elem('div', { class: 'lx-pagescale' });
        wrap.style.width = `${SHEET_W}px`;
        wrap.style.height = `${SHEET_H}px`;
        wrap.style.transform = `scale(${scale})`;
        wrap.append(sheet);
        return wrap;
      }
    }
  };

  const fill = (slot: HTMLElement, pr: PageRef, interactive: boolean): void => {
    // דפים חיים חוזרים למחסן; העטיפות הנלוות נזרקות.
    for (const live of slot.querySelectorAll('.lx-pagescale > .sheet')) store.append(live);
    slot.replaceChildren();
    if (pr.kind === 'none') { slot.setAttribute('aria-hidden', 'true'); return; }
    slot.removeAttribute('aria-hidden');
    const paper = elem('div', { class: 'lx-paper' + (interactive && pr.kind === 'page' ? ' lx-paper--interactive' : '') });
    const content = contentFor(pr);
    if (content) paper.append(content);
    slot.append(paper);
  };

  /* ---- הצבת הכפולה הנוכחית ---------------------------------------------- */
  const syncHalves = (): void => {
    if (single()) {
      const base = pageAtPos(flip ? flip.B : pos, MODEL_TOTAL);
      fill(halfR, { kind: 'none' }, false);
      fill(halfL, base, true);
      return;
    }
    const spread = spreadOfPos(pos, MODEL_TOTAL);
    const shown = flip
      ? { right: pagesAtSpread(flip.A, MODEL_TOTAL).right, left: pagesAtSpread(flip.B, MODEL_TOTAL).left }
      : pagesAtSpread(spread, MODEL_TOTAL);
    fill(halfR, shown.right, true);
    fill(halfL, shown.left, true);
  };

  /* ---- גיאומטריה --------------------------------------------------------- */
  const shiftFor = (state: number): number => (single() ? 0 : bookShift(state, MODEL_TOTAL) * pw);
  const tiltFor = (state: number): number => (single() ? 0 : state <= 0 ? -8 : state >= lastSpread() ? 8 : 0);

  const applyBookBase = (): void => {
    const ph = pw * (297 / 210);
    book.style.width = `${single() ? pw : pw * 2}px`;
    book.style.height = `${ph}px`;
    book.style.visibility = pw ? 'visible' : 'hidden';
    const state = cur();
    book.style.transform = `translateX(${shiftFor(state)}px)${tiltFor(state) ? ` rotateY(${tiltFor(state)}deg)` : ''}`;
    book.style.setProperty('--book-shift', `${shiftFor(state)}px`);

    const isClosed = pos <= 1;
    root.dataset['open'] = String(!isClosed);
    root.dataset['view'] = view;

    // עובי הדפים שנותרו
    const spread = spreadOfPos(pos, MODEL_TOTAL);
    const openFrac = single() ? (pos - 1) / (backPos - 1) : spread / lastSpread();
    const edgeMax = pw * 0.03;
    const showEdges = !isClosed && pos !== backPos && !single();
    edgeL.style.display = showEdges ? '' : 'none';
    edgeR.style.display = showEdges ? '' : 'none';
    spine.style.display = !isClosed && pos !== backPos ? '' : 'none';
    edgeL.style.setProperty('--edge-w', `${(edgeMax * (1 - openFrac)).toFixed(1)}px`);
    edgeR.style.setProperty('--edge-w', `${(edgeMax * openFrac).toFixed(1)}px`);
  };

  /* ---- מנוע הדפדוף ------------------------------------------------------- */
  const engine = { q: 0, raf: 0, dragging: false, didDrag: false, lastX: 0, lastT: 0, vel: 0 };
  let leaf: HTMLElement | null = null;

  const applyFrame = (flipNow: Flip, q: number): void => {
    if (leaf) leaf.style.transform = `rotateY(${(-180 * q).toFixed(3)}deg)`;
    const shift = shiftFor(flipNow.A) + (shiftFor(flipNow.B) - shiftFor(flipNow.A)) * q;
    const tilt = tiltFor(flipNow.A) * (1 - q) + tiltFor(flipNow.B) * q;
    book.style.transform = `translateX(${shift.toFixed(2)}px)${tilt ? ` rotateY(${tilt.toFixed(2)}deg)` : ''}`;
    stage.style.setProperty('--fold-shade', Math.sin(q * Math.PI).toFixed(3));
  };

  const buildLeaf = (f: Flip): void => {
    leaf = elem('div', { class: 'lx-leaf', 'aria-hidden': 'true' });
    const front = elem('div', { class: 'lx-leaf__face lx-leaf__face--front' });
    const back = elem('div', { class: 'lx-leaf__face lx-leaf__face--back' });
    const frontPr: PageRef | null = single()
      ? pageAtPos(f.A, MODEL_TOTAL)
      : pagesAtSpread(f.A, MODEL_TOTAL).left;
    const backPr: PageRef | null = single() ? null : pagesAtSpread(f.B, MODEL_TOTAL).right;
    fill(front, frontPr ?? { kind: 'none' }, false);
    fill(back, backPr ?? { kind: 'none' }, false);
    front.append(elem('div', { class: 'lx-leaf__sheen' }));
    back.append(elem('div', { class: 'lx-leaf__sheen' }));
    leaf.append(front, back);
    book.append(leaf);
    book.classList.add('lx-book--flipping');
  };

  const dropLeaf = (): void => {
    if (!leaf) return;
    for (const live of leaf.querySelectorAll('.lx-pagescale > .sheet')) store.append(live);
    leaf.remove();
    leaf = null;
    book.classList.remove('lx-book--flipping', 'lx-book--dragging');
  };

  const commitFlip = (_f: Flip, landedState: number): void => {
    cancelAnimationFrame(engine.raf);
    stage.style.setProperty('--fold-shade', '0');
    pos = single() ? clampPos(landedState, MODEL_TOTAL) : posOfSpread(landedState, MODEL_TOTAL);
    flip = null;
    dropLeaf();
    syncHalves();
    applyBookBase();
    syncChrome();
    savePos();
  };

  const animateTo = (f: Flip, target: 0 | 1, easing: (x: number) => number, baseMs: number): void => {
    cancelAnimationFrame(engine.raf);
    const from = engine.q;
    const span = Math.abs(target - from);
    if (span < 0.001) { commitFlip(f, target === 1 ? f.B : f.A); return; }
    const dur = Math.max(240, baseMs * span);
    const t0 = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - t0) / dur);
      const q = from + (target - from) * easing(t);
      engine.q = q;
      applyFrame(f, q);
      if (t < 1) engine.raf = requestAnimationFrame(step);
      else commitFlip(f, target === 1 ? f.B : f.A);
    };
    engine.raf = requestAnimationFrame(step);
  };

  /* קפיצה עם מעבר עדין (ללא קיפול) — לתוכן העניינים ולמצב reduced motion. */
  let fadeTimer = 0;
  const fadeJump = (nextPos: number): void => {
    cancelAnimationFrame(engine.raf);
    flip = null;
    dropLeaf();
    pos = clampPos(nextPos, MODEL_TOTAL);
    fade = true;
    book.classList.add('lx-book--fadeswap');
    syncHalves();
    applyBookBase();
    syncChrome();
    savePos();
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => { fade = false; book.classList.remove('lx-book--fadeswap'); }, 380);
  };

  /** פתיחת דפדוף. viaDrag: הדף נצמד לאצבע במקום לרוץ לבד. */
  const startFlip = (dir: 'fwd' | 'back', viaDrag: boolean): Flip | null => {
    if (flip || fade) return null; // מניעת דפדוף כפול מהיר
    const A = dir === 'fwd' ? cur() : cur() - 1;
    const B = A + 1;
    if (A < (single() ? 1 : 0) || B > lastState()) return null;
    if (reducedMotion.matches) {
      const landed = dir === 'fwd' ? B : A;
      fadeJump(single() ? landed : posOfSpread(landed, MODEL_TOTAL));
      return null;
    }
    const f: Flip = { dir, A, B };
    flip = f;
    engine.q = dir === 'fwd' ? 0 : 1;
    syncHalves();
    buildLeaf(f);
    applyFrame(f, engine.q);
    if (!viaDrag) {
      const coverFlip = A === (single() ? 1 : 0) || B === lastState();
      animateTo(f, dir === 'fwd' ? 1 : 0, easeInOutQuart, coverFlip ? COVER_MS : FLIP_MS);
    }
    return f;
  };

  const next = (): void => { startFlip('fwd', false); };
  const prev = (): void => { startFlip('back', false); };

  /* ---- גרירת דף ומחוות מגע ---------------------------------------------- */
  let dragFlip: { f: Flip; x0: number } | null = null;

  const beginDrag = (dir: 'fwd' | 'back', e: PointerEvent): void => {
    if (zoom > 1) return;
    const f = startFlip(dir, true);
    if (!f) return;
    dragFlip = { f, x0: e.clientX };
    engine.dragging = true;
    engine.didDrag = false;
    engine.lastX = e.clientX;
    engine.lastT = performance.now();
    engine.vel = 0;
    book.classList.add('lx-book--dragging');
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: PointerEvent): void => {
    const d = dragFlip;
    if (!d || !engine.dragging) return;
    const span = Math.max(240, (single() ? 1.05 : 1.2) * pw);
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 5) engine.didDrag = true;
    const q = d.f.dir === 'fwd' ? Math.min(1, Math.max(0, dx / span)) : Math.min(1, Math.max(0, 1 + dx / span));
    const now = performance.now();
    const dt = now - engine.lastT;
    if (dt > 0) engine.vel = (e.clientX - engine.lastX) / dt;
    engine.lastX = e.clientX;
    engine.lastT = now;
    engine.q = q;
    applyFrame(d.f, q);
  };

  const endDrag = (): void => {
    const d = dragFlip;
    if (!d) return;
    dragFlip = null;
    engine.dragging = false;
    book.classList.remove('lx-book--dragging');
    const { q, vel, didDrag } = engine;
    const f = d.f;
    if (!didDrag) {
      animateTo(f, f.dir === 'fwd' ? 1 : 0, easeInOutQuart, f.A === 0 || f.B === lastState() ? COVER_MS : FLIP_MS);
      return;
    }
    // השלמה לפי מרחק או מהירות: גרירה ימינה משלימה קדימה, ושמאלה אחורה.
    const target: 0 | 1 = f.dir === 'fwd' ? (q > 0.32 || vel > 0.45 ? 1 : 0) : (q < 0.68 || vel < -0.45 ? 0 : 1);
    animateTo(f, target, easeOutCubic, 480);
  };

  // החלקת מגע על שטח הדף (לא על רכיבים אינטראקטיביים ולא בזום)
  let swipeFrom: { x0: number; y0: number; id: number } | null = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || zoom > 1 || flip) return;
    const target = e.target as HTMLElement;
    if (target.closest('a,button,input,select,textarea,iframe,canvas,[data-lx-chrome]')) return;
    swipeFrom = { x0: e.clientX, y0: e.clientY, id: e.pointerId };
  });
  viewport.addEventListener('pointermove', (e) => {
    moveDrag(e);
    onZoomPanMove(e);
    const c = swipeFrom;
    if (!c || e.pointerId !== c.id) return;
    const dx = e.clientX - c.x0;
    const dy = e.clientY - c.y0;
    if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    swipeFrom = null;
    // גרירה ימינה = קדימה (הדף נודד ימינה בספר עברי); שמאלה = אחורה.
    const f = startFlip(dx > 0 ? 'fwd' : 'back', true);
    if (!f) return;
    dragFlip = { f, x0: c.x0 };
    engine.dragging = true;
    engine.didDrag = true;
    engine.lastX = e.clientX;
    engine.lastT = performance.now();
    book.classList.add('lx-book--dragging');
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointerup', () => { swipeFrom = null; endDrag(); onZoomPanUp(); });
  viewport.addEventListener('pointercancel', () => { swipeFrom = null; endDrag(); onZoomPanUp(); });

  /* ---- זום --------------------------------------------------------------- */
  const pan = { x: 0, y: 0 };
  let panDrag: { x0: number; y0: number; px: number; py: number } | null = null;
  const applyZoom = (): void => {
    zoomer.style.transform = zoom === 1 ? '' : `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
    viewport.style.cursor = zoom > 1 ? 'grab' : '';
  };
  const setZoom = (z: number): void => {
    zoom = Math.min(2.6, Math.max(1, Math.round(z * 100) / 100));
    if (zoom === 1) { pan.x = 0; pan.y = 0; }
    applyZoom();
    syncChrome();
  };
  viewport.addEventListener('pointerdown', (e) => {
    if (zoom <= 1) return;
    panDrag = { x0: e.clientX, y0: e.clientY, px: pan.x, py: pan.y };
    zoomer.classList.add('lx-zoomer--panning');
    viewport.setPointerCapture(e.pointerId);
  });
  const onZoomPanMove = (e: PointerEvent): void => {
    const p = panDrag;
    if (!p) return;
    const ph = pw * (297 / 210);
    const bookW = single() ? pw : pw * 2;
    const limX = (bookW * (zoom - 1)) / (2 * zoom) + 80;
    const limY = (ph * (zoom - 1)) / (2 * zoom) + 80;
    pan.x = Math.min(limX, Math.max(-limX, p.px + (e.clientX - p.x0) / zoom));
    pan.y = Math.min(limY, Math.max(-limY, p.py + (e.clientY - p.y0) / zoom));
    applyZoom();
  };
  const onZoomPanUp = (): void => {
    panDrag = null;
    zoomer.classList.remove('lx-zoomer--panning');
  };
  viewport.addEventListener('dblclick', (e) => {
    if ((e.target as HTMLElement).closest('a,button,input,iframe,canvas,[data-lx-chrome]')) return;
    setZoom(zoom > 1 ? 1 : 1.8);
  });

  /* ---- מסך מלא ----------------------------------------------------------- */
  const toggleFullscreen = async (): Promise<void> => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.requestFullscreen) await stage.requestFullscreen();
      else fsFallback = !fsFallback; // iPhone — אין Fullscreen API
    } catch {
      fsFallback = !fsFallback;
    }
    stage.classList.toggle('lx-stage--fsfallback', fsFallback);
    document.body.style.overflow = fsFallback ? 'hidden' : '';
    syncChrome();
  };
  const onFsChange = (): void => syncChrome();
  document.addEventListener('fullscreenchange', onFsChange);

  /* ---- תוכן עניינים צף ---------------------------------------------------- */
  let tocOpen: HTMLElement | null = null;
  const closeToc = (): void => { tocOpen?.remove(); tocOpen = null; };
  const openToc = (): void => {
    if (tocOpen) return;
    const wrap = elem('div', {});
    const scrim = elem('button', { class: 'lx-scrim', type: 'button', 'aria-label': 'סגירת תוכן העניינים' });
    const panel = elem('aside', { class: 'lx-toc', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'תוכן העניינים', dir: 'rtl' });
    const close = svgBtn('lx-toc__close', 'סגירה', '<path d="M4 4l16 16M20 4L4 20"/>');
    panel.append(
      elem('div', { class: 'lx-toc__head' },
        elem('h4', { class: 'lx-toc__title', text: 'תוכן העניינים' }),
        close,
      ),
    );
    const scroll = elem('div', { class: 'lx-toc__scroll' });
    const list = elem('ol', { class: 'lx-toc__list' });
    for (const [i, c] of CONTENTS.entries()) {
      const row = elem('button', { class: 'lx-toc__row', type: 'button' },
        elem('span', { class: 'lx-toc__num', text: String(i + 1).padStart(2, '0') }),
        elem('span', { class: 'lx-toc__text' },
          elem('span', { class: 'lx-toc__label', text: c.title }),
        ),
        elem('span', { class: 'lx-toc__page', text: `עמ' ${c.page}` }),
      );
      row.addEventListener('click', () => { closeToc(); jumpToPage(c.page + 2); });
      list.append(elem('li', {}, row));
    }
    const sec = elem('section', {}, elem('p', { class: 'lx-toc__group', text: 'פרקי החוברת' }), list);
    scroll.append(sec);

    // כל הדפים — רשת מספרים, בלי 74 ממוזערות חיות
    const thumbsTitle = elem('p', { class: 'lx-toc__thumbstitle', text: 'כל הדפים' });
    const thumbs = elem('div', { class: 'lx-toc__thumbs' });
    for (let n = 1; n <= TOTAL_PAGES; n++) {
      const t = elem('button', { class: 'lx-thumb', type: 'button', 'aria-label': `מעבר לעמוד ${n}` },
        elem('span', { class: 'lx-thumb__live' }, elem('span', { text: String(n) })),
        elem('span', { class: 'lx-thumb__num', 'aria-hidden': 'true', text: String(n) }),
      );
      if (n + 2 === pos) t.setAttribute('aria-current', 'true');
      t.addEventListener('click', () => { closeToc(); jumpToPage(n + 2); });
      thumbs.append(t);
    }
    scroll.append(elem('section', {}, thumbsTitle, thumbs));
    panel.append(scroll);

    scrim.addEventListener('click', closeToc);
    close.addEventListener('click', closeToc);
    wrap.append(scrim, panel);
    stage.append(wrap);
    tocOpen = wrap;
    (panel.querySelector('button') as HTMLElement | null)?.focus();
  };

  const jumpToPage = (targetPos: number): void => {
    const target = clampPos(targetPos, MODEL_TOTAL);
    const targetState = single() ? target : spreadOfPos(target, MODEL_TOTAL);
    if (targetState === cur()) return;
    if (Math.abs(targetState - cur()) === 1) startFlip(targetState > cur() ? 'fwd' : 'back', false);
    else fadeJump(target);
  };

  /* ---- אזורי הגרירה בקצוות (קדימה משמאל, אחורה מימין — ספר עברי) --------- */
  const zoneNext = elem('button', { class: 'lx-zone lx-zone--next', type: 'button', 'aria-label': 'הדף הבא' }) as HTMLButtonElement;
  const zonePrev = elem('button', { class: 'lx-zone lx-zone--prev', type: 'button', 'aria-label': 'הדף הקודם' }) as HTMLButtonElement;
  zoneNext.addEventListener('pointerdown', (e) => beginDrag('fwd', e));
  zonePrev.addEventListener('pointerdown', (e) => beginDrag('back', e));
  for (const z of [zoneNext, zonePrev]) {
    z.addEventListener('pointermove', moveDrag);
    z.addEventListener('pointerup', endDrag);
    z.addEventListener('pointercancel', endDrag);
  }
  stage.append(zoneNext, zonePrev);

  /* ---- חצים -------------------------------------------------------------- */
  const arrowNext = svgBtn('lx-arrow lx-arrow--next', 'הדף הבא', '<path d="M15 5l-7 7 7 7"/>');
  const arrowPrev = svgBtn('lx-arrow lx-arrow--prev', 'הדף הקודם', '<path d="M9 5l7 7-7 7"/>');
  arrowNext.addEventListener('click', () => { setZoom(1); next(); });
  arrowPrev.addEventListener('click', () => { setZoom(1); prev(); });
  const chrome = elem('div', { class: 'lx-chrome', 'data-lx-chrome': 'true' }, arrowNext, arrowPrev);
  stage.append(chrome);

  /* ---- סרגל עליון — פעולות, בשפת כפתורי הזוויות --------------------------- */
  const readBtn = elem('a', { href: '#/workbook/1', title: 'מצב קריאה נגיש — הדף הנוכחי כדף רגיל' }) as HTMLAnchorElement;
  readBtn.innerHTML =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
    '<rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M5 5.5h6M5 8h6M5 10.5h4" stroke-linecap="round"/></svg>מצב קריאה נגיש';
  /* הורדה אמיתית: קובץ PDF מוכן, בלי חלון הדפסה — כמו אצל הזוויות. */
  const dlBtn = elem('button', { type: 'button', title: 'הורדת החוברת המלאה — קובץ PDF מוכן' }) as HTMLButtonElement;
  dlBtn.innerHTML =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
    '<path d="M8 1.5v8.5M4.5 7 8 10.5 11.5 7" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 13.5h11" stroke-linecap="round"/></svg>הורדת החוברת (PDF)';
  dlBtn.addEventListener('click', () => openActionChooser('download'));
  const prBtn = elem('button', { type: 'button', title: 'הדפסת החוברת — בצבע או בשחור-לבן' }) as HTMLButtonElement;
  prBtn.innerHTML =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
    '<path d="M4 6V2.5h8V6M4 11h-1.5V6h11v5H12" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="9.5" width="8" height="4" rx="0.5"/></svg>הדפסה';
  prBtn.addEventListener('click', () => openActionChooser('print'));
  /* אצל הזוויות החוברת מוטמעת בעמוד האתר; אצלנו היא כתובת — ולכן חייבת דרך
     חזרה, כמו ה„חזרה לאתר" של סרגלי הקריאה שלהם. */
  const backBtn = elem('a', { href: '#/', title: 'חזרה לאתר', text: '‹ חזרה לאתר' }) as HTMLAnchorElement;

  const topbar = elem('div', { class: 'lx-topbar lx-chrome', 'data-lx-chrome': 'true' },
    elem('span', { class: 'lx-topbar__title', text: 'מערכת צירים — הרביע הראשון · חוברת דיגיטלית' }),
    elem('span', { class: 'lx-topbar__acts' }, backBtn, readBtn, dlBtn, prBtn),
  );
  stage.append(topbar);

  /* ---- סרגל תחתון — ניווט ------------------------------------------------- */
  const tbPrev = svgBtn('lx-toolbar__btn', 'הדף הקודם', '<path d="M9 5l7 7-7 7"/>');
  const tbNext = svgBtn('lx-toolbar__btn', 'הדף הבא', '<path d="M15 5l-7 7 7 7"/>');
  tbPrev.addEventListener('click', () => { setZoom(1); prev(); });
  tbNext.addEventListener('click', () => { setZoom(1); next(); });
  const pagesLabel = elem('span', { class: 'lx-toolbar__pages', 'aria-live': 'polite' });
  const tbToc = svgBtn('lx-toolbar__btn', 'תוכן העניינים', '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>');
  tbToc.addEventListener('click', openToc);
  const tbZoomOut = svgBtn('lx-toolbar__btn', 'הקטנה', '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-4.3-4.3"/>');
  const tbZoomIn = svgBtn('lx-toolbar__btn', 'הגדלה', '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M21 21l-4.3-4.3"/>');
  const tbZoomReset = svgBtn('lx-toolbar__btn', 'איפוס תצוגה', '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>');
  tbZoomOut.addEventListener('click', () => setZoom(zoom - 0.4));
  tbZoomIn.addEventListener('click', () => setZoom(zoom + 0.4));
  tbZoomReset.addEventListener('click', () => setZoom(1));
  const tbFs = svgBtn('lx-toolbar__btn', 'מסך מלא', '<path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/>');
  tbFs.addEventListener('click', () => { void toggleFullscreen(); });
  const tbClose = svgBtn('lx-toolbar__btn', 'סגירת החוברת וחזרה לשער',
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>');
  tbClose.addEventListener('click', () => fadeJump(1));

  const toolbar = elem('div', {
    class: 'lx-toolbar lx-chrome', 'data-lx-chrome': 'true', role: 'toolbar', 'aria-label': 'ניווט בחוברת',
  },
    tbPrev, pagesLabel, tbNext,
    elem('span', { class: 'lx-toolbar__sep', 'aria-hidden': 'true' }),
    tbToc, tbZoomOut, tbZoomIn, tbZoomReset, tbFs,
    elem('span', { class: 'lx-toolbar__sep', 'aria-hidden': 'true' }),
    tbClose,
  );
  stage.append(toolbar);

  /* ---- מסך כניסה — «התחל» -------------------------------------------------
     „בעמוד הראשון של החוברת חייב להיות כפתור שכתוב עליו התחל… ופותח מייד את
     תוכן העניינים." הדפדוף הראשון נוחת על הכפולה שתוכן העניינים יושב בה. */
  const entryBtn = elem('button', { class: 'lx-entry__btn', type: 'button', text: 'התחל' });
  entryBtn.addEventListener('click', () => next());
  const entry = elem('div', { class: 'lx-entry', 'data-lx-chrome': 'true' }, entryBtn);
  stage.append(entry);
  book.addEventListener('click', () => { if (pos <= 1 && !flip) next(); });

  /* ---- מקלדת -------------------------------------------------------------- */
  stage.addEventListener('keydown', (e) => {
    if (tocOpen) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); next(); } // קדימה = שמאלה (RTL)
    else if (e.key === 'ArrowRight') { e.preventDefault(); prev(); }
    else if ((e.key === 'Enter' || e.key === ' ') && pos <= 1) { e.preventDefault(); next(); }
    else if (e.key === 'Home') { e.preventDefault(); fadeJump(1); }
  });

  /* ---- הסרגלים משקפים את המצב -------------------------------------------- */
  function syncChrome(): void {
    const isClosed = pos <= 1;
    const atEnd = pos === backPos;
    arrowNext.disabled = atEnd || Boolean(flip);
    arrowPrev.disabled = isClosed || Boolean(flip);
    tbNext.disabled = atEnd;
    tbPrev.disabled = isClosed;
    zoneNext.disabled = atEnd || Boolean(flip);
    zonePrev.disabled = isClosed || Boolean(flip);
    zoneNext.style.display = zoom > 1 ? 'none' : '';
    zonePrev.style.display = zoom > 1 ? 'none' : '';
    chrome.style.display = isClosed ? 'none' : '';
    toolbar.style.display = isClosed ? 'none' : '';
    entry.style.display = isClosed ? '' : 'none';
    tbZoomReset.style.display = zoom > 1 ? '' : 'none';
    readBtn.href = `#/workbook/${innerOf(pos)}`;

    /* המספרים על הסרגל הם מספרי החוברת המודפסת: השער ותוכן העניינים אינם
       ממוספרים, ולכן דף-מודל n הוא עמוד n−2. */
    let label: string;
    if (pos <= 1) label = 'השער';
    else if (pos === backPos) label = 'כריכה אחורית';
    else {
      const shown: number[] = single()
        ? (pos >= 3 && pos <= MODEL_TOTAL ? [pos - 2] : [])
        : visiblePagesAtSpread(spreadOfPos(pos, MODEL_TOTAL), MODEL_TOTAL).map((p) => p - 2).filter((n) => n >= 1);
      label = shown.length === 2 ? `עמודים ${shown[0]}–${shown[1]} מתוך ${TOTAL_PAGES}`
        : shown.length === 1 ? `עמוד ${shown[0]} מתוך ${TOTAL_PAGES}`
        : pos === 2 ? 'תוכן העניינים' : 'סוף החוברת';
    }
    pagesLabel.textContent = label;
  }

  const savePos = (): void => {
    try { window.localStorage.setItem(STORAGE_KEY, String(pos)); } catch { /* private mode */ }
  };

  /* ---- מדידת הבמה --------------------------------------------------------- */
  const measure = (): void => {
    const cs = window.getComputedStyle(viewport);
    const w = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = viewport.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (!(w > 0) || !(h > 0)) return;
    const canDouble = w >= 680 && w / h >= 0.95;
    /* רצועת-צד לחצי הדפדוף — הספר גדל עד קצה השטח בלי שהחצים יחפפו את הדפים.
       צומצמה (128→100, 92→72) לבקשת יניב: „שיפרסו במסך באופן יותר נוח וברור"
       — כל פיקסל שנחסך כאן הולך ישירות לגודל העמודים. */
    const ARROW_GUTTER = w >= 1100 ? 100 : 72;
    const nextPw = canDouble
      ? Math.min((w - ARROW_GUTTER) / 2, (h - 6) * (210 / 297))
      : Math.min(w - 8, (h - 4) * (210 / 297));
    view = canDouble ? 'double' : 'single';
    pw = Math.max(200, Math.floor(nextPw));
    syncHalves();
    applyBookBase();
    syncChrome();
  };
  const ro = new ResizeObserver(measure);
  ro.observe(viewport);
  const firstMeasure = window.setTimeout(measure, 0);

  /* ---- הרכבה --------------------------------------------------------------- */
  outlet.append(root);

  // הדפים נמדדים כשהם בעץ מוצג (המחסן מוסתר ב-visibility, לא ב-display).
  hydrateGrids(store);
  fitSheets(store);
  for (const page of WORKBOOK) {
    if (!page.gameId) continue;
    const host = store.querySelector<HTMLElement>(`#${page.id} [data-game-host]`);
    const g = gameById(page.gameId);
    if (host && g) cleanups.push(g.mount(host));
  }

  // שחזור הדף השמור
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved) && saved > 1) pos = clampPos(saved, MODEL_TOTAL);
  } catch { /* private mode */ }

  measure();
  stage.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });

  return () => {
    ro.disconnect();
    window.clearTimeout(firstMeasure);
    cancelAnimationFrame(engine.raf);
    window.clearTimeout(fadeTimer);
    document.removeEventListener('fullscreenchange', onFsChange);
    document.body.style.overflow = '';
    closeToc();
    for (const fn of cleanups) fn();
  };
}
