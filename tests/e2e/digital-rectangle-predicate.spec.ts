import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

async function checkAll(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'בדיקת כל התשובות' }).click();
}

async function checkTarget(page: Page, target: Locator): Promise<void> {
  const qid = await target.getAttribute('data-lms-qid');
  if (!qid) throw new Error('LMS target is missing data-lms-qid');
  const button = page.locator(`[data-lms-check-for="${qid}"]`);
  await expect(button).toBeVisible();
  await button.click();
}

test('learner-created rectangle validates vertices, side work, perimeter, and area as one response', async ({ page }) => {
  await page.goto('/#/workbook/53');

  const values = [
    '1', '1', '6', '1', '6', '4', '1', '4',
    '6 − 1', '5', '5',
    '4 − 1', '3', '3',
    '16', '16', // wrong area first; correct area is 15
  ];
  for (let index = 0; index < values.length; index += 1) {
    await page.locator(`[data-lms-qid="p53-q${13 + index}"]`).fill(values[index]!);
  }

  const proxy = page.locator(
    '.lms-group-proxy[data-lms-group="own-axis-aligned-rectangle-with-work"]',
  );
  await expect(proxy).toHaveAttribute('data-lms-state', 'filled');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '0');

  await checkAll(page);
  await expect(proxy).toHaveAttribute('data-lms-state', 'wrong');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');

  await page.locator('[data-lms-qid="p53-q28"]').fill('15');
  await expect(proxy).toHaveAttribute('data-lms-state', 'filled');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '1');
  await checkTarget(page, proxy);
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(proxy).toHaveAttribute('data-lms-attempts', '2');
  for (let q = 13; q <= 28; q += 1) {
    await expect(page.locator(`[data-lms-qid="p53-q${q}"]`))
      .toHaveAttribute('data-lms-group-state', 'correct');
  }
});
