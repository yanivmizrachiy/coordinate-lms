import { test, expect } from '@playwright/test';

test('the landing carries the misparim structure: top bar, nav, hero, sections, footer', async ({ page }) => {
  // the suite runs on the reduced-motion path; this test asserts the badge
  // ANIMATES, so it alone asks for the regular-motion experience
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/');
  // the top bar: the district credit, the year, the badge in its gold ring
  await expect(page.locator('.ls-topbar__lead')).toContainText('מנח"י');
  await expect(page.locator('.ls-topbar__year')).toContainText('תשפ"ז');
  await expect(page.locator('.ls-topbar__logo')).toBeVisible();
  // the sticky nav and the hero naming the unit
  await expect(page.locator('.ls-nav')).toBeVisible();
  await expect(page.locator('.ls-hero__title')).toHaveText('מערכת צירים ברביע הראשון');
  // Yaniv: the sales paragraph was demo copy — it must never come back
  await expect(page.locator('.ls-hero__desc')).toHaveCount(0);
  // the film IS the hero — inside the hero grid, not a section further down
  await expect(page.locator('.ls-hero .ls-viewer video')).toHaveCount(1);
  // „תמחק את המילים סרט הפתיחה" — the nav does not name the film
  await expect(page.locator('.ls-nav__link', { hasText: 'סרט הפתיחה' })).toHaveCount(0);
  // „למעלה בכותרת תכתוב סרטון עדכון ת"ל"
  await expect(page.locator('.ls-nav__link', { hasText: 'סרטון עדכון ת"ל' })).toHaveCount(1);
  // the film caption was demo copy — gone for good
  await expect(page.locator('.ls-hero__filmcap')).toHaveCount(0);
  // the badge turns on itself, like on Yaniv's other sites
  const spin = await page.locator('.ls-topbar__logo').evaluate((el) => getComputedStyle(el).animationName);
  expect(spin, 'the badge does not turn').toBe('ls-badge-turn');
  // one section per material, and the dark footer
  for (const id of ['video', 'opening', 'booklet']) {
    await expect(page.locator(`section#${id}`), `section #${id} is missing`).toHaveCount(1);
  }
  await expect(page.locator('.ls-footer')).toBeVisible();
  // the app bar stays out of the landing's way — it has its own top bar
  // measured, not by class name: the class was once applied while the CSS rule
  // that hides the bar had been deleted, and the check passed on a visible bar
  const barShown = await page.locator('.appbar').evaluate((el) => getComputedStyle(el).display);
  expect(barShown, 'the app bar sits on top of the landing').toBe('none');
});

/* The curriculum film, embedded exactly the way misparim embeds its videos: a
   facade with the thumbnail and the red play button, and the real player only
   loads when it is asked for. */
test('the curriculum film carries its title and loads on press', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('#video .ls-section__title'))
    .toHaveText('מערכת צירים ברביע הראשון — איילת קריספין');
  await expect(page.locator('#video .ls-section__sub')).toHaveText('עדכון ת"ל — כיתה ז\' תשפ"ז');
  // before the press: a facade, no iframe — nothing talks to YouTube yet
  await expect(page.locator('#video iframe')).toHaveCount(0);
  await expect(page.locator('.ls-facade')).toBeVisible();

  await page.locator('.ls-facade').click();
  const frame = page.locator('#video iframe');
  await expect(frame).toHaveCount(1);
  const src = await frame.getAttribute('src');
  expect(src, 'the player is not the privacy embed').toContain('youtube-nocookie.com/embed/h5wegXI2ZGw');
  expect(src, 'the player does not start on press').toContain('autoplay=1');
  expect(src, 'the captions are not turned on in the embed').toContain('cc_load_policy=1');
});

/* Our opening film sits in a viewer card like every other material: it plays
   once, stays silent until asked, and offers sound and replay. */
test('the opening film runs once on load, no buttons, and comes to rest', async ({ page }) => {
  await page.goto('/#/');
  const film = page.locator('#opening video');
  await expect(film).toHaveCount(1);
  const shape = await film.evaluate((el) => {
    const v = el as HTMLVideoElement;
    return { loops: v.loop, inline: v.playsInline, autoplay: v.autoplay, poster: v.getAttribute('poster') ?? '' };
  });
  expect(shape.autoplay, 'the film does not start on its own').toBe(true);
  expect(shape.loops, 'the film loops instead of coming to rest').toBe(false);
  expect(shape.inline, 'iOS would take the film full screen').toBe(true);
  expect(shape.poster, 'no poster, so the card starts blank').not.toBe('');
  // no sound button, no replay — the film needs nothing pressed
  await expect(page.locator('.ls-filmbtn')).toHaveCount(0);
  // when the film ends, only the still picture stands
  await film.evaluate((el) => (el as HTMLVideoElement).dispatchEvent(new Event('ended')));
  await expect(page.locator('#opening video')).toHaveCount(0);
  await expect(page.locator('#opening .ls-hero__film img')).toHaveCount(1);
});

/* The booklet is presented in the misparim pdfframe: a dark bar with the
   actions, and the cover as the page on the stage. */
test('the booklet frame shows the cover and opens the book', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('.ls-pdfframe__bar')).toContainText('חוברת עבודה');
  // „על החוברת למטה צריך להופיע במקום נוח כפתור ההתחל" — big, centred, under
  // the cover, and it opens the booklet like the cover itself does
  const start = page.locator('.ls-pdfframe__start');
  await expect(start).toHaveText('התחל');
  const [s2, c2] = await Promise.all([start.boundingBox(), page.locator('.ls-pdfframe__page').boundingBox()]);
  expect(s2!.y, 'the start button is not under the cover').toBeGreaterThan(c2!.y + c2!.height - 4);
  await page.locator('.ls-pdfframe__page').click();
  await expect(page).toHaveURL(/#\/book$/);
  // the flipbook opens closed, the approved cover on its stage
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'false');
  await expect(page.locator('.lx-half--left .cover-sheet')).toHaveCount(1);
});

test('the hero CTA opens the cover straight away', async ({ page }) => {
  await page.goto('/#/');
  await page.locator('.ls-btn--primary', { hasText: 'פתיחת החוברת' }).click();
  await expect(page).toHaveURL(/#\/book$/);
  await expect(page.locator('.lx-half--left .cover-sheet')).toHaveCount(1);
});

/* The flipbook is the reading experience Yaniv asked for — „חוברת נפתחת
   דיגיטלית נוחה, כמו בפרויקט של זוויות": closed on the cover, a press opens
   the first spread, the toolbar walks and reports pages. */
test('the flipbook opens from the cover to the first spread', async ({ page }) => {
  await page.goto('/#/book');
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'false');
  await expect(page.locator('.lx-entry__btn')).toHaveText('התחל');
  await page.locator('.lx-entry__btn').click();
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'true', { timeout: 4000 });
  // the first spread of a Hebrew book: contents on the right, page 1 on the left
  const which = await page.evaluate(() => ({
    right: !!document.querySelector('.lx-half--right .toc-sheet'),
    left: document.querySelector('.lx-half--left .sheet-number')?.textContent?.trim() ?? '',
    single: document.querySelector('.lxbook')?.getAttribute('data-view'),
  }));
  if (which.single === 'double') {
    expect(which.right, 'the contents sheet is not on the right half').toBe(true);
    expect(which.left, 'page 1 is not on the left half').toBe('1');
  } else {
    // a phone shows one page at a time — the contents comes first
    expect(await page.locator('.lx-half--left .toc-sheet').count()).toBe(1);
  }
  await expect(page.locator('.lx-toolbar')).toBeVisible();
});

