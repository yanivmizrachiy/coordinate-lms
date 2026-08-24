import { test, expect } from '@playwright/test';

test('materials landing lives at /#/home with its complete material structure', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/home');
  await expect(page.locator('.ls-topbar__lead')).toContainText('מנח"י');
  await expect(page.locator('.ls-topbar__year')).toContainText('תשפ"ז');
  await expect(page.locator('.ls-topbar__logo')).toBeVisible();
  await expect(page.locator('.ls-nav')).toBeVisible();
  await expect(page.locator('.ls-hero__title')).toHaveText('מערכת צירים ברביע הראשון');
  await expect(page.locator('.ls-hero__desc')).toHaveCount(0);
  await expect(page.locator('.ls-hero .ls-viewer video')).toHaveCount(1);
  await expect(page.locator('.ls-nav__link', { hasText: 'סרט הפתיחה' })).toHaveCount(0);
  await expect(page.locator('.ls-nav__link', { hasText: 'סרטון עדכון ת"ל' })).toHaveCount(1);
  await expect(page.locator('.ls-hero__filmcap')).toHaveCount(0);
  const spin = await page.locator('.ls-topbar__logo').evaluate((el) => getComputedStyle(el).animationName);
  expect(spin).toBe('ls-badge-turn');
  for (const id of ['video', 'opening', 'booklet']) {
    await expect(page.locator(`section#${id}`), `section #${id} is missing`).toHaveCount(1);
  }
  await expect(page.locator('.ls-footer')).toBeVisible();
  const barShown = await page.locator('.appbar').evaluate((el) => getComputedStyle(el).display);
  expect(barShown, 'the app bar sits on top of the materials landing').toBe('none');
});

test('the curriculum film loads its privacy player only after a press', async ({ page }) => {
  await page.goto('/#/home');
  await expect(page.locator('#video .ls-section__title')).toHaveText('מערכת צירים ברביע הראשון — איילת קריספין');
  await expect(page.locator('#video .ls-section__sub')).toHaveText('עדכון ת"ל — כיתה ז\' תשפ"ז');
  await expect(page.locator('#video iframe')).toHaveCount(0);
  await expect(page.locator('.ls-facade')).toBeVisible();
  await page.locator('.ls-facade').click();
  const frame = page.locator('#video iframe');
  await expect(frame).toHaveCount(1);
  const src = await frame.getAttribute('src');
  expect(src).toContain('youtube-nocookie.com/embed/h5wegXI2ZGw');
  expect(src).toContain('autoplay=1');
  expect(src).toContain('cc_load_policy=1');
});

test('the opening film runs once and leaves its still image', async ({ page }) => {
  await page.goto('/#/home');
  const film = page.locator('#opening video');
  await expect(film).toHaveCount(1);
  const shape = await film.evaluate((el) => {
    const v = el as HTMLVideoElement;
    return { loops: v.loop, inline: v.playsInline, autoplay: v.autoplay, poster: v.getAttribute('poster') ?? '' };
  });
  expect(shape.autoplay).toBe(true);
  expect(shape.loops).toBe(false);
  expect(shape.inline).toBe(true);
  expect(shape.poster).not.toBe('');
  await expect(page.locator('.ls-filmbtn')).toHaveCount(0);
  await film.evaluate((el) => (el as HTMLVideoElement).dispatchEvent(new Event('ended')));
  await expect(page.locator('#opening video')).toHaveCount(0);
  await expect(page.locator('#opening .ls-hero__film img')).toHaveCount(1);
});

