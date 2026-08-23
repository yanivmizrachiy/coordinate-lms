import { expect, test, type Locator } from '@playwright/test';

function questionFor(target: Locator): Locator {
  return target.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " q-card ")][1]',
  );
}

async function submitQuestion(target: Locator): Promise<void> {
  await questionFor(target)
    .getByRole('button', { name: 'להגיש שאלה לבדיקה' })
    .click();
}

test('answer fields keep meaningful labels and support keyboard completion', async ({ page }) => {
  await page.goto('/#/workbook/10');
  /* The page number is not part of the contract — canonical order may move a
     sheet at any time. Take the first target that carries a known answer and
     type THAT answer, so the test measures keyboard completion rather than
     memorising which question sits on which page. */
  const target = page.locator('[data-lms-answers]').first();
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute('aria-label', /מקום להשלמת|תשובה.+:/);
  const expected = JSON.parse(
    (await target.getAttribute('data-lms-answers')) ?? '[]',
  )[0] as string;

  await target.focus();
  await expect(target).toBeFocused();
  await target.fill(expected);
  await target.press('Enter');
  await expect(target).not.toBeFocused();
  await submitQuestion(target);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  const status = questionFor(target).locator('.lms-qstatus');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toContainText('נכון');
});

test('feedback never rides on colour alone, and never reaches the paper', async ({ page }) => {
  await page.goto('/#/workbook/10');
  const target = page.locator('[data-lms-answers]').first();
  const expected = JSON.parse(
    (await target.getAttribute('data-lms-answers')) ?? '[]',
  )[0] as string;

  await target.fill(expected);
  await submitQuestion(target);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  /* Someone who cannot see the green hears the verdict… */
  await expect(target).toHaveAttribute('aria-label', /נכון/);
  await expect(questionFor(target).locator('.lms-qstatus')).toContainText('✓ נכון');
  /* …and someone who cannot tell green from red still sees a mark. */
  const mark = await target.evaluate(
    (el) => getComputedStyle(el, '::after').content,
  );
  expect(mark).toContain('✓');

  /* On paper there is no verdict at all — the sheet prints as authored. */
  await page.emulateMedia({ media: 'print' });
  const printed = await target.evaluate(
    (el) => getComputedStyle(el, '::after').display,
  );
  expect(printed).toBe('none');
  await expect(questionFor(target).locator('.lms-qcheck')).toBeHidden();
});

test('true-false groups include their statement in the accessible name', async ({ page }) => {
  await page.goto('/#/workbook/3');
  const groups = page.locator('.tf-options[data-lms-choice="ready"]');
  await expect(groups).toHaveCount(4);
  await expect(groups.first()).toHaveAttribute(
    'aria-label',
    /ראשית הצירים.+סמנו נכון או לא נכון/,
  );

  const names = await groups.first().locator('input[type="radio"]')
    .evaluateAll((radios) => radios.map((radio) => (radio as HTMLInputElement).name));
  expect(names[0]).toBeTruthy();
  expect(new Set(names).size).toBe(1);
});

test('LMS overlays do not alter the printed workbook and controls are touch-sized', async ({ page }) => {
  await page.goto('/#/workbook/2');
  const buttons = page.locator('.lms-panel__buttons .btn, .lms-qcheck__btn');
  await expect(buttons.first()).toBeVisible();
  const tooSmall = await buttons.evaluateAll((items) =>
    items
      .filter((item) => getComputedStyle(item).display !== 'none')
      .map((item) => item.getBoundingClientRect().height)
      .filter((height) => height < 44),
  );
  expect(tooSmall).toEqual([]);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-qcheck').first()).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();
});