/* „אם בעמוד הראשי לוחצים על כפתור התחל צריך שייפתח… תוכן העניינים, ולא…
   העמוד האחרון שהייתי בו" (31.07.2026). זיכרון-המיקום בוטל; התחל = תוכן
   העניינים, תמיד. */
test('התחל opens the contents, never the remembered page', async ({ page }) => {
  await page.goto('/#/');
  // שריד של הזיכרון הישן לא קובע כלום — ומנוקה בכניסה
  await page.evaluate(() => window.localStorage.setItem('quadrant:lxbook:pos', '40'));
  await page.locator('.ls-pdfframe__start').click();
  await expect(page).toHaveURL(/#\/book$/);
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.lx-half .toc-sheet')).toHaveCount(1);
  const leftover = await page.evaluate(() => window.localStorage.getItem('quadrant:lxbook:pos'));
  expect(leftover, 'the old position key was not wiped').toBeNull();
});

test('the flipbook top bar carries the way back, the reader, the download and the picker', async ({ page }) => {
  await page.goto('/#/book');
  const acts = page.locator('.lx-topbar__acts');
  await expect(acts.locator('a', { hasText: 'חזרה לאתר' })).toHaveAttribute('href', '#/');
  await expect(acts.locator('a', { hasText: 'מצב קריאה נגיש' })).toHaveAttribute('href', /#\/workbook\/\d+/);
  await expect(acts.locator('button', { hasText: 'הורדת החוברת' })).toBeVisible();
  await expect(acts.locator('button', { hasText: 'הדפסה' })).toBeVisible();
  // „לא צריך למעלה כפתור של דפים נבחרים" — the chooser owns that choice now
  await expect(acts.locator('button', { hasText: 'דפים נבחרים' })).toHaveCount(0);
});

test('the landing never reaches the printer', async ({ page }) => {
  await page.goto('/#/');
  await page.emulateMedia({ media: 'print' });
  const shown = await page.locator('.landing').evaluate((el) => getComputedStyle(el).display);
  expect(shown, 'the landing would be sent to the printer').toBe('none');
  await page.emulateMedia({ media: 'screen' });
});

/* The district's badge belongs on the material it comes from: the opening, the
   menu, and every sheet of the booklet. */
test("the district's badge is on the landing and on every sheet", async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('.ls-topbar__logo')).toBeVisible();
  await expect(page.locator('.ls-footer__logo')).toBeVisible();

  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('.book > .sheet')]
      .filter((s) => !s.classList.contains('cover-sheet'))
      .filter((s) => !s.querySelector('.gz-badge img'))
      .map((s) => s.querySelector('.sheet-number')?.textContent?.trim() ?? '(toc)'),
  );
  expect(missing, `sheets with no badge: ${missing.join(', ')}`).toEqual([]);
});

/* The approved artwork is the booklet's first page and must keep its own shape:
   an A4 cover stretched to fill a box is a different picture. */
test('the cover keeps its own aspect ratio — never stretched', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(2500);
  const ratios = await page.locator('.cover-image').evaluate((el) => {
    const i = el as HTMLImageElement;
    const r = i.getBoundingClientRect();
    return { natural: i.naturalWidth / i.naturalHeight, shown: r.width / r.height };
  });
  expect(Math.abs(ratios.natural - ratios.shown)).toBeLessThan(0.02);
});

test('a worksheet renders an SVG coordinate grid', async ({ page }) => {
  await page.goto('/#/workbook/3');
  await expect(page.locator('.sheet')).toHaveCount(1);
  expect(await page.locator('.coordinate-grid svg').count()).toBeGreaterThan(0);
});

/* There is ONE contents page — the coloured sheet inside the booklet. The old
   chapter-list page at #/workbook was deleted for good („תמחק לצמיתות… דרשתי
   רק את התוכן עניינים הצבעוני"), so that address, and the legacy #/games,
   land on the booklet instead of resurrecting a second index. */
test('the deleted chapter-list page cannot come back', async ({ page }) => {
  for (const dead of ['#/workbook', '#/games']) {
    await page.goto('/' + dead);
    await page.waitForTimeout(1200);
    // the flipbook carries the one coloured contents sheet — no second index
    await expect(page.locator('.toc-sheet'), `${dead} does not reach the booklet`).toHaveCount(1);
    await expect(page.locator('.lxbook')).toHaveCount(1);
  }
});

test('no horizontal overflow on any core view', async ({ page }) => {
  /* #/print is the PRINTER's surface — true A4 by rule, so on a phone it pans
     sideways like any A4 preview. Every READING screen stays overflow-free. */
  for (const hash of ['#/', '#/menu', '#/workbook', '#/workbook/1', '#/workbook/12', '#/book']) {
    await page.goto('/' + hash);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(
      () => document.scrollingElement!.scrollWidth - window.innerWidth,
    );
    expect(overflow, `overflow on ${hash}`).toBeLessThanOrEqual(1);
  }
});

test('the full booklet opens with the cover, then the contents, then worksheet 1', async ({ page }) => {
  await page.goto('/#/print');
  const sheets = page.locator('.book > .sheet');
  await expect(sheets.first()).toHaveClass(/cover-sheet/);
  await expect(sheets.nth(1)).toHaveClass(/toc-sheet/);
  await expect(sheets.nth(2).locator('.sheet-number')).toHaveText('1');
});

/* The contents sheet is a sheet: it prints with the booklet, and on screen each
   chapter is a button that goes to that chapter's first page. */