test('the booklet frame and hero CTA open the booklet from /#/home', async ({ page }) => {
  await page.goto('/#/home');
  await expect(page.locator('.ls-pdfframe__bar')).toContainText('חוברת עבודה');
  const start = page.locator('.ls-pdfframe__start');
  await expect(start).toHaveText('התחל');
  const [startBox, coverBox] = await Promise.all([start.boundingBox(), page.locator('.ls-pdfframe__page').boundingBox()]);
  expect(startBox!.y).toBeGreaterThan(coverBox!.y + coverBox!.height - 4);
  await page.locator('.ls-pdfframe__page').click();
  await expect(page).toHaveURL(/#\/book$/);
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'false');
  await expect(page.locator('.lx-half--left .cover-sheet')).toHaveCount(1);

  await page.goto('/#/home');
  await page.locator('.ls-btn--primary', { hasText: 'פתיחת החוברת' }).click();
  await expect(page).toHaveURL(/#\/book$/);
});

test('booklet start ignores a stale remembered position and opens contents', async ({ page }) => {
  await page.goto('/#/home');
  await page.evaluate(() => window.localStorage.setItem('quadrant:lxbook:pos', '40'));
  await page.locator('.ls-pdfframe__start').click();
  await expect(page).toHaveURL(/#\/book$/);
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.lx-half .toc-sheet')).toHaveCount(1);
  const leftover = await page.evaluate(() => window.localStorage.getItem('quadrant:lxbook:pos'));
  expect(leftover).toBeNull();
});

test('the flipbook opens from cover to contents and keeps its print utilities', async ({ page }) => {
  await page.goto('/#/book');
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'false');
  await expect(page.locator('.lx-entry__btn')).toHaveText('התחל');
  await page.locator('.lx-entry__btn').click();
  await expect(page.locator('.lxbook')).toHaveAttribute('data-open', 'true', { timeout: 4000 });
  const which = await page.evaluate(() => ({
    right: !!document.querySelector('.lx-half--right .toc-sheet'),
    left: document.querySelector('.lx-half--left .sheet-number')?.textContent?.trim() ?? '',
    view: document.querySelector('.lxbook')?.getAttribute('data-view'),
  }));
  if (which.view === 'double') {
    expect(which.right).toBe(true);
    expect(which.left).toBe('1');
  } else {
    await expect(page.locator('.lx-half--left .toc-sheet')).toHaveCount(1);
  }
  await expect(page.locator('.lx-toolbar')).toBeVisible();
  const acts = page.locator('.lx-topbar__acts');
  await expect(acts.locator('a', { hasText: 'חזרה לאתר' })).toHaveAttribute('href', '#/');
  await expect(acts.locator('a', { hasText: 'מצב קריאה נגיש' })).toHaveAttribute('href', /#\/workbook\/\d+/);
  await expect(acts.locator('button', { hasText: 'הורדת החוברת' })).toBeVisible();
  await expect(acts.locator('button', { hasText: 'הדפסה' })).toBeVisible();
  await expect(acts.locator('button', { hasText: 'דפים נבחרים' })).toHaveCount(0);
});

test('the materials landing never reaches the printer and keeps the district badge', async ({ page }) => {
  await page.goto('/#/home');
  await expect(page.locator('.ls-topbar__logo')).toBeVisible();
  await expect(page.locator('.ls-footer__logo')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  const shown = await page.locator('.landing').evaluate((el) => getComputedStyle(el).display);
  expect(shown).toBe('none');
  await page.emulateMedia({ media: 'screen' });

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

test('print utilities stay on print surfaces and out of student practice', async ({ page }) => {
  await page.goto('/#/print');
  const printBar = page.locator('.wsbar');
  await expect(printBar).toBeVisible();
  await expect(printBar.locator('.btn', { hasText: 'הורדה' })).toHaveCount(1);
  await expect(printBar.locator('.btn--gold', { hasText: 'הדפסה' })).toHaveCount(1);
  await expect(printBar.locator('.btn', { hasText: 'שחור' })).toHaveCount(0);
  await expect(printBar.locator('.btn', { hasText: 'דפים נבחרים' })).toHaveCount(0);

  await page.goto('/#/workbook/5');
  await expect(page.locator('.wsbar')).toHaveCount(0);
  await expect(page.locator('.printbar')).toHaveCount(0);
  const nav = page.locator('.pagenav--practice');
  await expect(nav).toBeVisible();
  await expect(nav.locator('.btn--prev')).toBeVisible();
  await expect(nav.locator('.btn--next')).toBeVisible();
  await expect(page.getByText('הדפסה', { exact: true })).toHaveCount(0);
  await expect(page.getByText('הורדה', { exact: true })).toHaveCount(0);
});

test('practice navigation stays one calm row and zoom works from the overflow tools', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'row geometry is a desktop contract');
  await page.goto('/#/workbook/5');
  await page.waitForTimeout(1000);
  const nav = page.locator('.pagenav--practice');
  await expect(nav).toHaveCount(1);
  const rows = await nav.evaluate((el) => new Set([...el.children].map((child) => {
    const r = child.getBoundingClientRect();
    return Math.round(r.top + r.height / 2);
  })).size);
  expect(rows, 'practice navigation wrapped onto more than one row').toBe(1);
  const scale = await page.locator('.pageviewer__sheetwrap').evaluate((w) => Number(getComputedStyle(w).getPropertyValue('--sheet-scale')));
  expect(scale).toBeGreaterThan(0);
  expect(scale).toBeLessThanOrEqual(1);

  const sizes = async (): Promise<string[]> => page.locator('.sheet .coordinate-grid').evaluateAll((gs) =>
    gs.map((g) => `${(g as HTMLElement).offsetWidth}x${(g as HTMLElement).offsetHeight}`),
  );
  const before = await sizes();
  await page.locator('.practice-tools__trigger').click();
  await expect(page.locator('.zoombtn--label')).toBeVisible();
  await page.locator('.zoombtn--label').click();
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(800);
  const after = await sizes();
  expect(after, 'drawings changed layout size when page zoom changed').toEqual(before);
});
