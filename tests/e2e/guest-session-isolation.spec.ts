import { expect, test } from '@playwright/test';

async function submitFirstQuestion(page: import('@playwright/test').Page): Promise<void> {
  const target = page.locator('[data-lms-qid="p1-q1"]');
  const question = target.locator(
    'xpath=ancestor::*[self::li or self::tr or self::p or contains(concat(" ", normalize-space(@class), " "), " completion-sentence ")][1]',
  );
  await question.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).click();
}

test('guest reload keeps this session but a new guest start is clean', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true }).click();
  await expect(page).toHaveURL(/#\/workbook\/1$/);

  const target = page.locator('[data-lms-qid="p1-q1"]');
  await target.fill('x');
  await submitFirstQuestion(page);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  // Reloading the same practice session must preserve answers and attempts.
  await page.reload();
  const reloaded = page.locator('[data-lms-qid="p1-q1"]');
  await expect(reloaded).toHaveText('x');
  await expect(reloaded).toHaveAttribute('data-lms-state', 'correct');

  // Choosing unregistered practice again explicitly starts a different learner session.
  await page.goto('/#/');
  await page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true }).click();
  const fresh = page.locator('[data-lms-qid="p1-q1"]');
  await expect(fresh).toHaveText('');
  await expect(fresh).not.toHaveAttribute('data-lms-state', 'correct');
});