test('the contents sheet lists every chapter and each button reaches its page', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(4000);
  const buttons = page.locator('.toc-sheet .toc-btn');
  const topics = await page.evaluate(() => document.querySelectorAll('.toc-sheet .toc-btn').length);
  /* The chapters Yaniv named, and no others: „כל השאר תמחק מהתוכן". */
  expect(topics, 'the contents sheet does not list the six chapters').toBe(6);

  /* „לא צריך כפל מספרים" (31.07.2026): ONE number per row — the big colour
     number IS the page number. Each chapter carries a colour of its own. */
  const colours = await buttons.evaluateAll((els) =>
    els.map((e) => getComputedStyle(e.querySelector('.toc-btn__no')!).color),
  );
  expect(new Set(colours).size, 'the chapters are not colour-coded').toBe(5);
  const doubled = await buttons.evaluateAll((els) =>
    els.filter((e) => ((e.textContent ?? '').match(/\d+/g) ?? []).length !== 1).length,
  );
  expect(doubled, 'a row carries more than one number').toBe(0);

  /* Each chip carries the page its chapter STARTS on, and nothing else. The
     chapters must run in order and start at page 1. */
  const starts = await buttons.evaluateAll((els) =>
    els.map((e) => Number((e.getAttribute('aria-label') ?? '').match(/בעמוד (\d+)/)?.[1] ?? 0)),
  );
  expect(starts, 'the contents point at the wrong pages').toEqual([1, 4, 15, 46, 51, 65]);
  const ranged = await buttons.evaluateAll((els) => els.filter((e) => /[–-]/.test(e.textContent ?? '')).length);
  expect(ranged, 'a chip still shows a page range instead of the starting page').toBe(0);

  /* The row reads like a real book's contents: the chapter name at the right,
     a dotted leader running left, and the colour page number at the LEFT edge.
     „יהיה קו נקודתי שיוביל מהמשפט לשמאל הדף". */
  const wrongWayRound = await buttons.evaluateAll((els) =>
    els.filter((e) => {
      const name = e.querySelector('.toc-btn__name')?.getBoundingClientRect();
      const leader = e.querySelector('.toc-btn__leader')?.getBoundingClientRect();
      const no = e.querySelector('.toc-btn__no')?.getBoundingClientRect();
      return !name || !leader || !no ||
        name.left <= no.right ||          // השם מימין למספר
        leader.width < 20 ||              // הקו באמת נמתח
        leader.left < no.right - 2 || leader.right > name.left + 2; // ובין שניהם
    }).length,
  );
  expect(wrongWayRound, 'the row does not read name, dotted leader, page number').toBe(0);

  /* „תגדיל מספרי העמודים ותגדיל כתב של שמות הפרקים" (31.07.2026) — the page
     number and the chapter name are LARGE, not the sheet's 13px body size. */
  const small = await buttons.evaluateAll((els) =>
    els.filter((e) =>
      parseFloat(getComputedStyle(e.querySelector('.toc-btn__no')!).fontSize) < 32 ||
      parseFloat(getComputedStyle(e.querySelector('.toc-btn__name')!).fontSize) < 20,
    ).length,
  );
  expect(small, 'a page number or chapter name shrank back to body size').toBe(0);

  /* The metal sits on the night ink, so the contrast is measured against the
     sheet itself — a faint metal vanishes on dark just as pale ink did on
     white. Measured, not eyeballed. */
  const faint = await buttons.evaluateAll((els) =>
    els.map((e) => {
      const no = e.querySelector('.toc-btn__no');
      if (!no) return null;
      const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]!) + 0.7152 * lin(rgb[1]!) + 0.0722 * lin(rgb[2]!);
      const ink = lum(getComputedStyle(no).color.match(/\d+/g)!.map(Number));
      const sheet = lum(getComputedStyle(e.closest('.toc-sheet')!).backgroundColor.match(/\d+/g)!.map(Number));
      const ratio = (Math.max(ink, sheet) + 0.05) / (Math.min(ink, sheet) + 0.05);
      return ratio < 4.5 ? `${no.textContent} at ${ratio.toFixed(1)}:1` : null;
    }).filter(Boolean),
  );
  expect(faint, `a page number is too faint to read: ${faint.join(', ')}`).toEqual([]);

  /* Every chip opens the page it names, straight away. */
  for (const [i, n] of [1, 4, 15, 46, 51, 65].entries()) {
    await page.goto('/#/print');
    await page.waitForTimeout(3500);
    await page.locator('.toc-btn').nth(i).click();
    await expect(page, `chip ${i + 1} does not open page ${n}`).toHaveURL(new RegExp(`#/workbook/${n}$`));
  }
});

/* A sheet is a fixed-height A4 box with overflow:hidden, so anything past its
   bottom edge is content the learner never sees — silently, with no error. */
test('no sheet cuts off its own content', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(3500);
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet')]
      .map((s) => {
        const main = s.querySelector('.sheet-content');
        if (!main) return null;
        let bottom = 0;
        for (const el of main.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.height && r.bottom > bottom) bottom = r.bottom;
        }
        const px = Math.round(s.getBoundingClientRect().bottom - bottom);
        const n = s.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return px < 0 ? `page ${n}: ${px}px` : null;
      })
      .filter(Boolean),
  );
  expect(clipped, clipped.join(', ')).toHaveLength(0);
});

/* Learners write inside the squares. A system squeezed into a narrow column
   keeps its ratio and collapses to a thumbnail — unusable on paper. The
   threshold is about the A4 sheet, so it is measured at full sheet width; a
   phone scales the whole sheet down and would fail it for the wrong reason. */
test('every coordinate system renders large enough to write on', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet, not on a phone');
  await page.goto('/#/print');
  await page.waitForTimeout(3500);
  const tiny = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet')]
      .flatMap((s) => {
        const n = s.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return [...s.querySelectorAll('.coordinate-grid svg')]
          .map((g) => g.getBoundingClientRect())
          .filter((r) => r.width < 240)
          .map((r) => `page ${n}: ${Math.round(r.width)}x${Math.round(r.height)}`);
      }),
  );
  expect(tiny, tiny.join(', ')).toHaveLength(0);
});

/* A Hebrew reader scans right-to-left, so in „ציר y” the word „ציר” has to be
   the RIGHTMOST part — that is what makes it the first word read. Pinning such
   a label to LTR moves the Hebrew left, and it then reads „y ציר”: backwards.
   Only measuring the glyph positions tells the two apart. */
test('a mixed label puts its Hebrew word on the right, where it is read first', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(3500);
  const reversed = await page.evaluate(() =>
    [...document.querySelectorAll('.coordinate-grid text')]
      .map((t) => {
        const s = t.textContent ?? '';
        if (!/[֐-׿]/.test(s) || !/[A-Za-z]/.test(s)) return null;
        const node = t as SVGTextContentElement;
        let hebrew = Infinity;
        let latin = Infinity;
        for (let i = 0; i < s.length; i++) {
          const x = node.getStartPositionOfChar(i).x;
          if (/[֐-׿]/.test(s[i]!)) hebrew = Math.min(hebrew, x);
          if (/[A-Za-z]/.test(s[i]!)) latin = Math.min(latin, x);
        }
        // the Hebrew word must sit to the RIGHT of the Latin part
        return hebrew < latin ? s : null;
      })
      .filter(Boolean),
  );
  expect(reversed, `reversed labels: ${reversed.join(' | ')}`).toHaveLength(0);
});

/* Half-empty sheets waste the learner's writing space and look unfinished.
   The spare height is handed to the drawings first and then to the gaps, so
   the typical page should come out close to full. A median rather than a
   per-page floor: a few sheets are genuinely short, and padding them out with
   air would be worse than leaving them. */
test('the typical sheet uses the paper it is printed on', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(6000);
  const used = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet')]
      .map((s) => {
        const main = s.querySelector('.sheet-content');
        const foot = s.querySelector('.gz-footer');
        if (!main || !foot) return null;
        let bottom = 0;
        for (const el of main.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.height && r.bottom > bottom) bottom = r.bottom;
        }
        const top = main.getBoundingClientRect().top;
        const footTop = foot.getBoundingClientRect().top;
        return Math.round(((bottom - top) / (footTop - top)) * 100);
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b),
  );
  const median = used[Math.floor(used.length / 2)]!;
  expect(median, `median fill ${median}%`).toBeGreaterThanOrEqual(80);
});

/* Sheet text is 13px — including anything a game draws. The exceptions are
   deliberate and listed here; anything else is a regression. */
test('every sheet keeps its body text at 13px', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(4000);
  const offenders = await page.evaluate(() => {
    const out: string[] = [];
    for (const s of document.querySelectorAll('.sheet')) {
      /* The contents sheet is the reader's designed opening page — Yaniv asked
         for LARGE chapter names and page numbers there (31.07.2026), and its
         own test pins those sizes. The 13px rule holds for every worksheet. */
      if (s.classList.contains('toc-sheet')) continue;
      const n = s.querySelector('.sheet-number')?.textContent?.trim() ?? 'cover';
      for (const el of s.querySelectorAll('*')) {
        if (el.closest('svg')) continue; // drawings scale as a unit
        const ownText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent!.trim());
        if (!ownText) continue;
        const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10;
        if (px === 13) continue;
        const allowed =
          el.tagName === 'H1' ||                    // page title
          el.classList.contains('sheet-number') ||  // the numbered circle
          // („כותרת משחק h2" ו־„.reveal" הוסרו מהרשימה ב־31.07.2026 —
          //  אין יותר שעשועונים, ולכן אין מי שיפיק אותם.)
          el.classList.contains('frac__n') ||       // fraction — two digits in one line
          el.classList.contains('frac__d') ||
          // P and S are written LARGE, the way a real textbook writes them —
          // „האותיות P S מקובל לכתוב אותן יותר גדולות" (31.07.2026)
          !!el.closest('.calc-sym__math') || // the symbol AND its <sub> name
          // the „=" that opens the squared exercise is part of the same
          // approved textbook opener — sized with the letter, not body text
          el.classList.contains('calc-squared__eq');
        if (!allowed) out.push(`page ${n}: ${el.tagName.toLowerCase()} at ${px}px`);
      }
    }
    return [...new Set(out)];
  });
  expect(offenders, offenders.join(', ')).toHaveLength(0);
});

