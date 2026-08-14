import { expect, test } from '@playwright/test';

test('an explicit answer is checked only after the nearby check button', async ({ page }) => {
  await page.goto('/#/workbook/10');

  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  const answers = JSON.parse(
    (await target.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers[0]).toBeTruthy();

  await target.fill(answers[0]!);
  await expect(target).toHaveAttribute('data-lms-state', 'filled');

  const localCheck = page.locator('[data-lms-check-for="p10-q1"]');
  await expect(localCheck).toBeVisible();
  await expect(localCheck).toHaveText('בדוק');
  await localCheck.click();

  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  await expect(localCheck).toHaveAttribute('data-state', 'correct');
  await expect(localCheck).toHaveText('✓');
});

test('reviewed explanation prompts become four-option choices and require explicit checking', async ({ page }) => {
  await page.goto('/#/workbook/11');

  const fieldset = page.locator('.lms-explanation-options').first();
  await expect(fieldset).toBeVisible();
  await expect(fieldset.locator('input[type="radio"]')).toHaveCount(4);
  await expect(fieldset.locator('legend')).toContainText('מדוע');

  const proxy = page.locator('.lms-explanation-proxy').first();
  const qid = await proxy.getAttribute('data-lms-qid');
  expect(qid).toBeTruthy();
  const answers = JSON.parse(
    (await proxy.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers).toHaveLength(1);

  await fieldset.locator(`input[value="${answers[0]!.replace(/"/g, '\\"')}"]`).check();
  await expect(proxy).toHaveAttribute('data-lms-state', 'filled');

  const localCheck = page.locator(`[data-lms-check-for="${qid}"]`);
  await expect(localCheck).toHaveText('בדוק');
  await localCheck.click();
  await expect(proxy).toHaveAttribute('data-lms-state', 'correct');
  await expect(localCheck).toHaveText('✓');
});

test('explanation choices remain LMS-only and disappear in print', async ({ page }) => {
  await page.goto('/#/workbook/39');
  await expect(page.locator('.lms-explanation-options')).toHaveCount(2);
  await page.emulateMedia({ media: 'print' });
  const visible = await page.locator('.lms-explanation-options').evaluateAll((nodes) =>
    nodes.filter((node) => getComputedStyle(node).display !== 'none').length,
  );
  expect(visible).toBe(0);
});

test('coordinate-grid blanks carry their exact mathematical answers', async ({ page }) => {
  await page.goto('/#/workbook/2');

  const gridAnswers = page.locator('.lms-grid-answer[data-lms-answers]');
  await expect.poll(() => gridAnswers.count()).toBeGreaterThan(0);
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
