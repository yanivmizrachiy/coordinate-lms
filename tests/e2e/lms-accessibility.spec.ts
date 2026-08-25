import { expect, test, type Locator, type Page } from '@playwright/test';

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

async function provenGradableTarget(page: Page): Promise<Locator> {
  await page.goto('/#/workbook/1');
  const target = page.locator('[data-grid-answer="axis-y"]');
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute('data-lms-answers', /"y"/i);
  return target;
}

test('answer fields keep meaningful labels and support keyboard completion', async ({ page }) => {
  const target = await provenGradableTarget(page);
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute('aria-label', /שם הציר האנכי/);
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
  await expect(status).toContainText(/נכון|יש מה לתקן/);
});

test('feedback never rides on colour alone, and never reaches the paper', async ({ page }) => {
  const target = await provenGradableTarget(page);
  const expected = JSON.parse(
    (await target.getAttribute('data-lms-answers')) ?? '[]',
  )[0] as string;

  await target.fill(expected);
  await submitQuestion(target);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  await expect(target).toHaveAttribute('aria-label', /נכון/);
  const questionStatus = (await questionFor(target)).locator('.lms-qstatus');
  await expect(questionStatus).toContainText(/✓ נכון|יש מה לתקן/);
  const mark = await target.evaluate(
    (el) => getComputedStyle(el, '::after').content,
  );
  expect(mark).toContain('✓');

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

  const panelButtons = page.locator('.lms-panel__buttons .btn');
  await expect(panelButtons.first()).toBeVisible();
  const tooSmallPanelButtons = await panelButtons.evaluateAll((items) =>
    items
      .filter((item) => getComputedStyle(item).display !== 'none')
      .map((item) => item.getBoundingClientRect().height)
      .filter((height) => height < 44),
  );
  expect(tooSmallPanelButtons).toEqual([]);

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
