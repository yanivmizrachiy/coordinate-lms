import { expect, test } from '@playwright/test';

test('an explicit authoring label becomes a checked answer automatically', async ({ page }) => {
  await page.goto('/#/workbook/10');

  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  const answers = JSON.parse(
    (await target.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers[0]).toBeTruthy();
  await target.fill(answers[0]!);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
});

test('coordinate-grid blanks carry their exact mathematical answers', async ({ page }) => {
  await page.goto('/#/workbook/2');

  const gridAnswers = page.locator('.lms-grid-answer[data-lms-answers]');
  await expect.poll(() => gridAnswers.count()).toBeGreaterThan(0);
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
