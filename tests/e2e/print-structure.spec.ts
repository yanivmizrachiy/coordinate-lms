import { test, expect } from '@playwright/test';

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

test('the deleted chapter-list page cannot come back', async ({ page }) => {
  for (const dead of ['#/workbook', '#/games']) {
    await page.goto('/' + dead);
    await page.waitForTimeout(1200);
    await expect(page.locator('.toc-sheet'), `${dead} does not reach the booklet`).toHaveCount(1);
    await expect(page.locator('.lxbook')).toHaveCount(1);
  }
});

test('no horizontal overflow on any core view', async ({ page }) => {
  for (const hash of ['#/', '#/home', '#/menu', '#/workbook', '#/workbook/1', '#/workbook/12', '#/book']) {
    await page.goto('/' + hash);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth - window.innerWidth);
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

test('the contents sheet lists every chapter and each button reaches its page', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(4000);
  const buttons = page.locator('.toc-sheet .toc-btn');
  const topics = await page.evaluate(() => document.querySelectorAll('.toc-sheet .toc-btn').length);
  expect(topics, 'the contents sheet does not list the six chapters').toBe(6);

  const colours = await buttons.evaluateAll((els) => els.map((e) => getComputedStyle(e.querySelector('.toc-btn__no')!).color));
  expect(new Set(colours).size, 'the chapters are not colour-coded').toBe(5);
  const doubled = await buttons.evaluateAll((els) => els.filter((e) => ((e.textContent ?? '').match(/\d+/g) ?? []).length !== 1).length);
  expect(doubled, 'a row carries more than one number').toBe(0);

  const starts = await buttons.evaluateAll((els) => els.map((e) => Number((e.getAttribute('aria-label') ?? '').match(/בעמוד (\d+)/)?.[1] ?? 0)));
  expect(starts, 'the contents point at the wrong pages').toEqual([1, 4, 15, 46, 51, 65]);
  const ranged = await buttons.evaluateAll((els) => els.filter((e) => /[–-]/.test(e.textContent ?? '')).length);
  expect(ranged, 'a chip still shows a page range instead of the starting page').toBe(0);

  const wrongWayRound = await buttons.evaluateAll((els) => els.filter((e) => {
    const name = e.querySelector('.toc-btn__name')?.getBoundingClientRect();
    const leader = e.querySelector('.toc-btn__leader')?.getBoundingClientRect();
    const no = e.querySelector('.toc-btn__no')?.getBoundingClientRect();
    return !name || !leader || !no || name.left <= no.right || leader.width < 20 || leader.left < no.right - 2 || leader.right > name.left + 2;
  }).length);
  expect(wrongWayRound, 'the row does not read name, dotted leader, page number').toBe(0);

  const small = await buttons.evaluateAll((els) => els.filter((e) =>
    parseFloat(getComputedStyle(e.querySelector('.toc-btn__no')!).fontSize) < 32 ||
    parseFloat(getComputedStyle(e.querySelector('.toc-btn__name')!).fontSize) < 20,
  ).length);
  expect(small, 'a page number or chapter name shrank back to body size').toBe(0);

  const faint = await buttons.evaluateAll((els) => els.map((e) => {
    const no = e.querySelector('.toc-btn__no');
    if (!no) return null;
    const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]!) + 0.7152 * lin(rgb[1]!) + 0.0722 * lin(rgb[2]!);
    const ink = lum(getComputedStyle(no).color.match(/\d+/g)!.map(Number));
    const sheet = lum(getComputedStyle(e.closest('.toc-sheet')!).backgroundColor.match(/\d+/g)!.map(Number));
    const ratio = (Math.max(ink, sheet) + 0.05) / (Math.min(ink, sheet) + 0.05);
    return ratio < 4.5 ? `${no.textContent} at ${ratio.toFixed(1)}:1` : null;
  }).filter(Boolean));
  expect(faint, `a page number is too faint to read: ${faint.join(', ')}`).toEqual([]);

  for (const [i, n] of [1, 4, 15, 46, 51, 65].entries()) {
    await page.goto('/#/print');
    await page.waitForTimeout(3500);
    await page.locator('.toc-btn').nth(i).click();
    await expect(page, `chip ${i + 1} does not open page ${n}`).toHaveURL(new RegExp(`#/workbook/${n}$`));
  }
});
