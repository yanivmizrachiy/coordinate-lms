import { test, expect } from '@playwright/test';

test('computerized practice is focused and carries no legacy or print controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/workbook/1');

  await expect(page.locator('.sheet')).toHaveCount(1);
  await expect(page.locator('.appbar--practice')).toBeVisible();
  await expect(page.locator('.pagenav--practice')).toBeVisible();

  /* The old worksheet reader bar mixed print/download with practice and also
     duplicated previous/next navigation. It must never return here. */
  await expect(page.locator('.pageviewer--practice .wsbar')).toHaveCount(0);
  await expect(page.getByText('הדפסה', { exact: true })).toHaveCount(0);
  await expect(page.getByText('הורדת הדף', { exact: true })).toHaveCount(0);

  /* Account/save explanations happen before practice, not inside a worksheet. */
  await expect(page.getByText(/מצב אורח/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /הרשמה|התחברות|החשבון שלי/ })).toHaveCount(0);

  /* Per-question submit is the learner's check action. The legacy whole-page
     check button could consume attempts unexpectedly and must not be exposed. */
  await expect(page.getByRole('button', { name: 'בדיקת תשובות' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).first()).toBeVisible();

  /* The general utility menu contains booklet/print tools, so it is hidden
     while the learner is inside the focused computerized practice flow. */
  await expect(page.getByRole('button', { name: 'תפריט הפעולות' })).toBeHidden();

  const dock = page.locator('.pagenav--practice');
  const dockBox = await dock.boundingBox();
  expect(dockBox).not.toBeNull();
  expect(dockBox!.x).toBeGreaterThanOrEqual(0);
  expect(dockBox!.x + dockBox!.width).toBeLessThanOrEqual(390);

  const navButtons = page.locator('.pagenav--practice .btn--nav');
  await expect(navButtons).toHaveCount(2);
  const heights = await navButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().height),
  );
  for (const height of heights) {
    expect(height, 'practice navigation button still looks bulky').toBeLessThanOrEqual(40);
  }

  /* Secondary utilities stay behind one quiet overflow control. */
  const more = page.locator('.practice-tools__trigger');
  await expect(more).toBeVisible();
  await more.click();
  await expect(page.locator('.practice-tools__panel')).toBeVisible();
  await expect(page.locator('.practice-tools__panel')).toContainText('תוכן');
  await expect(page.locator('.practice-tools__panel')).not.toContainText('הדפס');
});
