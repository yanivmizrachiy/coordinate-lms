import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

async function clickGridPoint(
  page: Page,
  grid: Locator,
  x: number,
  y: number,
): Promise<void> {
  const svg = grid.locator('svg');
  const box = await svg.boundingBox();
  if (!box) throw new Error('coordinate grid is not visible');
  const viewX = 56 + x * ((560 - 56 - 104) / 8);
  const viewY = 380 - 82 - y * ((380 - 70 - 82) / 6);
  await page.mouse.click(
    box.x + (viewX / 560) * box.width,
    box.y + (viewY / 380) * box.height,
  );
}

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

  await x2.fill('4');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(x1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(x2).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y2).toHaveAttribute('data-lms-group-state', 'correct');
});

test('point-marking tasks are answered directly by touching the coordinate grid', async ({ page }) => {
  await page.goto('/#/workbook/25');
  const grid = page.locator('.coordinate-grid[data-lms-picker="ready"]');
  await expect(grid).toHaveAttribute('data-lms-picker-active', 'F');

  await clickGridPoint(page, grid, 3, 0);
  await expect(page.locator('[data-lms-qid="p25-q11"]')).toHaveText('3');
  await expect(page.locator('[data-lms-qid="p25-q12"]')).toHaveText('0');
  await expect(grid).toHaveAttribute('data-lms-picker-active', 'G');
  await expect(grid.locator('[data-lms-picked-label="F"]')).toBeVisible();

  await clickGridPoint(page, grid, 7, 0);
  await expect(page.locator('[data-lms-qid="p25-q13"]')).toHaveText('7');
  await expect(page.locator('[data-lms-qid="p25-q14"]')).toHaveText('0');
  await expect(grid.locator('[data-lms-picked-label="G"]')).toBeVisible();

  const rightOfB = page.locator('.lms-group-proxy[data-lms-group^="point-on-x-right-of-5-"]');
  await expect(rightOfB).toHaveAttribute('data-lms-state', 'correct');
});

test('axis and free-coordinate tasks accept any value satisfying the prompt', async ({ page }) => {
  await page.goto('/#/workbook/25');

  const aboveX = page.locator('.lms-group-proxy[data-lms-group^="point-above-x-axis-"]');
  await page.locator('[data-lms-qid="p25-q1"]').fill('0');
  await page.locator('[data-lms-qid="p25-q2"]').fill('4');
  await expect(aboveX).toHaveAttribute('data-lms-state', 'correct');

  const anyYOnYAxis = page.locator('[data-lms-qid="p25-q17"]');
  const anyXOnXAxis = page.locator('[data-lms-qid="p25-q19"]');
  await anyYOnYAxis.fill('4');
  await anyXOnXAxis.fill('9');
  await expect(anyYOnYAxis).toHaveAttribute('data-lms-state', 'correct');
  await expect(anyXOnXAxis).toHaveAttribute('data-lms-state', 'correct');
});

test('equal-coordinate package pairs are accepted regardless of pair order', async ({ page }) => {
  await page.goto('/#/workbook/23');
  const targets = [11, 12, 13, 14].map((qid) => page.locator(`[data-lms-qid="p23-q${qid}"]`));
  for (const [target, value] of targets.map((target, index) => [target, ['E', 'D', 'C', 'B'][index]!] as const)) {
    await target.fill(value);
  }
  const proxy = page.locator('.lms-group-proxy[data-lms-group^="same-weight-package-pairs-"]');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
});
