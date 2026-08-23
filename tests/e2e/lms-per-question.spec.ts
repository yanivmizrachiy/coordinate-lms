import { expect, test, type Locator, type Page } from '@playwright/test';

/* The per-question model: each question is submitted on its own with the small
   „להגיש ←” control. The result appears beside that question immediately:
   ✓ נכון when complete, or a clear repair state while the incorrect part stays
   editable and can be submitted again. The tests drive canonical drawing
   answers published in the DOM (data-lms-answers), so they stay deterministic. */

const firstAnswer = async (t: Locator): Promise<string> =>
  JSON.parse((await t.getAttribute('data-lms-answers')) ?? '[]')[0] as string;

async function pickQuestion(page: Page, min: number): Promise<Locator> {
  await page.locator('.lms-qcheck').first().waitFor();
  await page.locator('[data-lms-answers]').first().waitFor();
  const controls = page.locator('.lms-qcheck');
  const count = await controls.count();
  for (let i = 0; i < count; i += 1) {
    const anchor = controls.nth(i).locator('xpath=..');
    if ((await anchor.locator('[data-lms-answers]').count()) >= min) return anchor;
  }
  throw new Error(`no question with ${min} drawing answers`);
}

test('submitting a question grades only it and shows a green ✓ נכון verdict', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const q = await pickQuestion(page, 1);
  const target = q.locator('[data-lms-answers]').first();
  const submit = q.getByRole('button', { name: 'להגיש שאלה לבדיקה' });

  await expect(submit).toHaveText('להגיש ←');
  await target.fill(await firstAnswer(target));
  await submit.click();

  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  await expect(target).toHaveAttribute('aria-label', /נכון/);
  await expect(q.locator('.lms-qstatus')).toHaveAttribute('data-qstate', 'correct');
  await expect(q.locator('.lms-qstatus')).toContainText('✓ נכון');
});

test('a partly-right question shows repair feedback and can be fixed and submitted again', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const q = await pickQuestion(page, 2);
  const answers = q.locator('[data-lms-answers]');
  const submit = q.getByRole('button', { name: 'להגיש שאלה לבדיקה' });

  await answers.nth(0).fill(await firstAnswer(answers.nth(0)));
  await answers.nth(1).fill('99');
  await submit.click();

  await expect(q.locator('.lms-qstatus')).toHaveAttribute('data-qstate', 'partial');
  await expect(q.locator('.lms-qstatus')).toContainText('יש מה לתקן');
  await expect(submit).toBeEnabled();

  // The correct part is preserved and locked; only the wrong part stays open.
  await expect(answers.nth(0)).toHaveAttribute('data-lms-state', 'correct');
  await expect(answers.nth(0)).toHaveAttribute('contenteditable', 'false');
  await expect(answers.nth(1)).toHaveAttribute('data-lms-state', 'wrong');
  await expect(answers.nth(1)).toHaveAttribute('contenteditable', 'true');

  // Fixing only the wrong target turns the whole question correct on resubmit.
  await answers.nth(1).fill(await firstAnswer(answers.nth(1)));
  await submit.click();
  await expect(answers.nth(1)).toHaveAttribute('data-lms-state', 'correct');
  await expect(q.locator('.lms-qstatus')).toContainText('✓ נכון');
});

test('progress counts QUESTIONS, and every per-question control is print-hidden', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const progress = page.locator('.lms-progress');
  await expect(progress).toContainText(/\d+ מתוך \d+ שאלות הושלמו/);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-qcheck').first()).toBeHidden();
  await expect(progress).toBeHidden();
});
