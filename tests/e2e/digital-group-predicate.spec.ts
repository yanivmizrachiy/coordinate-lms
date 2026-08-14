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

  const proxy = page.locator('.lms-group-proxy[data-lms-group^="distinct-coordinate-pairs-"]');
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

test('axis and relative-position tasks accept any point satisfying the prompt', async ({ page }) => {
  await page.goto('/#/workbook/25');

  const aboveX = page.locator('.lms-group-proxy[data-lms-group^="point-above-x-axis-"]');
  await page.locator('[data-lms-qid="p25-q1"]').fill('0');
  await page.locator('[data-lms-qid="p25-q2"]').fill('4');
  await expect(aboveX).toHaveAttribute('data-lms-state', 'correct');

  const rightOfB = page.locator('.lms-group-proxy[data-lms-group^="point-on-x-right-of-5-"]');
  const gx = page.locator('[data-lms-qid="p25-q13"]');
  const gy = page.locator('[data-lms-qid="p25-q14"]');
  await gx.fill('5');
  await gy.fill('0');
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(rightOfB).toHaveAttribute('data-lms-state', 'wrong');

  await gx.fill('7');
  await expect(rightOfB).toHaveAttribute('data-lms-state', 'correct');

  // Generic axis forms accept any non-negative free coordinate.
  const anyYOnYAxis = page.locator('[data-lms-qid="p25-q17"]');
  const anyXOnXAxis = page.locator('[data-lms-qid="p25-q19"]');
  await anyYOnYAxis.fill('4');
  await anyXOnXAxis.fill('9');
  await expect(anyYOnYAxis).toHaveAttribute('data-lms-state', 'correct');
  await expect(anyXOnXAxis).toHaveAttribute('data-lms-state', 'correct');
});
