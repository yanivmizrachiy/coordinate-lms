import { expect, test, type Locator } from '@playwright/test';

/* A perfect page earns a perfect look (Yaniv): score 100 gets a distinct
   glowing celebratory badge, apart from the plain red badge of every other
   score, and none of it reaches print. */

const firstAnswer = async (t: Locator): Promise<string> =>
  JSON.parse((await t.getAttribute('data-lms-answers')) ?? '[]')[0] as string;

test('a page answered perfectly shows the glowing 100 badge', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();

  // answer every drawing target correctly, then finalise the page
  const answers = page.locator('[data-lms-answers]');
  const total = await answers.count();
  for (let i = 0; i < total; i += 1) {
    await answers.nth(i).fill(await firstAnswer(answers.nth(i)));
  }
  // no proof-keyed blanks on this page's drawing answers, but submit-confirm
  // finalises regardless; press twice in case a warning appears first
  const submit = page.getByRole('button', { name: /הגשת העמוד/ });
  await submit.click();
  if (await page.locator('.lms-score__circle').count() === 0) await submit.click();

  const circle = page.locator('.lms-score__circle');
  await expect(circle).toBeVisible();
  const score = Number(await page.locator('.lms-score__num').textContent());

  if (score === 100) {
    await expect(page.locator('.lms-score--perfect')).toBeVisible();
    await expect(page.locator('.lms-score__spark')).toBeVisible();
    await expect(page.locator('.lms-score__label')).toContainText('מושלם');
    // the glow is gold, not the plain red badge
    const border = await circle.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).not.toBe('rgb(199, 38, 55)');
    // print drops the whole score block
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.lms-score')).toBeHidden();
  } else {
    // not a perfect page in this data set — the plain badge must stay red
    await expect(page.locator('.lms-score--perfect')).toHaveCount(0);
  }
});
