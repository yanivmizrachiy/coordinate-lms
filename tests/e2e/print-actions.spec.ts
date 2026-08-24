import { test, expect } from '@playwright/test';

test('no numbered page hosts a widget — the booklet is answerable in pencil', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const s of document.querySelectorAll('.sheet')) {
      const n = s.querySelector('.sheet-number')?.textContent?.trim() ?? '';
      if (!n) continue;
      if (s.querySelector('[data-game-host]')) out.push(`page ${n}: hosts an interactive game`);
      for (const el of s.querySelectorAll('button, select, textarea, input')) {
        const type = (el as HTMLInputElement).type;
        if (el.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) continue;
        out.push(`page ${n}: has a <${el.tagName.toLowerCase()}> a pencil cannot answer`);
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

test('one chooser asks all-or-selected and colour-or-BW, for print and for download', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(2500);
  await page.evaluate(() => { window.print = (): void => {}; });
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(false);

  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  const choice = page.locator('.pick__modal--choice');
  await expect(choice).toBeVisible();
  await expect(choice.locator('.pick__chip', { hasText: 'כל החוברת' })).toBeVisible();
  await expect(choice.locator('.pick__chip', { hasText: 'דפים נבחרים' })).toBeVisible();
  await expect(choice.locator('.pick__chip', { hasText: 'בצבע' })).toBeVisible();
  await choice.locator('.pick__chip', { hasText: 'שחור־לבן' }).click();
  await choice.locator('.btn--gold').click();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.evaluate(() => document.body.classList.contains('bw-print'))).toBe(false);

  await page.locator('.wsbar .btn', { hasText: 'הורדה' }).click();
  await expect(page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' })).toBeVisible();
});

test('the page picker prints only the pages chosen', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(3000);
  await page.evaluate(() => { window.print = (): void => {}; });
  await page.locator('.wsbar .btn--gold', { hasText: 'הדפסה' }).click();
  await page.locator('.pick__modal--choice .pick__chip', { hasText: 'דפים נבחרים' }).click();
  await page.locator('.pick__modal--choice .btn--gold').click();
  await expect(page.locator('.pick__grid')).toBeVisible();
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
  await page.locator('.pick__chip', { hasText: 'מושגים בסיסיים' }).click();
  await expect(page.locator('.pick__count')).toHaveText('נבחרו 3 עמודים');
  await page.locator('.pick__chip', { hasText: 'כל החוברת' }).click();
  await expect(page.locator('.pick__count')).toHaveText('נבחרו 78 עמודים');
  await page.locator('.pick__chip', { hasText: 'ניקוי הבחירה' }).click();
  await expect(page.locator('.pick__count')).toHaveText('לא נבחרו עמודים');
});
