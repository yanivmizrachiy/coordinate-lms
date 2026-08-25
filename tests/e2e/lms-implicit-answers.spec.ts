import { expect, test, type Locator } from '@playwright/test';

async function questionFor(target: Locator): Promise<Locator> {
  const card = target.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " q-card ")][1]',
  );
  if (await card.count()) return card;
  const fallback = target.locator(
    'xpath=ancestor::*[self::li or self::tr or self::p or contains(concat(" ", normalize-space(@class), " "), " completion-sentence ")][1]',
  );
  return (await fallback.count()) ? fallback : target.locator('xpath=..');
}

test('an explicit authoring label becomes a checked answer automatically', async ({ page }) => {
  await page.goto('/#/workbook/1');

  const target = page.locator('[data-grid-answer="axis-y"]');
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute('data-lms-answers', /"y"/i);
  const expected = JSON.parse(
    (await target.getAttribute('data-lms-answers')) ?? '[]',
  )[0] as string;
  await target.fill(expected);
  const question = await questionFor(target);
  await question.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
});

test('coordinate-grid blanks carry their exact mathematical answers', async ({ page }) => {
  await page.goto('/#/workbook/2');

  const gridAnswers = page.locator('.lms-grid-answer[data-lms-answers]');
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