/* יניב, 31.07.2026: „המשימות שלנו הן להדפסה!!" — כל שבעת השעשועונים המקוונים
   הוחלפו בדפי עבודה מודפסים. הבדיקה הקודמת כאן פתרה שעשועון בלחיצות; במקומה
   באה השמירה על הכלל עצמו: אין בחוברת עמוד שמארח ווידג'ט, ואין בו פקד
   שעיפרון לא יכול לענות עליו. תיבות נכון/לא־נכון נשארות — עיפרון מסמן אותן. */
test('no numbered page hosts a widget — the booklet is answerable in pencil', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const s of document.querySelectorAll('.sheet')) {
      /* עמוד ממוספר בלבד. דף תוכן העניינים אינו ממוספר, והכפתורים שבו הם
         ניווט בין פרקים על המסך — בהדפסה הם שורות טקסט, לא משימה. */
      const n = s.querySelector('.sheet-number')?.textContent?.trim() ?? '';
      if (!n) continue;
      if (s.querySelector('[data-game-host]')) out.push(`page ${n}: hosts an interactive game`);
      for (const el of s.querySelectorAll('button, select, textarea, input')) {
        const type = (el as HTMLInputElement).type;
        // a checkbox/radio is a box a pencil ticks — that stays
        if (el.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) continue;
        out.push(`page ${n}: has a <${el.tagName.toLowerCase()}> a pencil cannot answer`);
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* The screen always shows colour. Black and white exists only as a choice at
   PRINT time — the dialog offers both, and the class leaves with afterprint. */
test('one chooser asks all-or-selected and colour-or-BW, for print and for download', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(2500);
  await page.evaluate(() => { window.print = (): void => {}; });

  // the screen never starts drained
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(false);

  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  const choice = page.locator('.pick__modal--choice');
  await expect(choice).toBeVisible();
  // both questions live in the ONE dialog
  await expect(choice.locator('.pick__chip', { hasText: 'כל החוברת' })).toBeVisible();
  await expect(choice.locator('.pick__chip', { hasText: 'דפים נבחרים' })).toBeVisible();
  await expect(choice.locator('.pick__chip', { hasText: 'בצבע' })).toBeVisible();
  await choice.locator('.pick__chip', { hasText: 'שחור־לבן' }).click();
  await choice.locator('.btn--gold').click();
  await page.waitForTimeout(400);
  // the black-and-white class is on for the print itself…
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(true);
  // …and leaves the moment the dialog closes
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(false);

  // the download button opens the SAME chooser
  await page.locator('.wsbar .btn', { hasText: 'הורדה' }).click();
  await expect(page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' })).toBeVisible();
});

/* The page picker is the zaviyot WorksheetPicker, on our live sheets: the
   teacher marks exactly the pages wanted, and only those reach the paper. */
test('the page picker prints only the pages chosen', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(3000);
  await page.evaluate(() => { window.print = (): void => {}; });
  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  await page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' }).click();
  await page.locator('.pick__modal--choice .btn--gold').click();
  await expect(page.locator('.pick__grid')).toBeVisible();
  // nothing chosen — nothing to send
  await expect(page.locator('.pick__acts .btn--gold')).toBeDisabled();
  for (const n of [3, 4, 5]) await page.locator(`.pick__card[data-page="${n}"]`).click();
  await expect(page.locator('.pick__count')).toHaveText('נבחרו 3 עמודים');
  await page.locator('.pick__acts .btn', { hasText: 'הדפסת הנבחרים' }).click();
  await page.waitForTimeout(600);
  const kept = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet')]
      .filter((s) => !s.classList.contains('print-skip'))
      .map((s) => s.querySelector('.sheet-number')?.textContent?.trim() ?? 'cover'),
  );
  expect(kept).toEqual(['3', '4', '5']);
});

test('the picker never outlives its screen', async ({ page }) => {
  /* The modal hangs off <body>, outside the router's outlet. Without a
     hashchange guard it stayed standing over the NEXT screen — found by a
     screenshot, not by a test, which is exactly why this test exists. */
  await page.goto('/#/print');
  await page.waitForTimeout(2000);
  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  await page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' }).click();
  await page.locator('.pick__modal--choice .btn--gold').click();
  await expect(page.locator('.pick__grid')).toBeVisible();
  await page.evaluate(() => { location.hash = '#/workbook/5'; });
  await expect(page.locator('.pick__modal')).toHaveCount(0);
});

test('a picker preset chooses a whole chapter', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(2000);
  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  await page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' }).click();
  await page.locator('.pick__modal--choice .btn--gold').click();
  await expect(page.locator('.pick__grid')).toBeVisible();
  // the first chapter runs from page 1 up to the second chapter's start
  await page.locator('.pick__chip', { hasText: 'מושגים בסיסיים' }).click();
  await expect(page.locator('.pick__count')).toHaveText('נבחרו 3 עמודים');
  await page.locator('.pick__chip', { hasText: 'כל החוברת' }).click();
  await expect(page.locator('.pick__count')).toHaveText('נבחרו 78 עמודים');
  await page.locator('.pick__chip', { hasText: 'ניקוי הבחירה' }).click();
  await expect(page.locator('.pick__count')).toHaveText('לא נבחרו עמודים');
});

/* The bars themselves are the zaviyot bars: navy, sticky, the gold
   הורדה / הדפסה closing the actions — on the booklet and on every single page. */
test('the reading bars speak the zaviyot button language', async ({ page }) => {
  await page.goto('/#/print');
  const bar = page.locator('.wsbar');
  await expect(bar).toBeVisible();
  // download and print are DIFFERENT buttons — a file, and a printer
  await expect(bar.locator('.btn', { hasText: 'הורדה' })).toHaveCount(1);
  await expect(bar.locator('.btn--gold', { hasText: 'הדפסה' })).toHaveCount(1);
  // the screen shows colour only — no black-and-white switch outside printing
  await expect(bar.locator('.btn', { hasText: 'שחור' })).toHaveCount(0);
  // and no standalone picker button — the chooser asks all/selected itself
  await expect(bar.locator('.btn', { hasText: 'דפים נבחרים' })).toHaveCount(0);
  const navy = await bar.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(navy, 'the bar lost the navy of the zaviyot bars').toBe('rgb(22, 35, 63)');

  await page.goto('/#/workbook/5');
  await expect(page.locator('.wsbar__title')).toHaveText('דף עבודה מספר 5 מתוך 78');
  await expect(page.locator('.wsbar__nav .btn')).toHaveCount(2);
  // the way to the next page lives at the BOTTOM too — under the thumb
  await expect(page.locator('.pagenav .btn', { hasText: 'הבא' })).toBeVisible();
  await expect(page.locator('.pagenav .btn', { hasText: 'הקודם' })).toBeVisible();
});

