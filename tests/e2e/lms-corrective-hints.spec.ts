import { expect, test, type Locator, type Page } from '@playwright/test';

const firstAnswer = async (target: Locator): Promise<string> =>
  JSON.parse((await target.getAttribute('data-lms-answers')) ?? '[]')[0] as string;

async function singleTargetQuestion(page: Page): Promise<Locator> {
  await page.locator('.lms-qcheck').first().waitFor();
  const controls = page.locator('.lms-qcheck');
  const count = await controls.count();

  for (let i = 0; i < count; i += 1) {
    const anchor = controls.nth(i).locator('xpath=..');
    if (
      (await anchor.locator('[data-lms-qid]').count()) === 1 &&
      (await anchor.locator('[data-lms-answers]').count()) === 1
    ) {
      return anchor;
    }
  }

  throw new Error('no single-target question with an explicit answer');
}

test('a wrong submission teaches, escalates the hint, and still allows correction', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const question = await singleTargetQuestion(page);
  const target = question.locator('[data-lms-qid]').first();
  const submit = question.getByRole('button', { name: 'להגיש שאלה לבדיקה' });
  const hint = question.locator('.lms-qhint');

  await target.fill('__תשובה_שגויה__');
  await submit.click();

  await expect(hint).toBeVisible();
  await expect(hint).toHaveAttribute('data-hint-level', '1');
  await expect(hint).toContainText('רמז:');
  await expect(hint).not.toHaveText(/לא נכון\s*$/);
  await expect(target).toHaveAttribute('data-lms-attempts', '1');

  await submit.click();
  await expect(hint).toHaveAttribute('data-hint-level', '2');
  await expect(hint).toContainText('כיוון נוסף:');
  await expect(target).toHaveAttribute('data-lms-attempts', '2');

  await target.fill(await firstAnswer(target));
  await submit.click();

  await expect(question.locator('.lms-qstatus')).toContainText('✓ נכון');
  await expect(hint).toBeHidden();
  await expect(target).toHaveAttribute('data-lms-attempts', '3');
});

test('final correction gets a distinct explanatory hint without revealing an ordered-pair answer', async ({ page }) => {
  await page.goto('/#/workbook/6');
  const target = page.locator('.pair-blank[data-lms-qid]').first();
  await expect(target).toBeVisible();

  const question = target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " q-card ")]');
  const submit = question.getByRole('button', { name: 'להגיש שאלה לבדיקה' });
  const hint = question.locator('.lms-qhint');

  await target.fill('__שגוי__');
  await submit.click();
  await submit.click();
  await submit.click();
  await submit.click();

  await expect(target).toHaveAttribute('data-lms-attempts', '4');
  await expect(hint).toBeVisible();
  await expect(hint).toHaveAttribute('data-hint-level', '4');
  await expect(hint).toContainText('הסבר לפני שממשיכים:');
  await expect(hint).not.toContainText('(x, y)');
  await expect(hint).not.toContainText('(x,y)');
});
