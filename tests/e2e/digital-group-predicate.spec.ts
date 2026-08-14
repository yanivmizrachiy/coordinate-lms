import { expect, test } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

test('learner-chosen point pairs are graded by the mathematical condition', async ({ page }) => {
  await page.goto('/#/workbook/12');

  const x1 = page.locator('[data-lms-qid="p12-q7"]');
  const y1 = page.locator('[data-lms-qid="p12-q8"]');
  const x2 = page.locator('[data-lms-qid="p12-q9"]');
  const y2 = page.locator('[data-lms-qid="p12-q10"]');

  await x1.fill('1');
  await y1.fill('2');
  await x2.fill('1');
  await y2.fill('5');
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();

  const proxy = page.locator('.lms-group-proxy[data-lms-group="distinct-coordinate-pairs"]');
  await expect(proxy).toHaveAttribute('data-lms-state', 'wrong');
  await expect(x1).toHaveAttribute('data-lms-group-state', 'wrong');

  // The learner is free to choose another valid point; there is no model pair.
  await x2.fill('4');

  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(x1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(x2).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y2).toHaveAttribute('data-lms-group-state', 'correct');
});
