import { expect, test } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

/* Every worksheet is open to a guest. Registration/account explanations belong
   on the opening screen only, never inside the focused practice flow. */

async function expectFocusedGuestPractice(page: import('@playwright/test').Page): Promise<void> {
  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.lms-panel')).toBeVisible();
  await expect(page.locator('.lms-gate')).toHaveCount(0);
  await expect(page.locator('.lms-panel__identity')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /הרשמה|התחברות|החשבון שלי/ })).toHaveCount(0);
  await expect(page.getByText(/מצב אורח|נשמרת במכשיר בלבד/)).toHaveCount(0);
  /* Teacher controls belong to the admin session only. A learner (or guest)
     must never meet the dashboard or answer-key tools inside practice. */
  await expect(page.getByRole('button', { name: /דשבורד מורה|כמפתח מורה/ })).toHaveCount(0);
}

test('page one is open to a guest without account chatter', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await expectFocusedGuestPractice(page);
});

test('a later page is also open to a guest — no registration wall', async ({ page }) => {
  await page.goto('/#/workbook/2');
  await expectFocusedGuestPractice(page);
});

test('a deep page is open to a guest too', async ({ page }) => {
  await page.goto('/#/workbook/40');
  await expectFocusedGuestPractice(page);
});