import { expect, test, type Locator } from '@playwright/test';

/* A learner who leaves a checkable answer unfilled must still be able to hand
   the page in and get a score — an empty blank never locks on its own, so the
   old hard block made the page score unreachable forever. The first press
   explains; a second finalises and scores unanswered targets as 0. */

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

  // second press: finalised with a real 0–100 score
  await submit.click();
  await expect(page.locator('.lms-score__circle')).toBeVisible();
  const score = Number(await page.locator('.lms-score__circle').textContent());
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
  await expect(page.getByRole('button', { name: 'העמוד הוגש' })).toBeDisabled();

  /* The reported clipping happened on exactly this flow: one question solved,
     final submission, score + verdicts injected. The whole canonical footer —
     its top rule included — must stay inside the reserved wrapper footprint,
     and the LMS panel may begin only after the page has fully ended. */
  const wrap = page.locator('.pageviewer__sheetwrap');
  const footer = page.locator('.gz-footer').first();
  await expect(footer).toBeVisible();
  await expect.poll(async () => {
    const wrapBottom = await wrap.evaluate((el) => el.getBoundingClientRect().bottom);
    const footerBottom = await footer.evaluate((el) => el.getBoundingClientRect().bottom);
    return Math.floor(wrapBottom - footerBottom);
  }, {
    message: 'the full canonical footer must stay inside the practice wrapper after a partial submission',
  }).toBeGreaterThanOrEqual(-1);

  const footerTop = await footer.evaluate((el) => el.getBoundingClientRect().top);
  const wrapTop = await wrap.evaluate((el) => el.getBoundingClientRect().top);
  expect(footerTop, 'the footer top rule must be visible inside the wrapper').toBeGreaterThan(wrapTop);

  const panelTop = await page.locator('.lms-panel').evaluate((el) => el.getBoundingClientRect().top);
  const footerBottom = await footer.evaluate((el) => el.getBoundingClientRect().bottom);
  expect(panelTop, 'the LMS panel must begin after the page has ended').toBeGreaterThanOrEqual(footerBottom - 1);

  // No stray horizontal scrolling on any reading surface.
  const overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflowX).toBeLessThanOrEqual(1);
});