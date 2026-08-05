import { expect, test } from '@playwright/test';

test('three-attempt state survives reload and never resets', async ({ page }) => {
  await page.goto('/#/workbook/10');

  for (let expectedAttempts = 1; expectedAttempts <= 3; expectedAttempts += 1) {
    const target = page.locator('[data-lms-qid="p10-q1"]');
    await expect(target).toBeVisible();
    await target.fill('תשובה שגויה');
    await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
    await expect(target).toHaveAttribute(
      'data-lms-attempts',
      String(expectedAttempts),
    );

    if (expectedAttempts < 3) await page.reload();
  }

  const locked = page.locator('[data-lms-qid="p10-q1"]');
  await expect(locked).toHaveAttribute('data-lms-state', 'locked');
  await expect(locked).toHaveAttribute('contenteditable', 'false');
  await page.reload();
  await expect(page.locator('[data-lms-qid="p10-q1"]'))
    .toHaveAttribute('data-lms-attempts', '3');
});

test('rapid duplicate submission creates one durable completion', async ({ page }) => {
  await page.goto('/#/workbook/19');
  const submit = page.getByRole('button', { name: 'סיימתי את הפעילות' });
  await expect(submit).toBeEnabled();

  await submit.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });

  await expect(page.getByRole('button', { name: 'העמוד הוגש' }))
    .toBeDisabled();
  await expect(page.locator('.lms-panel__status'))
    .toContainText('נשמרה במכשיר בלבד');

  const persisted = await page.evaluate(() => {
    const results = JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, { pageNumber: number; score: number }>;
    const activity = JSON.parse(
      localStorage.getItem('coordinate_lms_activity_v2') || '[]',
    ) as Array<{ pageNumber: number; type: string }>;
    return {
      results: Object.values(results).filter((result) => result.pageNumber === 19),
      submissions: activity.filter(
        (event) => event.pageNumber === 19 && event.type === 'page_submit',
      ),
    };
  });

  expect(persisted.results).toHaveLength(1);
  expect(persisted.results[0]?.score).toBe(100);
  expect(persisted.submissions).toHaveLength(1);

  await page.reload();
  await expect(page.getByRole('button', { name: 'העמוד הוגש' }))
    .toBeDisabled();
});
