import { expect, test, type Locator } from '@playwright/test';

/* Every submitted page score is red. A perfect 100 may keep celebratory
   decoration, but its numeric grade remains red and receives a teacher note. */

const firstAnswer = async (t: Locator): Promise<string> =>
  JSON.parse((await t.getAttribute('data-lms-answers')) ?? '[]')[0] as string;

test('a submitted page shows a red score and a Hebrew teacher comment', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();

  const answers = page.locator('[data-lms-answers]');
  const total = await answers.count();
  for (let i = 0; i < total; i += 1) {
    await answers.nth(i).fill(await firstAnswer(answers.nth(i)));
  }

  const submit = page.getByRole('button', { name: /הגשת העמוד/ });
  await submit.click();
  if (await page.locator('.lms-score__circle').count() === 0) await submit.click();

  const circle = page.locator('.lms-score__circle');
  await expect(circle).toBeVisible();
  await expect(page.locator('.lms-score__teacher')).toBeVisible();
  await expect(page.locator('.lms-score__teacher')).not.toHaveText('');

  /* The grade greets the learner at the TOP of the page — the banner renders
     ABOVE the worksheet, not below it (RULES §5). */
  const bannerBottom = await page.locator('.lms-score-banner').evaluate((el) => el.getBoundingClientRect().bottom);
  const sheetTop = await page.locator('.sheet').first().evaluate((el) => el.getBoundingClientRect().top);
  expect(bannerBottom, 'the score banner must sit above the worksheet').toBeLessThanOrEqual(sheetTop + 1);

  const border = await circle.evaluate((el) => getComputedStyle(el).borderTopColor);
  const color = await circle.evaluate((el) => getComputedStyle(el).color);
  expect(border).toBe('rgb(199, 38, 55)');
  expect(color).toBe('rgb(199, 38, 55)');

  const score = Number(await page.locator('.lms-score__num').textContent());
  if (score === 100) {
    await expect(page.locator('.lms-score--perfect')).toBeVisible();
    await expect(page.locator('.lms-score__spark')).toBeVisible();
    await expect(page.locator('.lms-score__label')).toContainText('מושלם');
  }

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-score')).toBeHidden();
});
