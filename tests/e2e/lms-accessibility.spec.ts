import { expect, test } from '@playwright/test';

test('answer fields keep meaningful labels and support keyboard completion', async ({ page }) => {
  await page.goto('/#/workbook/10');
  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute('aria-label', /מקום להשלמת|תשובה.+:/);
  await expect(page.locator('.lms-inline-check[data-lms-check-for*="p10-q1"]'))
    .toHaveCount(1);

  const answers = JSON.parse(
    (await target.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers[0]).toBeTruthy();

  await target.focus();
  await expect(target).toBeFocused();
  await target.fill(answers[0]!);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  await expect(target).toHaveAttribute('data-lms-attempts', '0');
  await target.press('Enter');
  await expect(target).not.toBeFocused();

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

  const keyed = page.locator('[data-lms-answers]').filter({ hasNot: page.locator('input') }).first();
  if (await keyed.count()) {
    const answers = JSON.parse((await keyed.getAttribute('data-lms-answers')) || '[]') as string[];
    if (answers[0] && (await keyed.getAttribute('contenteditable')) === 'true') {
      await keyed.fill(answers[0]);
      await expect(keyed).toHaveAttribute('data-lms-state', 'correct');
    }
  }

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();
  if (await keyed.count()) {
    expect(await keyed.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('none');
  }
});