/* The single-page view is what the reader spends their time in. Stacking a
   second toolbar above it cost 78px of screen and it stopped being comfortable
   to read — one bar above the sheet (the zaviyot wsbar), and the sheet full
   size. On a desktop the bar's buttons must not wrap it onto a second line. */
test('the page viewer keeps its controls to one row and the sheet readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the phone stacks the bar on purpose');
  await page.goto('/#/workbook/5');
  await page.waitForTimeout(2500);

  const bar = page.locator('.wsbar');
  await expect(bar).toHaveCount(1);
  await expect(page.locator('.printbar')).toHaveCount(0); // the old bar is gone for good

  /* The title takes a full-width line of its own by design (the zaviyot bar
     does the same on narrow screens); the BUTTONS must all share one row. */
  const buttonRows = async (): Promise<number> =>
    bar.evaluate(
      (b) => new Set([...b.querySelectorAll('.btn')].map((c) => Math.round(c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2))).size,
    );
  expect(await buttonRows(), 'the bar buttons wrapped onto more than one row').toBe(1);

  // the booklet bar carries more actions — B&W, the picker — and must still fit
  await page.goto('/#/print');
  await page.waitForTimeout(4000);
  expect(await buttonRows(), 'the booklet bar buttons wrapped').toBe(1);
  await page.goto('/#/workbook/5');
  await page.waitForTimeout(2500);

  // full size by default: a whole A4 on a laptop screen means 8px text
  const scale = await page.locator('.pageviewer__sheetwrap').evaluate(
    (w) => getComputedStyle(w).getPropertyValue('--sheet-scale').trim(),
  );
  expect(Number(scale)).toBe(1);
});

/* Shrinking the sheet must not shrink what is on it. fitSheet writes heights in
   unscaled pixels but reads them through the transform, so without dividing by
   the scale every drawing loses 40% on each pass. */
test('zooming the page out leaves the drawings the size they were', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no zoom control on a phone');
  await page.goto('/#/workbook/5');
  await page.waitForTimeout(2500);
  const sizes = async (): Promise<string[]> =>
    page.locator('.sheet .coordinate-grid').evaluateAll((gs) =>
      gs.map((g) => `${(g as HTMLElement).offsetWidth}x${(g as HTMLElement).offsetHeight}`),
    );

  const before = await sizes();
  await page.locator('.zoombtn--label').click();         // → fit to screen
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(1200);
  const after = await sizes();

  expect(after, 'the drawings shrank when the page was scaled').toEqual(before);
});

/* Measuring the CONTAINER is what let this through twice. An SVG scales its own
   type, so a drawing can be the right size on paper while the numbers inside it
   render at 8px next to 13px body text — which is what „הציורים לא ברורים”
   means. This measures the type as the reader sees it, not the box around it. */
test('every axis number renders at a size a learner can actually read', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const tiny = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet .coordinate-grid')]
      .map((g) => {
        const svg = g.querySelector('svg');
        if (!svg) return null;
        const box = svg.viewBox.baseVal;
        /* Letterboxed: a viewBox drawing takes the SMALLER of the two ratios and
           leaves the other axis as air. Measuring the width alone reports the
           size of the BOX, not of the drawing inside it — which is how 2.8px
           vertices passed a test that demanded 4px. */
        const r = svg.getBoundingClientRect();
        if (!box?.width || !box?.height || !r.width) return null;
        const shown = Math.min(r.width, (r.height * box.width) / box.height);
        const tick = [...svg.querySelectorAll('text')].find((t) => /^\d+$/.test(t.textContent!.trim()));
        if (!tick) return null;
        const px = Number(tick.getAttribute('font-size')) * (shown / box.width);
        const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return px < 11 ? `page ${n}: axis numbers at ${px.toFixed(1)}px` : null;
      })
      .filter(Boolean),
  );
  expect(tiny, tiny.join(', ')).toHaveLength(0);
});

/* Putting the type back to size can push a label out of the drawing or on top
   of its neighbour. Both are worse than small type, so both are measured. */
test('no label spills out of its drawing or lands on another', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const g of document.querySelectorAll('.sheet .coordinate-grid')) {
      const svg = g.querySelector('svg');
      if (!svg) continue;
      const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const r = svg.getBoundingClientRect();
      const texts = [...svg.querySelectorAll('text')];
      for (const t of texts) {
        const b = t.getBoundingClientRect();
        if (b.width && (b.left < r.left - 2 || b.right > r.right + 2 || b.top < r.top - 2 || b.bottom > r.bottom + 2)) {
          out.push(`page ${n}: „${t.textContent!.trim().slice(0, 10)}” spills out`);
        }
      }
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]!.getBoundingClientRect();
          const b = texts[j]!.getBoundingClientRect();
          if (a.width && b.width && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) {
            out.push(`page ${n}: „${texts[i]!.textContent!.trim()}” over „${texts[j]!.textContent!.trim()}”`);
          }
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* A vertex has to be visible. The marks scale with the drawing exactly as the
   type does, so a point on a half-size grid was a 5px dot — „הקודקודים לא
   רואים בכלל”. Yesterday's fix measured the letters and forgot the marks; this
   measures the marks. */
test('every point on a drawing is drawn large enough to see', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet .coordinate-grid')]
      .map((g) => {
        const svg = g.querySelector('svg');
        const c = svg?.querySelector('circle');
        if (!svg || !c) return null;
        const box = svg.viewBox.baseVal;
        /* Letterboxed: a viewBox drawing takes the SMALLER of the two ratios and
           leaves the other axis as air. Measuring the width alone reports the
           size of the BOX, not of the drawing inside it — which is how 2.8px
           vertices passed a test that demanded 4px. */
        const r = svg.getBoundingClientRect();
        if (!box?.width || !box?.height || !r.width) return null;
        const shown = Math.min(r.width, (r.height * box.width) / box.height);
        const px = Number(c.getAttribute('r')) * (shown / box.width);
        const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return px < 4 ? `page ${n}: vertices at ${px.toFixed(1)}px radius` : null;
      })
      .filter(Boolean),
  );
  expect(faults, faults.join(', ')).toHaveLength(0);
});

/* „הציור לא ברור” on page 71 was a label crammed inside the right-angle mark at
   the origin, and the guard above never saw it: it compared labels only with
   OTHER LABELS, so a letter sitting on a drawn mark, on an arrowhead or on a
   vertex was invisible to it. This sweeps every drawing in the booklet against
   everything actually drawn on it. */
