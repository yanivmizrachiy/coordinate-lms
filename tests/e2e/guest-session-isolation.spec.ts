import { expect, test } from '@playwright/test';

async function submitFirstQuestion(page: import('@playwright/test').Page): Promise<void> {
  const target = page.locator('[data-lms-qid="p1-q1"]');
  const question = target.locator(
    'xpath=ancestor::*[self::li or self::tr or self::p or contains(concat(" ", normalize-space(@class), " "), " completion-sentence ")][1]',
  );
  await question.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).click();
}

async function guestStorageState(page: import('@playwright/test').Page): Promise<{
  sessionId: string | null;
  sessionStartedAt: number | null;
  guestDraft: unknown;
}> {
  return page.evaluate(() => {
    const rawSession = sessionStorage.getItem('coordinate_lms_guest_practice_session_v1');
    const rawDrafts = localStorage.getItem('coordinate_lms_drafts_v2');
    const session = rawSession
      ? JSON.parse(rawSession) as { id?: unknown; startedAt?: unknown }
      : null;
    const drafts = rawDrafts ? JSON.parse(rawDrafts) as Record<string, unknown> : {};
    return {
      sessionId: typeof session?.id === 'string' ? session.id : null,
      sessionStartedAt: typeof session?.startedAt === 'number' ? session.startedAt : null,
      guestDraft: drafts['guest:1'],
    };
  });
}

test('guest reload keeps this session but a new guest start is clean', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true }).click();
  await expect(page).toHaveURL(/#\/workbook\/1$/);

  const initialSession = await guestStorageState(page);
  expect(initialSession.sessionId).not.toBeNull();
  expect(initialSession.sessionStartedAt).not.toBeNull();

  const target = page.locator('[data-lms-qid="p1-q1"]');
  await target.fill('x');
  await submitFirstQuestion(page);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  const firstSession = await guestStorageState(page);
  expect(firstSession.sessionId).toBe(initialSession.sessionId);

  // The contract that matters to the learner is continuity after a real page
  // reload. This intentionally avoids coupling the regression to one internal
  // localStorage write timing; if persistence is genuinely broken, the two
  // assertions below fail on the reloaded UI itself.
  await page.reload();
  const reloaded = page.locator('[data-lms-qid="p1-q1"]');
  await expect(reloaded).toHaveText('x');
  await expect(reloaded).toHaveAttribute('data-lms-state', 'correct');
  const afterReload = await guestStorageState(page);
  expect(afterReload.sessionId).toBe(firstSession.sessionId);

  // Choosing unregistered practice again explicitly starts a different learner session.
  await page.goto('/#/');
  await page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true }).click();
  await expect(page).toHaveURL(/#\/workbook\/1$/);

  const freshStorage = await guestStorageState(page);
  expect(freshStorage.sessionId).not.toBe(firstSession.sessionId);
  expect(freshStorage.guestDraft).toBeUndefined();

  const fresh = page.locator('[data-lms-qid="p1-q1"]');
  await expect(fresh).toHaveText('');
  await expect(fresh).not.toHaveAttribute('data-lms-state', 'correct');
});
