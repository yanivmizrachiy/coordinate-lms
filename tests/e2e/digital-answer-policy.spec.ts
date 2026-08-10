import { expect, test } from '@playwright/test';

test('shows immediate wrong/correct marks and accepts איקס for x', async ({ page }) => {
  await page.goto('/#/workbook/1');

  const target = page.locator('[data-lms-qid="p1-q1"]');
  await expect(target).toBeVisible();

  await target.fill('y');
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'wrong');
  const wrongMark = await target.evaluate((element) =>
    getComputedStyle(element, '::after').content,
  );
  expect(wrongMark).toContain('✕');

  await target.fill('איקס');
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  const correctMark = await target.evaluate((element) =>
    getComputedStyle(element, '::after').content,
  );
  expect(correctMark).toContain('✓');
});

test('open response is omitted only on screen and restored for print', async ({ page }) => {
  await page.goto('/#/workbook/7');

  const openTarget = page.locator('[data-lms-qid="p7-q12"]');
  await expect(openTarget).toBeAttached();
  await expect(openTarget).toBeHidden();

  await page.emulateMedia({ media: 'print' });
  await expect(openTarget).toBeVisible();
});