test('no label sits on a mark, an arrowhead or a vertex', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    const over = (a: DOMRect, b: DOMRect, pad: number) =>
      a.width > 0 && b.width > 0 &&
      a.left < b.right - pad && b.left < a.right - pad &&
      a.top < b.bottom - pad && b.top < a.bottom - pad;

    for (const g of document.querySelectorAll('.sheet .coordinate-grid')) {
      const svg = g.querySelector('svg');
      if (!svg) continue;
      const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      // an arrowhead inside <defs> is never painted where its box claims to be
      /* `[data-icon]` is a pictogram that BELONGS to its point (the park map's
         bench, tree, gate…). It is decoration drawn beside its own label by
         design, so it is not a structural mark a label may not touch. */
      const drawn = (sel: string) =>
        [...svg.querySelectorAll<SVGElement>(sel)].filter(
          (e) => !e.closest('defs') && !e.closest('marker') && !e.closest('[data-icon]'));
      const paths = drawn('path');
      const marks = drawn('circle');

      for (const t of svg.querySelectorAll('text')) {
        const tb = t.getBoundingClientRect();
        const label = t.textContent!.trim().slice(0, 12);
        for (const p of paths) {
          if (!over(tb, p.getBoundingClientRect(), 2)) continue;
          out.push(`page ${n}: „${label}” sits on ${p.getAttribute('fill') === 'none' ? 'the right-angle mark' : 'an axis arrowhead'}`);
        }
        for (const c of marks) {
          // a label may sit on its OWN point by design — the maze centres „■” on
          // every wall — so only another point's mark is a fault
          if (c.getAttribute('data-pt') === t.getAttribute('data-pt')) continue;
          if (over(tb, c.getBoundingClientRect(), 2)) out.push(`page ${n}: „${label}” sits on a vertex`);
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* „צריך לכתוב משמאל לימין AB שווה תרגיל שווה תשובה”. The markup says dir="ltr",
   but what matters is where the parts actually land: the sheet around them is
   RTL, and one stray rule would flip the line back without changing the HTML.
   So this measures the painted positions — name leftmost, unit rightmost. */
test('every calculation really is painted left to right', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const d of document.querySelectorAll('.sheet .calc-ltr')) {
      const n = d.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const kids = [...d.children].filter((c) => c.getBoundingClientRect().width > 0);
      if (kids.length < 2) { out.push(`page ${n}: a calculation line did not lay out`); continue; }
      const first = kids[0]!.getBoundingClientRect().left;
      const last = kids[kids.length - 1]!.getBoundingClientRect().left;
      const text = (d as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
      if (first >= last) out.push(`page ${n}: „${text}” is painted right to left`);
    }
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});

/* יניב, 02.08.2026, על עמוד 14: „יש כאן בעיה בכתיבה מתמטית". „שיעור x = 4"
   יצא „4 = x", כי המספר נשאר מחוץ לתיבה הנעוצה ולכן קיבל את כיוון הפסקה.
   הבדיקה שלמעלה מודדת רק שורות `.calc-ltr`, ומתמטיקה בתוך משפט חמקה ממנה.
   כאן נמדד מה שנצבע בפועל: אחרי אי-שוויון או פעולה, האופרנד חייב לשבת
   מימין לה על המסך — אחרת המשוואה נקראת הפוך. */
test('inline maths reads left to right where it is painted', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    const R = (el: Element) => el.getBoundingClientRect();
    for (const span of document.querySelectorAll('.sheet .math-ltr')) {
      const txt = (span.textContent ?? '').trim();
      if (!/[=+−-]$/.test(txt)) continue;              // ends on an operator
      const next = span.nextSibling;
      if (!next || next.nodeType !== Node.TEXT_NODE) continue;
      const after = (next.textContent ?? '').trim();
      const m = after.match(/^[0-9(]+/);
      if (!m) continue;
      // measure where that operand actually landed
      const rng = document.createRange();
      const start = (next.textContent ?? '').indexOf(m[0]);
      rng.setStart(next, start); rng.setEnd(next, start + m[0].length);
      const ob = rng.getBoundingClientRect(); const sb = R(span);
      if (ob.width && ob.left < sb.right - 2) {
        const n = span.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        out.push(`page ${n}: „${txt} ${m[0]}” is painted „${m[0]} ${txt}”`);
      }
    }
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});

/* Yaniv, 31.07.2026: two final answers crushed onto one line rendered as
   „יחשטח", and the box was headed „דרך החישוב" instead of the textbook's
   תרגיל/תשובה. Each final answer must be PAINTED on a line of its own,
   below the working slot. */
test('each final answer sits on its own painted line', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    let seen = 0;
    for (const fin of document.querySelectorAll('.sheet .calc-final')) {
      const n = fin.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const rows = [...fin.querySelectorAll('.calc-final__row')].map((r) => r.getBoundingClientRect());
      seen += rows.length;
      /* יניב, 31.07.2026: „השטח שיופיע מתחת לשטח ולא מתחת להיקף" — שתי
         התשובות יושבות זו לצד זו, כל אחת מתחת לתיבה שלה. הכלל שנשמר כאן הוא
         שהן לעולם לא נדרסות זו על זו: או שורה מתחת לשורה, או עמודה לצד
         עמודה — אף פעם לא שתי תשובות מרוחות על אותו מקום. */
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1]!, b = rows[i]!;
        const overlaps =
          a.left < b.right - 2 && b.left < a.right - 2 &&
          a.top < b.bottom - 2 && b.top < a.bottom - 2;
        if (overlaps) out.push(`page ${n}: two final answers are painted over each other`);
      }
      /* וכל תשובה מיושרת עם תיבת החישוב שלה — לא מתחת לתיבה של הכמות האחרת. */
      const secs = [...(fin.closest('.calc-box')?.querySelectorAll('.calc-sec') ?? [])];
      if (secs.length === rows.length && rows.length === 2) {
        for (let i = 0; i < rows.length; i++) {
          const sb = secs[i]!.getBoundingClientRect();
          const centred = rows[i]!.left + rows[i]!.width / 2;
          if (centred < sb.left - 4 || centred > sb.right + 4) {
            out.push(`page ${n}: an answer is not under its own working box`);
          }
        }
      }
      const work = fin.closest('.calc-box')?.querySelector('.calc-work')?.getBoundingClientRect();
      if (work && rows.length && rows[0]!.top < work.bottom - 1) out.push(`page ${n}: the answer is not under the working slot`);
    }
    if (!seen) out.push('no final-answer rows were found at all');
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});

/* „הגרש לא נמצא במקום הנכון”. A geresh is a NEUTRAL character, so inside a
   dir="ltr" line it takes the line's direction and lands to the RIGHT of the
   Hebrew word it closes. Measured per character: a Hebrew run must march
   leftwards, every next character further left than the one before it. */
