import { expect, test } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

/* Every page is open to a guest (Yaniv, 2026-08-18): a guest solves, gets
   feedback and a page score exactly like a registered student — only the save
   differs (device-only, never central, never in the dashboard). */

test('page one is open to a guest', async ({ page }) => {
  await page.goto('/#/workbook/1');

  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-panel')).toBeVisible();
  await expect(page.locator('.lms-panel__identity')).toContainText('מצב אורח');
});

test('a later page is also open to a guest — no registration wall', async ({ page }) => {
  await page.goto('/#/workbook/2');

  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-gate')).toHaveCount(0);
  await expect(page.locator('.lms-panel')).toBeVisible();
  await expect(page.locator('.lms-panel__identity')).toContainText('מצב אורח');

  // and the guest identity says the progress is kept on the device only
  await expect(page.locator('.lms-panel__identity'))
    .toContainText('נשמרת במכשיר בלבד');
});

test('a deep page is open to a guest too', async ({ page }) => {
  await page.goto('/#/workbook/40');
  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-gate')).toHaveCount(0);
});
