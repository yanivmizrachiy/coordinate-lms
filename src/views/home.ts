import { elem } from '../lib/dom';
import { navigate } from '../router';
import { TOTAL_PAGES } from '../data/workbook';
import { APPROVED_COVER, OPENING_FILM, DISTRICT_BADGE } from '../data/cover';
import { openActionChooser } from './printChoice';
import type { ViewContext } from './context';

/* ===========================================================================
   The landing — the same site language as Yaniv's misparim unit, word for
   word in its structure: a dark top bar carrying the district badge and the
   מנח"י credit, a sticky pill nav, a hero that names the unit, a section per
   material, and a dark footer. Only the material itself is ours: the first
   quadrant, its film, and the 78-page booklet.
   =========================================================================== */

/** The curriculum film Yaniv published — embedded with the misparim facade.
    The heading over it is his, word for word: the big line names the unit and
    its author, the small line the curriculum update. */
const YOUTUBE_ID = 'h5wegXI2ZGw';
const YOUTUBE_TITLE = 'מערכת צירים ברביע הראשון — איילת קריספין';
const YOUTUBE_SUB = 'עדכון ת"ל — כיתה ז\' תשפ"ז';

const badgeImg = (cls: string): HTMLElement => {
  const pic = elem('picture', {});
  pic.append(
    elem('source', { srcset: DISTRICT_BADGE.webp, type: 'image/webp' }),
    elem('img', { class: cls, src: DISTRICT_BADGE.png, alt: DISTRICT_BADGE.alt, decoding: 'async' }),
  );
  return pic;
};