test('a Hebrew word never comes out in the wrong order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n: Node | null; (n = walk.nextNode()); ) {
      const s = n.textContent ?? '';
      if (!/[֐-׿]/.test(s) || !/['"]/.test(s)) continue;
      const host = (n as Text).parentElement;
      if (!host?.closest('.sheet')) continue;
      const at = (i: number) => { const r = document.createRange(); r.setStart(n!, i); r.setEnd(n!, i + 1); return r.getBoundingClientRect().x; };
      const run = [...s].map((c, i) => ({ c, i })).filter((o) => /[֐-׿'"]/.test(o.c));
      for (let k = 1; k < run.length; k++) {
        if (run[k]!.i !== run[k - 1]!.i + 1) continue;
        if (at(run[k]!.i) >= at(run[k - 1]!.i)) {
          const p = host.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
          out.push(`page ${p}: „${s.trim().slice(0, 24)}” comes out in the wrong order`);
          break;
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* An empty box on a drawing is where the learner writes. A number sitting inside
   it makes the task unanswerable — the „8” on page 1 was pushed sideways into
   the box for „ציר x” by the pass that keeps the axis NAME off the arrowhead. */
test('no number is left sitting inside a box the learner writes in', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const g of document.querySelectorAll('.sheet .coordinate-grid')) {
      const svg = g.querySelector('svg');
      if (!svg) continue;
      const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      /* An EMPTY box only — the blue-stroked one the learner writes in. A label
         box is grey-stroked and holds its own text, which belongs inside it. */
      const boxes = [...svg.querySelectorAll('rect')]
        .filter((r) => (r.getAttribute('stroke') ?? '').toLowerCase() === '#1d4ed8')
        .map((r) => r.getBoundingClientRect());
      for (const t of svg.querySelectorAll('text')) {
        const b = t.getBoundingClientRect();
        if (!b.width) continue;
        if (boxes.some((x) => b.left < x.right - 1 && x.left < b.right - 1 && b.top < x.bottom - 1 && x.top < b.bottom - 1)) {
          out.push(`page ${n}: „${t.textContent!.trim()}” sits inside an answer box`);
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* The cover is the approved artwork and nothing else. A footer that escaped its
   own sheet was painted across the second page once; this says out loud that
   nothing may be laid over the cover, on screen or on paper. */
test('the cover carries the artwork and nothing else', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media });
    const over = await page.evaluate(() => {
      const cover = document.querySelector('.cover-sheet');
      if (!cover) return ['there is no cover sheet'];
      const box = cover.getBoundingClientRect();
      // the artwork may be wrapped in <picture> so a lighter WebP can be offered
      const extra = [...cover.children]
        .filter((e) => !e.classList.contains('cover-image') && !e.classList.contains('cover-picture'))
        .map((e) => e.className);
      const loose = [...document.querySelectorAll('.book > *:not(.sheet)')]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.height && r.top < box.bottom && r.bottom > box.top; })
        .map((e) => `loose ${e.className} over the cover`);
      return [...extra, ...loose];
    });
    expect(over, `${media}: ${over.join(', ')}`).toHaveLength(0);
  }
  await page.emulateMedia({ media: 'screen' });
});

/* Two letter O on one corner — the grid's own origin plus a point the sheet
   marked at (0,0) — reads as a mistake in the drawing. */
test('the origin is never labelled twice', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const doubled = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet .coordinate-grid svg')]
      .map((svg) => {
        const os = [...svg.querySelectorAll('text')].filter((t) => t.textContent!.trim() === 'O');
        const n = svg.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return os.length > 1 ? `page ${n}` : null;
      })
      .filter(Boolean),
  );
  expect(doubled, doubled.join(', ')).toHaveLength(0);
});

/* עמוד 16 לימד: הפוסטר מילא את כל ה-A4 ודחף את השורה השנייה של הכותרת
   התחתונה אל מחוץ לגיליון. כלל ברזל — כותרת תחתית אחידה ושלמה בכל עמוד —
   נמדד עכשיו על כל 79 הגיליונות, מסך והדפסה. */
test('the canonical footer sits whole — and in the SAME place — on every sheet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media });
    const faults = await page.evaluate(() => {
      const out: string[] = [];
      const geo: Array<{ n: string; up: number; left: number; right: number }> = [];
      for (const sheet of document.querySelectorAll('.book > .sheet')) {
        const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
        const f = sheet.querySelector('.gz-footer');
        if (!f) { if (!sheet.classList.contains('cover-sheet')) out.push(`page ${n}: no footer`); continue; }
        const fr = f.getBoundingClientRect();
        const sr = sheet.getBoundingClientRect();
        if (!fr.height) { out.push(`page ${n}: footer collapsed`); continue; }
        if (fr.bottom > sr.bottom + 1) out.push(`page ${n}: footer clipped`);
        geo.push({ n, up: sr.bottom - fr.bottom, left: fr.left - sr.left, right: sr.right - fr.right });
      }
      /* אחידות של 100% — „כמו ספר לימוד": אותו מרחק מהתחתית ואותם שוליים
         בכל עמוד, פוסטרים ושעשועונים בכלל זה. נמדד מול העמוד הראשון. */
      const base = geo[0];
      if (base) {
        for (const g of geo) {
          if (Math.abs(g.up - base.up) > 2) out.push(`page ${g.n}: footer height differs (${Math.round(g.up)} vs ${Math.round(base.up)})`);
          if (Math.abs(g.left - base.left) > 2 || Math.abs(g.right - base.right) > 2) out.push(`page ${g.n}: footer insets differ`);
        }
      }
      return [...new Set(out)];
    });
    expect(faults, `${media}: ${faults.join(' | ')}`).toEqual([]);
  }
  await page.emulateMedia({ media: 'screen' });
});

/* עמודים 13, 21 ו-45 הראו את אותה תקלה: שרטוט שגדל מעבר לכרטיס שלו ונמרח על
   השכן — „עמוד על עמוד". הבדיקה הזו עוברת על כל 77 העמודים: שרטוט לעולם לא
   רחב מהכרטיס שהוא יושב בו, ושני שרטוטים לעולם לא נוגעים זה בזה. */
test('no drawing escapes its card and no two drawings overlap', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const sheet of document.querySelectorAll('.book > .sheet')) {
      const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
      const grids = [...sheet.querySelectorAll<HTMLElement>('.coordinate-grid')];
      for (const g of grids) {
        const r = g.getBoundingClientRect();
        const host = g.parentElement!.getBoundingClientRect();
        if (r.width > host.width + 2 || r.left < host.left - 2 || r.right > host.right + 2) {
          out.push(`page ${n}: drawing ${Math.round(r.width)}px wide in a ${Math.round(host.width)}px card`);
        }
      }
      for (let i = 0; i < grids.length; i++) {
        for (let j = i + 1; j < grids.length; j++) {
          const a = grids[i]!.getBoundingClientRect();
          const b = grids[j]!.getBoundingClientRect();
          const overlap = a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
          if (overlap) out.push(`page ${n}: two drawings painted over each other`);
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

/* כלל הברזל של ניצול העמוד, סוף-סוף נאכף: עמוד 69 נשאר עם פס לבן ענק למרות
   כל מנגנוני הריווח, כי אף בדיקה לא מדדה. עכשיו נמדדת השארית שבין תחתית
   התוכן לכותרת התחתונה על כל גיליון — יותר מ-120px היא עמוד שלא נוצל. */
test('no sheet leaves a band of white above its footer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const bands = await page.evaluate(() =>
    [...document.querySelectorAll('.book > .sheet')].flatMap((sheet) => {
      if (sheet.classList.contains('cover-sheet') || sheet.classList.contains('poster-sheet')) return [];
      const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
      const f = sheet.querySelector('.gz-footer');
      const content = sheet.querySelector('.sheet-content');
      if (!f || !content) return [];
      let lowest = 0;
      for (const el of content.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.height && r.bottom > lowest) lowest = r.bottom;
      }
      const gap = f.getBoundingClientRect().top - lowest;
      return gap > 120 ? [`page ${n}: ${Math.round(gap)}px of unused page`] : [];
    }),
  );
  expect(bands, bands.join(' | ')).toEqual([]);
});

/* „תצוגת הנייד — שהכל יתאים אם פותחים בטלפון או במחשב בהתאמה אוטומטית”
   (02.08.2026). הגיליון נפרס פעם מחדש לרוחב הטלפון, ואז יחס העמוד קפץ
   מ-1:1.414 ל-1:4.4: הטורים נערמו, הציורים התכווצו והכותרת התחתונה עלתה
   לאמצע הדף. החוברת היא מוצר מודפס — בטלפון רואים את אותו עמוד A4, מוקטן.
   הבדיקה רצה גם ב-desktop וגם ב-mobile, ולכן היא נופלת ברגע שמישהו יחזיר
   פריסה-מחדש כלשהי. */
