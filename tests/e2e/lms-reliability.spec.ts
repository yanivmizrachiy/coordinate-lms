import { expect, test } from '@playwright/test';

test('three-attempt state survives reload and never resets', async ({ page }) => {
  await page.goto('/#/workbook/10');

  /* Bind to whichever target is first gradable on the page, by its id, so the
     canonical order can move pages without touching this contract. */
  const qid = await page
    .locator('[data-lms-answers]')
    .first()
    .getAttribute('data-lms-qid');
  const at = (): ReturnType<typeof page.locator> =>
    page.locator(`[data-lms-qid="${qid}"]`);

  for (let expectedAttempts = 1; expectedAttempts <= 3; expectedAttempts += 1) {
    const target = at();
    await expect(target).toBeVisible();
    await target.fill('תשובה שגויה');
    await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
    await expect(target).toHaveAttribute(
      'data-lms-attempts',
      String(expectedAttempts),
    );

    if (expectedAttempts < 3) await page.reload();
  }

  const locked = at();
  await expect(locked).toHaveAttribute('data-lms-state', 'locked');
  await expect(locked).toHaveAttribute('contenteditable', 'false');
  await page.reload();
  await expect(at()).toHaveAttribute('data-lms-attempts', '3');
});

test('rapid duplicate submission creates one durable completion', async ({ page }) => {
  /* An activity page — one with no gradable targets, so submitting is a single
     completion rather than a graded check. Page 19 („מגלים ציור סודי") is one
     in the canonical order; see reports/answer-coverage.json for the set. */
  const ACTIVITY_PAGE = 19;
  await page.goto(`/#/workbook/${ACTIVITY_PAGE}`);
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

  const persisted = await page.evaluate((ACTIVITY_PAGE) => {
    const results = JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, { pageNumber: number; score: number }>;
    const activity = JSON.parse(
      localStorage.getItem('coordinate_lms_activity_v2') || '[]',
    ) as Array<{ pageNumber: number; type: string }>;
    return {
      results: Object.values(results).filter((result) => result.pageNumber === ACTIVITY_PAGE),
      submissions: activity.filter(
        (event) => event.pageNumber === ACTIVITY_PAGE && event.type === 'page_submit',
      ),
    };
  }, ACTIVITY_PAGE);

  expect(persisted.results).toHaveLength(1);
  expect(persisted.results[0]?.score).toBe(100);
  expect(persisted.submissions).toHaveLength(1);

  await page.reload();
  await expect(page.getByRole('button', { name: 'העמוד הוגש' }))
    .toBeDisabled();
});
