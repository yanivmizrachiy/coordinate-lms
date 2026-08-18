import { expect, test, type Locator } from '@playwright/test';

/* A learner who leaves a checkable answer unfilled must still be able to hand
   the page in and get a score — an empty blank never locks on its own, so the
   old hard block made the page score unreachable forever. The first press
   explains; a second finalises and scores the unanswered targets as 0. */

test('unfinished page can still be submitted on a second press, and scores', async ({ page }) => {
  await page.goto('/#/workbook/1');
  await page.locator('.lms-qcheck').first().waitFor();
  await page.locator('[data-lms-answers]').first().waitFor();

  // answer exactly one drawing target correctly, leave the rest of the page blank
  const first: Locator = page.locator('[data-lms-answers]').first();
  const answer = JSON.parse((await first.getAttribute('data-lms-answers')) ?? '[]')[0] as string;
  await first.fill(answer);

  const submit = page.getByRole('button', { name: /הגשת העמוד/ });

  // first press: explained, not submitted, no score yet
  await submit.click();
  await expect(page.locator('.lms-panel__status')).toContainText('ללחוץ');
  await expect(page.locator('.lms-score')).toHaveCount(0);

  // second press: finalised with a real score
  await submit.click();
  await expect(page.locator('.lms-score__circle')).toBeVisible();
  const score = Number(await page.locator('.lms-score__circle').textContent());
  expect(score).toBeGreaterThanOrEqual(1);
  expect(score).toBeLessThanOrEqual(100);
  await expect(page.getByRole('button', { name: 'העמוד הוגש' })).toBeDisabled();
});
