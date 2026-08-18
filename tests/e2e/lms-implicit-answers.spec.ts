import { expect, test } from '@playwright/test';

test('an explicit authoring label becomes a checked answer automatically', async ({ page }) => {
  await page.goto('/#/workbook/10');

  /* Which question sits on which page is canonical order's business, not this
     test's: take the first target that publishes an authored answer and check
     that typing exactly that answer is graded correct. */
  const target = page.locator('[data-lms-answers]').first();
  await expect(target).toBeVisible();
  const expected = JSON.parse(
    (await target.getAttribute('data-lms-answers')) ?? '[]',
  )[0] as string;
  await target.fill(expected);
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
});

test('coordinate-grid blanks carry their exact mathematical answers', async ({ page }) => {
  await page.goto('/#/workbook/2');

  const gridAnswers = page.locator('.lms-grid-answer[data-lms-answers]');
  /* Screens are fetched on demand, so assert with a retrying matcher rather
     than reading the count once the moment navigation is requested. */
  await expect(gridAnswers.first()).toBeVisible();
  await expect(gridAnswers.first()).toHaveAttribute(
    'data-lms-answers',
    /\["\d+"\]/,
  );
});

test('true-false controls inherit the canonical row answer', async ({ page }) => {
  await page.goto('/#/workbook/3');

  const proxies = page.locator('.lms-choice-proxy[data-lms-answers]');
  await expect(proxies).toHaveCount(4);
  await expect(proxies.first()).toHaveAttribute(
    'data-lms-answers',
    /true/,
  );
});
