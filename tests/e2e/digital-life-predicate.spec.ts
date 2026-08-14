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

  const xmax = Number(await grid.getAttribute('data-xmax')) || 8;
  const ymax = Number(await grid.getAttribute('data-ymax')) || 6;
  const viewX = 56 + x * ((560 - 56 - 104) / xmax);
  const viewY = 380 - 82 - y * ((380 - 70 - 82) / ymax);
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

test('phone icon choice is filled by touching the grid and distance is checked from Maps', async ({ page }) => {
  await page.goto('/#/workbook/59');
  const grid = page.locator('.coordinate-grid[data-lms-picker="ready"]');
  await expect(grid).toBeVisible();

  await clickGridPoint(page, grid, 1, 4);
  await expect(page.locator('[data-lms-qid="p59-q15"]')).toHaveText('1');
  await expect(page.locator('[data-lms-qid="p59-q16"]')).toHaveText('4');

  const distance = page.locator('[data-lms-qid="p59-q17"]');
  const proxy = page.locator(
    '.lms-group-proxy[data-lms-group="phone-same-column-with-distance"]',
  );

  await distance.fill('3');
  await expect(proxy).not.toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');
  await checkAll(page);
  await expect(proxy).toHaveAttribute('data-lms-state', 'wrong');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');

  await distance.fill('2');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');
  for (let q = 15; q <= 17; q += 1) {
    await expect(page.locator(`[data-lms-qid="p59-q${q}"]`))
      .toHaveAttribute('data-lms-group-state', 'correct');
  }
});

test('split-line hall instruction still lets the learner pick a free seat by touch', async ({ page }) => {
  await page.goto('/#/workbook/60');
  const grid = page.locator('.coordinate-grid[data-lms-picker="ready"]');
  await expect(grid).toBeVisible();

  await clickGridPoint(page, grid, 5, 3);
  await expect(page.locator('[data-lms-qid="p60-q13"]')).toHaveText('5');
  await expect(page.locator('[data-lms-qid="p60-q14"]')).toHaveText('3');

  const distance = page.locator('[data-lms-qid="p60-q15"]');
  const proxy = page.locator(
    '.lms-group-proxy[data-lms-group="hall-seat-above-noa-with-distance"]',
  );

  await distance.fill('2');
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');
  for (let q = 13; q <= 15; q += 1) {
    await expect(page.locator(`[data-lms-qid="p60-q${q}"]`))
      .toHaveAttribute('data-lms-group-state', 'correct');
  }
});
