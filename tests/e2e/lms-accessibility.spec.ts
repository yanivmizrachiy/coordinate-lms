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

async function submitQuestion(target: Locator): Promise<void> {
  const question = await questionFor(target);
  await question
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

  const status = (await questionFor(target)).locator('.lms-qstatus');
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
  await expect((await questionFor(target)).locator('.lms-qstatus')).toContainText('✓ נכון');
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
  await expect((await questionFor(target)).locator('.lms-qcheck')).toBeHidden();
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

test('LMS overlays do not alter the printed workbook and controls remain easy to tap', async ({ page }) => {
  await page.goto('/#/workbook/2');

  /* Page-level controls are outside the scaled A4 sheet and keep a normal
     44px box. */
  const panelButtons = page.locator('.lms-panel__buttons .btn');
  await expect(panelButtons.first()).toBeVisible();
  const tooSmallPanelButtons = await panelButtons.evaluateAll((items) =>
    items
      .filter((item) => getComputedStyle(item).display !== 'none')
      .map((item) => item.getBoundingClientRect().height)
      .filter((height) => height < 44),
  );
  expect(tooSmallPanelButtons).toEqual([]);

  /* Question controls live inside the scaled worksheet. Their painted box is
     deliberately compact, so test the effective hit region rather than the
     transformed element rectangle. A point about 21px from the visual centre
     in every direction must still hit the button. */
  const questionButton = page.locator('.lms-qcheck__btn').first();
  await expect(questionButton).toBeVisible();
  const hitRegion = await questionButton.evaluate((button) => {
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const points = [
      [cx, cy - 21],
      [cx, cy + 21],
      [cx - 21, cy],
      [cx + 21, cy],
    ];
    return points.map(([x, y]) => {
      const hit = document.elementFromPoint(x!, y!);
      return hit === button || (hit instanceof Node && button.contains(hit));
    });
  });
  expect(hitRegion).toEqual([true, true, true, true]);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-qcheck').first()).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();
});