export function home({ outlet, setTitle }: ViewContext): (() => void) | void {
  setTitle('מערכת צירים — הרביע הראשון');
  const root = elem('div', { class: 'landing' });

  /* ---- top bar: the badge in its gold ring, the credit centred ---------- */
  root.append(
    elem('header', { class: 'ls-topbar' },
      elem('div', { class: 'ls-container ls-topbar__inner' },
        elem('span', { class: 'ls-topbar__logobox' }, badgeImg('ls-topbar__logo')),
        elem('div', { class: 'ls-topbar__text' },
          elem('span', { class: 'ls-topbar__lead', text: 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין' }),
          elem('span', { class: 'ls-topbar__year', text: 'שנה"ל התשפ"ז' }),
          elem('span', { class: 'ls-topbar__credit', text: 'האתר מנוהל ע"י יניב רז · מדריך מחוזי חט"ב בעיר ירושלים' }),
        ),
      ),
    ),
  );

  /* ---- sticky nav ------------------------------------------------------- */
  const navLink = (label: string, go: () => void): HTMLElement => {
    const a = elem('button', { class: 'ls-nav__link', type: 'button', text: label });
    a.addEventListener('click', go);
    return a;
  };
  const toAnchor = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  /* „בכותרת למעלה תמחק את המילים סרט הפתיחה — זה מיותר": the film is the top
     of the page itself, so it needs no link pointing at it. */
  root.append(
    elem('nav', { class: 'ls-nav', 'aria-label': 'ניווט בעמוד' },
      elem('div', { class: 'ls-container ls-nav__inner' },
        /* „תמחק את הכפתור כל הפעולות — מיותר ממש" (31.07.2026): the nav keeps
           only the two materials; the menu is reachable from the app itself. */
        navLink('סרטון עדכון ת"ל', toAnchor('video')),
        navLink('חוברת העבודה', toAnchor('booklet')),
      ),
    ),
  );

  /* ---- hero: the tram film IS the workbook's front page ------------------
     Yaniv: „הסרטון של הרכבת הוא העמוד הראשי של חוברת העבודה" — so it sits in
     the hero itself, playing as the page opens, with the unit's name and the
     way into the booklet beside it. Not a section further down; the front. */
  const ctaBook = elem('button', { class: 'ls-btn ls-btn--primary', type: 'button', text: 'פתיחת החוברת' });
  ctaBook.addEventListener('click', () => navigate('#/book'));
  const ctaVideo = elem('button', { class: 'ls-btn ls-btn--ghost', type: 'button', text: 'צפייה בסרטון' });
  ctaVideo.addEventListener('click', toAnchor('video'));

  /* The film runs ONCE, with sound, every time the page comes up — no sound
     button, no replay: „הסרטון ירוץ עם הקול פעם אחת בכל פעם שעולה העמוד…
     אחרי שהסרטון ירוץ תישאר רק תמונה עומדת". A browser may refuse sound
     before the user has touched the page; then the film still runs (muted),
     and the very first touch anywhere turns the sound on mid-run. When it
     ends, the finished coordinate system stands as a still picture. */
  const filmBox = elem('div', { class: 'ls-viewer' });
  const film = elem('video', {
    class: 'ls-film',
    poster: OPENING_FILM.poster,
    preload: 'auto',
    playsinline: '', autoplay: '',
    'aria-label': OPENING_FILM.alt,
  }) as HTMLVideoElement;
  film.playsInline = true;
  film.append(
    elem('source', { src: OPENING_FILM.webm, type: 'video/webm' }),
    elem('source', { src: OPENING_FILM.mp4, type: 'video/mp4' }),
  );

  const unmuteOnTouch = (): void => {
    if (!film.paused && !film.ended) film.muted = false;
  };
  film.muted = false;
  film.play().catch(() => {
    film.muted = true;
    void film.play().catch(() => { /* the poster stands */ });
    window.addEventListener('pointerdown', unmuteOnTouch, { once: true });
  });

  film.addEventListener('ended', () => {
    const still = elem('picture', {});
    still.append(
      elem('source', { srcset: OPENING_FILM.still, type: 'image/webp' }),
      elem('img', { class: 'ls-film', src: OPENING_FILM.stillFallback, alt: OPENING_FILM.alt, decoding: 'async' }),
    );
    filmBox.replaceChildren(still);
  });
  filmBox.append(film);

  root.append(
    elem('section', { class: 'ls-hero', id: 'opening' },
      elem('div', { class: 'ls-container ls-hero__grid' },
        elem('div', { class: 'ls-reveal' },
          elem('div', { 'aria-hidden': 'true' },
            elem('span', { class: 'ls-axesbadge ls-axesbadge--x', text: 'x' }),
            elem('span', { class: 'ls-axesbadge ls-axesbadge--y', text: 'y' }),
          ),
          /* No sales copy here — Yaniv: „כל המילים… זה דמו, תמחק הכל מייד".
             The name of the unit, the way in, and nothing else. */
          elem('span', { class: 'ls-hero__eyebrow', text: 'מתמטיקה · כיתה ז\'' }),
          elem('h1', { class: 'ls-hero__title', text: 'מערכת צירים ברביע הראשון' }),
          elem('div', { class: 'ls-hero__actions' }, ctaBook, ctaVideo),
        ),
        elem('div', { class: 'ls-hero__film ls-reveal' }, filmBox),
      ),
    ),
  );

  const sectionHead = (eyebrow: string, title: string, sub?: string): HTMLElement =>
    elem('div', { class: 'ls-section__head ls-reveal' },
      elem('span', { class: 'ls-section__eyebrow', text: eyebrow }),
      elem('h2', { class: 'ls-section__title', text: title }),
      ...(sub ? [elem('p', { class: 'ls-section__sub', text: sub })] : []),
    );

  /* ---- the curriculum film: the misparim facade, player loads on press -- */
  const videoBox = elem('div', { class: 'ls-viewer' });
  const facade = elem('button', {
    class: 'ls-facade', type: 'button', 'aria-label': `הפעלת הסרטון: ${YOUTUBE_TITLE}`,
  });
  const thumb = elem('img', {
    class: 'ls-facade__thumb',
    src: `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`,
    alt: YOUTUBE_TITLE, loading: 'lazy',
  }) as HTMLImageElement;
  thumb.addEventListener('error', () => {
    if (!thumb.dataset['fallback']) {
      thumb.dataset['fallback'] = '1';
      thumb.src = `https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;
    }
  });
  const play = elem('span', { class: 'ls-facade__play', 'aria-hidden': 'true' });
  play.innerHTML =
    '<svg viewBox="0 0 68 48" width="72" height="50">' +
    '<path d="M66.5 7.7c-.8-2.9-3-5.1-5.9-5.9C55.5.5 34 .5 34 .5S12.5.5 7.4 1.8C4.5 2.6 2.3 4.8 1.5 7.7.2 12.8.2 24 .2 24s0 11.2 1.3 16.3c.8 2.9 3 5.1 5.9 5.9C12.5 47.5 34 47.5 34 47.5s21.5 0 26.6-1.3c2.9-.8 5.1-3 5.9-5.9C67.8 35.2 67.8 24 67.8 24s0-11.2-1.3-16.3z" fill="#cc0000"/>' +
    '<path d="M27 34.5l18-10.5-18-10.5z" fill="#fff"/></svg>';
  facade.append(thumb, play);
  facade.addEventListener('click', () => {
    /* cc_load_policy=1 turns the video's Hebrew captions on inside the embed
       itself — „הכתוביות ניתן יהיה לראות גם בסרטון המוטמע". */
    const frame = elem('iframe', {
      src: `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&cc_load_policy=1&cc_lang_pref=iw&hl=iw`,
      title: YOUTUBE_TITLE,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: '',
    });
    videoBox.replaceChildren(frame);
  });
  videoBox.append(facade);

  root.append(
    elem('section', { class: 'ls-section ls-section--soft', id: 'video' },
      elem('div', { class: 'ls-container' },
        sectionHead('סרטון', YOUTUBE_TITLE, YOUTUBE_SUB),
        videoBox,
        elem('div', { class: 'ls-viewer__bar' },
          elem('a', {
            class: 'ls-btn ls-btn--ghost',
            href: `https://www.youtube.com/watch?v=${YOUTUBE_ID}`,
            target: '_blank', rel: 'noopener noreferrer', text: 'פתיחה ביוטיוב',
          }),
        ),
      ),
    ),
  );

  /* ---- the booklet, in the misparim pdfframe ---------------------------- */
  const coverLink = elem('a', { class: 'ls-pdfframe__page', href: '#/book', 'aria-label': 'פתיחת החוברת המלאה' });
  const coverPic = elem('picture', {});
  coverPic.append(
    elem('source', { srcset: APPROVED_COVER.webp, type: 'image/webp' }),
    elem('img', { src: APPROVED_COVER.src, alt: APPROVED_COVER.alt, loading: 'lazy', decoding: 'async' }),
  );
  coverLink.append(coverPic);

  const openBtn = elem('button', { class: 'ls-btn ls-btn--gold', type: 'button', text: 'פתיחת החוברת' });
  openBtn.addEventListener('click', () => navigate('#/book'));
  /* „על החוברת למטה צריך להופיע במקום נוח כפתור ההתחל" (31.07.2026) — the
     big way in sits right under the cover, centred, where the eye lands. */
  const startBtn = elem('button', { class: 'ls-btn ls-btn--gold ls-pdfframe__start', type: 'button', text: 'התחל' });
  /* „התחל" פותח את העמוד הבא — תוכן העניינים — לעולם לא את הדף האחרון
     שביקרת בו (31.07.2026). הדגל נקרא ונמחק בכניסת החוברת. */
  startBtn.addEventListener('click', () => {
    try { window.sessionStorage.setItem('quadrant:lxbook:open', 'toc'); } catch { /* private mode */ }
    navigate('#/book');
  });
  const dlBtn = elem('button', { class: 'ls-btn ls-btn--ghost', type: 'button', text: '⬇ הורדה (PDF)' });
  dlBtn.addEventListener('click', () => openActionChooser('download'));
  const printBtn = elem('button', { class: 'ls-btn ls-btn--ghost', type: 'button', text: '🖨 הדפסה' });
  printBtn.addEventListener('click', () => openActionChooser('print'));

  root.append(
    elem('section', { class: 'ls-section ls-section--soft', id: 'booklet' },
      elem('div', { class: 'ls-container' },
        sectionHead('חוברת העבודה', `החוברת המלאה · ${TOTAL_PAGES} עמודים`,
          'דפי עבודה, שעשועונים משולבים ותוכן עניינים צבעוני — להדפסה כ־A4 או לפתרון על המסך.'),
        elem('div', { class: 'ls-pdfframe' },
          elem('div', { class: 'ls-pdfframe__bar' },
            elem('span', { class: 'ls-pdfframe__title', text: 'מערכת צירים — הרביע הראשון · חוברת עבודה' }),
            elem('span', { class: 'ls-pdfframe__acts' }, openBtn, dlBtn, printBtn),
          ),
          elem('div', { class: 'ls-pdfframe__stage' }, coverLink,
            elem('div', { class: 'ls-pdfframe__startrow' }, startBtn),
          ),
        ),
      ),
    ),
  );

  /* ---- footer ----------------------------------------------------------- */
  root.append(
    elem('footer', { class: 'ls-footer' },
      elem('div', { class: 'ls-container ls-footer__inner' },
        elem('span', { class: 'ls-footer__brand' },
          badgeImg('ls-footer__logo'),
          elem('span', { text: 'מערכת צירים ברביע הראשון · מחוז ירושלים — מנח"י' }),
        ),
        elem('span', { text: 'האתר מנוהל ע"י יניב רז · מדריך מחוזי חט"ב בעיר ירושלים' }),
      ),
    ),
  );

  outlet.append(root);
  requestAnimationFrame(() => root.classList.add('landing--in'));

  return () => {
    film.pause();
    window.removeEventListener('pointerdown', unmuteOnTouch);
  };
}