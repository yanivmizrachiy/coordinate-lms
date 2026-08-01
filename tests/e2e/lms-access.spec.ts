import { expect, test } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

test('page one is open to a guest', async ({ page }) => {
  await page.goto('/#/workbook/1');

  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-panel')).toBeVisible();
  await expect(page.locator('.lms-panel__identity'))
    .toContainText('מצב אורח');
});

test('page two requires registration for a guest', async ({ page }) => {
  await page.goto('/#/workbook/2');

  await expect(page.locator('.sheet')).toHaveCount(0);
  await expect(page.locator('.lms-gate')).toBeVisible();
  await expect(page.locator('.lms-gate'))
    .toContainText('כדי להמשיך לעמוד 2 יש להירשם');
});
