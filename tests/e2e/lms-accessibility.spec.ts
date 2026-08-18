import { expect, test } from '@playwright/test';

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
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  const status = page.locator('.lms-panel__status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
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
  const buttons = page.locator('.lms-panel__buttons .btn');
  await expect(buttons.first()).toBeVisible();
  const tooSmall = await buttons.evaluateAll((items) =>
    items
      .map((item) => item.getBoundingClientRect().height)
      .filter((height) => height < 44),
  );
  expect(tooSmall).toEqual([]);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();
});