test('every sheet keeps its A4 shape on a phone exactly as on a desktop', async ({ page }) => {
  for (const route of ['/#/print', '/#/workbook/18']) {
    await page.goto(route);
    await page.locator('.sheet').first().waitFor();
    await page.waitForTimeout(600);
    const off = await page.evaluate(() => {
      const bad: string[] = [];
      document.querySelectorAll('.sheet').forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.width < 50) return;
        const ratio = r.height / r.width;
        if (Math.abs(ratio - 1.414) > 0.03) bad.push(`sheet ${i}: ${ratio.toFixed(2)} instead of 1.41`);
      });
      return bad;
    });
    expect(off.slice(0, 5), `${route}: ${off.length} sheets lost their A4 shape — ${off.slice(0, 5).join(' | ')}`).toEqual([]);
    // ובלי גלילה אופקית: הגיליון מוקטן, לא נדחף אל מחוץ למסך.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${route} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1);
  }
});

/* `.spread` מותחת שורת הוראה על כל רוחב הכרטיס (‎text-align-last: justify‎).
   על שורה שממילא כמעט מלאה זו התאמה עדינה — אבל על שורה שממלאת רק שליש
   מהרוחב המתיחה יוצרת פערי ענק בין המילים, וזה נראה גרוע יותר מהחלל
   שבאנו לתקן. הבדיקה מודדת כמה השורה האחרונה מלאה **לפני** המתיחה. */
test('a spread instruction line was nearly full before it was stretched', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2500);
  const thin = await page.evaluate(() => {
    const bad: string[] = [];
    document.querySelectorAll<HTMLElement>('.sheet .spread').forEach((el) => {
      /* בטלפון הגיליון מוקטן ב-transform, ולכן ‎getBoundingClientRect‎ מחזיר
         מידות מוקטנות בעוד הפריסה עצמה נשארת בגודל A4 מלא. המדידה נעשית
         ב-‎offsetWidth‎ (מרחב הפריסה), והמלבנים מנורמלים חזרה לפיו. */
      const w = el.offsetWidth;
      const scale = w ? el.getBoundingClientRect().width / w : 1;
      if (!w || !scale) return;
      const copy = el.cloneNode(true) as HTMLElement;
      copy.style.cssText = `position:absolute;left:-9999px;top:0;width:${w}px;text-align:start;text-align-last:auto`;
      el.parentElement!.appendChild(copy);
      const range = document.createRange();
      range.selectNodeContents(copy);
      const lines = new Map<number, { l: number; r: number }>();
      for (const r of range.getClientRects()) {
        if (r.width < 0.5) continue;
        const key = Math.round(r.top / 2);
        const line = lines.get(key) ?? { l: Infinity, r: -Infinity };
        lines.set(key, { l: Math.min(line.l, r.left), r: Math.max(line.r, r.right) });
      }
      const keys = [...lines.keys()].sort((a, b) => a - b);
      const lastKey = keys[keys.length - 1];
      const last = lastKey === undefined ? undefined : lines.get(lastKey);
      copy.remove();
      if (!last) return;
      const fill = Math.round((((last.r - last.l) / scale) / w) * 100);
      const n = el.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      if (fill < 45) bad.push(`page ${n}: last line fills ${fill}% — „${el.textContent!.trim().slice(0, 40)}”`);
    });
    return bad;
  });
  expect(thin, thin.join(' | ')).toEqual([]);
});

/* „הקו של הכותרת התחתונה צריך להיות כחול כמו הכותרות הראשיות של האתר"
   (02.08.2026). הקו היה `var(--ink)` — כחול־דיו כהה שנקרא כמעט שחור ליד
   הכחול של קו הכותרת, ושני הקווים על אותו עמוד לא דיברו באותו צבע. */
test('the footer rule is the same blue as the heading rule, on every sheet', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2500);
  const off = await page.evaluate(() => {
    const bad: string[] = [];
    document.querySelectorAll('.sheet').forEach((s, i) => {
      const foot = s.querySelector('.gz-footer');
      const head = s.querySelector('.sheet-header');
      if (!foot || !head) return;
      /* התוכן ומספר העמוד מודפסים על נייר שמנת עם מבטאי זהב — קו כחול שם
         היה זר לעיצוב שיניב אישר, ולכן הוא נמדד מול הכותרת שלו עצמו. */
      if (s.classList.contains('toc-sheet')) return;
      const f = getComputedStyle(foot).borderTopColor;
      const h = getComputedStyle(head).borderBottomColor;
      if (f !== h) bad.push(`sheet ${i}: footer ${f} vs heading ${h}`);
    });
    return bad;
  });
  expect(off.slice(0, 4), off.join(' | ')).toEqual([]);
});

/* Every poster ships twice — a .png and a .webp twin — and `posterSheet()`
   derives the webp path at runtime, so a browser that speaks webp (all of
   them) shows the TWIN, never the png. On 02.08.2026 that cost Yaniv a wrong
   page: the poster's dot at (7,7) was repaired in the png, the webp was left
   at its old build, and page 21 kept printing the dot half a square off — a
   fix reported as done that no reader could see. Timestamps do not survive
   git, so the twins are compared as pictures. */
test('every poster and its webp twin show the same picture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one decode of every poster is enough');
  const { readdirSync } = await import('node:fs');
  const posters = readdirSync('public/assets/games')
    .filter((f) => f.endsWith('.png'))
    .map((f) => `/assets/games/${f}`);
  expect(posters.length, 'no posters found to compare').toBeGreaterThan(0);
  await page.goto('/#/');
  const drifted = await page.evaluate(async (paths: string[]) => {
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((ok, no) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => no(new Error(`cannot load ${src}`));
        img.src = src;
      });
    const pixels = async (src: string, w: number, h: number): Promise<Uint8ClampedArray> => {
      const img = await load(src);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      return c.getContext('2d')!.getImageData(0, 0, w, h).data;
    };
    const bad: string[] = [];
    const BLOCK = 32;
    for (const png of paths) {
      const twin = png.replace(/\.png$/, '.webp');
      const img = await load(png);
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const [a, b] = [await pixels(png, W, H), await pixels(twin, W, H)];
      /* Measured over the WHOLE picture this defect is invisible: one moved
         dot reads 1.62 against 1.53 for a clean re-encode, because webp's own
         noise is spread everywhere and the dot is 200 pixels out of 1.5
         million. Per 32px block it is unmissable — a stale twin peaks at 50
         where every in-sync poster stays under 15. */
      let worst = 0;
      for (let by = 0; by + BLOCK <= H; by += BLOCK) {
        for (let bx = 0; bx + BLOCK <= W; bx += BLOCK) {
          let sum = 0;
          for (let y = by; y < by + BLOCK; y++) {
            for (let x = bx; x < bx + BLOCK; x++) {
              const i = (y * W + x) * 4;
              sum += Math.abs(a[i]! - b[i]!) + Math.abs(a[i + 1]! - b[i + 1]!) + Math.abs(a[i + 2]! - b[i + 2]!);
            }
          }
          const mean = sum / (BLOCK * BLOCK * 3);
          if (mean > worst) worst = mean;
        }
      }
      if (worst > 25) bad.push(`${png}: twin drifted — worst 32px block differs by ${worst.toFixed(0)}/255`);
    }
    return bad;
  }, posters);
  expect(drifted, drifted.join(' | ')).toEqual([]);
});

/* A missing </div> once nested error-case 9 inside error-case 8's box on the
   error-correction pages (02.08.2026): the grid showed 8 cards with the ninth
   stuffed inside the eighth. Every .mist-card is a direct child of its
   .error-grid — none is ever nested inside another. */
test('no error-correction card is nested inside another', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2000);
  const nested = await page.evaluate(() =>
    document.querySelectorAll('.mist-card .mist-card').length,
  );
  expect(nested, `${nested} error card(s) render nested inside another card`).toBe(0);
});
