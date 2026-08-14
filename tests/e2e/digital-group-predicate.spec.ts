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
  await expect(svg).toBeVisible();

  // The workbook fits the A4 sheet shortly after mount. A raw mouse click based
  // on an earlier bounding box can therefore land outside the grid while that
  // fit settles. Wait until the SVG geometry is stable, then let Playwright
  // perform a real actionability-checked click inside the SVG.
  let box = await svg.boundingBox();
  if (!box) throw new Error('coordinate grid is not visible');
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.waitForTimeout(100);
    const next = await svg.boundingBox();
    if (!next) throw new Error('coordinate grid is not visible');
    const stable =
      Math.abs(next.x - box.x) < 0.5 &&
      Math.abs(next.y - box.y) < 0.5 &&
      Math.abs(next.width - box.width) < 0.5 &&
      Math.abs(next.height - box.height) < 0.5;
    box = next;
    if (stable) break;
  }

  const viewX = 56 + x * ((560 - 56 - 104) / 8);
  const viewY = 380 - 82 - y * ((380 - 70 - 82) / 6);
  await svg.click({
    position: {
      x: (viewX / 560) * box.width,
      y: (viewY / 380) * box.height,
    },
  });
}

async function checkAll(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'בדיקת כל התשובות' }).click();
}

test('learner-chosen point pairs consume an attempt only on a wrong explicit check, then turn correct immediately', async ({ page }) => {
  await page.goto('/#/workbook/12');

  const x1 = page.locator('[data-lms-qid="p12-q7"]');
  const y1 = page.locator('[data-lms-qid="p12-q8"]');
  const x2 = page.locator('[data-lms-qid="p12-q9"]');
  const y2 = page.locator('[data-lms-qid="p12-q10"]');
  const proxy = page.locator('.lms-group-proxy[data-lms-group^="distinct-coordinate-pairs-"]');

  await x1.fill('1');
  await y1.fill('2');
  await x2.fill('1');
  await y2.fill('5');
  await expect(proxy).not.toHaveAttribute('data-lms-state', 'wrong');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');
  await checkAll(page);

  await expect(proxy).toHaveAttribute('data-lms-state', 'wrong');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');
  await expect(x1).toHaveAttribute('data-lms-group-state', 'wrong');

  await x2.fill('4');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');
  await expect(x1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y1).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(x2).toHaveAttribute('data-lms-group-state', 'correct');
  await expect(y2).toHaveAttribute('data-lms-group-state', 'correct');
});

test('point-marking tasks are answered by touching the grid and valid conditions turn correct immediately', async ({ page }) => {
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
  await expect(rightOfB).toHaveAttribute('data-lms-attempts', '0');
});

test('axis and free-coordinate tasks accept any valid value immediately without consuming attempts', async ({ page }) => {
  await page.goto('/#/workbook/25');

  const aboveX = page.locator('.lms-group-proxy[data-lms-group^="point-above-x-axis-"]');
  await page.locator('[data-lms-qid="p25-q1"]').fill('0');
  await page.locator('[data-lms-qid="p25-q2"]').fill('4');

  const anyYOnYAxis = page.locator('[data-lms-qid="p25-q17"]');
  const anyXOnXAxis = page.locator('[data-lms-qid="p25-q19"]');
  await anyYOnYAxis.fill('4');
  await anyXOnXAxis.fill('9');

  await expect(aboveX).toHaveAttribute('data-lms-state', 'correct');
  await expect(aboveX).toHaveAttribute('data-lms-attempts', '0');
  await expect(anyYOnYAxis).toHaveAttribute('data-lms-state', 'correct');
  await expect(anyYOnYAxis).toHaveAttribute('data-lms-attempts', '0');
  await expect(anyXOnXAxis).toHaveAttribute('data-lms-state', 'correct');
  await expect(anyXOnXAxis).toHaveAttribute('data-lms-attempts', '0');
});

test('equal-coordinate package pairs are accepted regardless of pair order with immediate feedback', async ({ page }) => {
  await page.goto('/#/workbook/23');
  const targets = [11, 12, 13, 14].map((qid) => page.locator(`[data-lms-qid="p23-q${qid}"]`));
  for (const [target, value] of targets.map((target, index) => [target, ['E', 'D', 'C', 'B'][index]!] as const)) {
    await target.fill(value);
  }
  const proxy = page.locator('.lms-group-proxy[data-lms-group^="same-weight-package-pairs-"]');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');
});

test('learner-created horizontal length-four segment validates endpoints, work, and final length together', async ({ page }) => {
  await page.goto('/#/workbook/47');
  const values = ['1', '3', '5', '3', '1 − 5', '4', '4'];
  for (let index = 0; index < values.length; index += 1) {
    await page.locator(`[data-lms-qid="p47-q${16 + index}"]`).fill(values[index]!);
  }

  const proxy = page.locator(
    '.lms-group-proxy[data-lms-group^="segment-horizontal-segment-length-4-with-work-"]',
  );
  await expect(proxy).not.toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');
  await checkAll(page);
  await expect(proxy).toHaveAttribute('data-lms-state', 'wrong');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');

  await page.locator('[data-lms-qid="p47-q20"]').fill('5 − 1');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');
  for (let q = 16; q <= 22; q += 1) {
    await expect(page.locator(`[data-lms-qid="p47-q${q}"]`))
      .toHaveAttribute('data-lms-group-state', 'correct');
  }
});
