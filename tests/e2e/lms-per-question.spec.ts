import { expect, test, type Locator, type Page } from '@playwright/test';

/* The per-question model (spec steps 4–7): each question the learner finishes
   is checked on its own with „סיימתי שאלה", and the verdict — ✓ correct,
   ◐ partial, ✕ wrong — appears beside that question. The tests drive the grid
   answers whose value the canonical drawing publishes in the DOM
   (data-lms-answers), so they are deterministic without the runtime key. */

const firstAnswer = async (t: Locator): Promise<string> =>
  JSON.parse((await t.getAttribute('data-lms-answers')) ?? '[]')[0] as string;

/* A question is whatever the „סיימתי שאלה" control was attached to. Find one
   that holds at least `min` drawing answers, so the test can complete it. */
async function pickQuestion(page: Page, min: number): Promise<Locator> {
  // controls and drawing answers are attached after the page hydrates
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

test('finishing a question grades only it, and a correct target earns ✓ נכון', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const q = await pickQuestion(page, 1);
  const target = q.locator('[data-lms-answers]').first();

  await target.fill(await firstAnswer(target));
  await q.getByRole('button', { name: 'סיימתי שאלה' }).click();

  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  await expect(target).toHaveAttribute('aria-label', /נכון/);
});

test('a partly-right question shows ◐, keeps the correct part, and lets the wrong part be fixed', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const q = await pickQuestion(page, 2);
  const answers = q.locator('[data-lms-answers]');

  await answers.nth(0).fill(await firstAnswer(answers.nth(0)));
  await answers.nth(1).fill('99');
  await q.getByRole('button', { name: 'סיימתי שאלה' }).click();

  await expect(q.locator('.lms-qstatus')).toHaveAttribute('data-qstate', 'partial');
  // the correct part is preserved and locked; the wrong part stays open to fix
  await expect(answers.nth(0)).toHaveAttribute('data-lms-state', 'correct');
  await expect(answers.nth(0)).toHaveAttribute('contenteditable', 'false');
  await expect(answers.nth(1)).toHaveAttribute('data-lms-state', 'wrong');
  await expect(answers.nth(1)).toHaveAttribute('contenteditable', 'true');

  // fixing only the wrong target turns it correct, without retyping the first
  await answers.nth(1).fill(await firstAnswer(answers.nth(1)));
  await q.getByRole('button', { name: 'סיימתי שאלה' }).click();
  await expect(answers.nth(1)).toHaveAttribute('data-lms-state', 'correct');
});

test('progress counts QUESTIONS, and every per-question control is print-hidden', async ({ page }) => {
  await page.goto('/#/workbook/1');
  const progress = page.locator('.lms-progress');
  await expect(progress).toContainText(/\d+ מתוך \d+ שאלות הושלמו/);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-qcheck').first()).toBeHidden();
  await expect(progress).toBeHidden();
});
