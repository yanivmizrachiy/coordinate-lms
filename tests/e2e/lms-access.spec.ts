import { expect, test } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

async function expectAnonymousPractice(pageNumber: number, page: import('@playwright/test').Page): Promise<void> {
  await page.goto(`/#/workbook/${pageNumber}`);

  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-panel')).toBeVisible();
  await expect(page.locator('.lms-panel__identity'))
    .toContainText('תרגול ללא הרשמה — אין שמירה או מעקב');
  await expect(page.locator('.lms-gate')).toHaveCount(0);
}

test('anonymous practice is open on the first and final canonical pages', async ({ page }) => {
  await expectAnonymousPractice(1, page);
  await expectAnonymousPractice(78, page);
});

test('anonymous answers are checked on screen but never persisted', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const target = page.locator('[data-lms-qid="p1-q1"]');
  await target.fill('x');
  await page.getByRole('button', { name: 'בדיקת כל התשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  const persisted = await page.evaluate(() => ({
    drafts: localStorage.getItem('coordinate_lms_drafts_v2'),
    results: localStorage.getItem('coordinate_lms_results_v2'),
    activity: localStorage.getItem('coordinate_lms_activity_v2'),
  }));

  expect(persisted.drafts === null || persisted.drafts === '{}').toBe(true);
  expect(persisted.results === null || persisted.results === '{}').toBe(true);
  expect(persisted.activity === null || persisted.activity === '[]').toBe(true);
});
