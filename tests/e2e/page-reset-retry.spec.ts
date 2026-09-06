import { expect, test } from '@playwright/test';

const GUEST_SESSION_KEY = 'coordinate_lms_guest_practice_session_v1';
const DRAFTS_KEY = 'coordinate_lms_drafts_v2';

async function acceptNextDialog(page: import('@playwright/test').Page): Promise<void> {
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
}

async function waitForDocumentReload(
  page: import('@playwright/test').Page,
  previousTimeOrigin: number,
): Promise<void> {
  await page.waitForFunction(
    (before) => performance.timeOrigin !== before,
    previousTimeOrigin,
  );
  await expect(page.locator('[data-lms-qid="p1-q1"]')).toBeVisible();
}

async function submitFirstQuestion(page: import('@playwright/test').Page): Promise<void> {
  const target = page.locator('[data-lms-qid="p1-q1"]');
  const question = target.locator(
    'xpath=ancestor::*[self::li or self::tr or self::p or contains(concat(" ", normalize-space(@class), " "), " completion-sentence ")][1]',
  );
  await question.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).click();
}

async function waitForGuestDraft(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(
    ({ sessionKey, draftsKey }) => {
      if (!sessionStorage.getItem(sessionKey)) return false;
      const drafts = JSON.parse(localStorage.getItem(draftsKey) || '{}') as Record<string, unknown>;
      return drafts['guest:1'] !== undefined;
    },
    { sessionKey: GUEST_SESSION_KEY, draftsKey: DRAFTS_KEY },
  );
}

test('clear preserves checked attempts and retry starts a genuinely fresh guest run', async ({ page }) => {
  await page.goto('/#/workbook/1');

  const target = page.locator('[data-lms-qid="p1-q1"]');
  await target.fill('z');
  await submitFirstQuestion(page);
  await expect(target).toHaveAttribute('data-lms-state', 'wrong');
  await expect(target).toHaveAttribute('data-lms-attempts', '1');

  /* The question-check handler persists asynchronously after painting its
     verdict. Wait for that durable boundary before testing an immediately
     following clear action; otherwise the test races the write it is meant to
     preserve rather than exercising the user-facing reset contract. */
  await waitForGuestDraft(page);

  const guestSessionBeforeClear = await page.evaluate(
    (key) => sessionStorage.getItem(key),
    GUEST_SESSION_KEY,
  );
  expect(guestSessionBeforeClear).not.toBeNull();

  const clearButton = page.getByRole('button', { name: 'ניקוי התשובות בעמוד', exact: true });
  await expect(clearButton).toBeVisible();
  const beforeClearReload = await page.evaluate(() => performance.timeOrigin);
  await acceptNextDialog(page);
  await clearButton.click();
  await waitForDocumentReload(page, beforeClearReload);

  const guestSessionAfterClear = await page.evaluate(
    (key) => sessionStorage.getItem(key),
    GUEST_SESSION_KEY,
  );
  expect(guestSessionAfterClear).toBe(guestSessionBeforeClear);

  const cleared = page.locator('[data-lms-qid="p1-q1"]');
  await expect(cleared).toHaveText('');
  await expect(cleared).toHaveAttribute('data-lms-attempts', '1');
  await expect(cleared).toHaveAttribute('data-lms-state', 'wrong');

  const submittedBefore = await page.evaluate(() => {
    const drafts = JSON.parse(localStorage.getItem('coordinate_lms_drafts_v2') || '{}') as Record<string, {
      startedAt?: number;
    }>;
    return drafts['guest:1']?.startedAt ?? null;
  });
  expect(submittedBefore).not.toBeNull();

  await page.getByRole('button', { name: 'הגשת העמוד וקבלת ציון', exact: true }).click();
  await expect(page.locator('.lms-score__num')).toBeVisible();

  const retryButton = page.getByRole('button', { name: 'לתרגל שוב מההתחלה', exact: true });
  await expect(retryButton).toBeVisible();

  const guestResultAfterSubmit = await page.evaluate(() => {
    const results = JSON.parse(localStorage.getItem('coordinate_lms_results_v2') || '{}') as Record<string, unknown>;
    return results['guest:1'];
  });
  expect(guestResultAfterSubmit).toBeUndefined();

  const beforeRetryReload = await page.evaluate(() => performance.timeOrigin);
  await acceptNextDialog(page);
  await retryButton.click();
  await waitForDocumentReload(page, beforeRetryReload);

  const fresh = page.locator('[data-lms-qid="p1-q1"]');
  await expect(fresh).toHaveText('');
  await expect(fresh).toHaveAttribute('data-lms-attempts', '0');
  await expect(fresh).toHaveAttribute('data-lms-state', 'empty');
  await expect(page.locator('.lms-score__num')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ניקוי התשובות בעמוד', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'לתרגל שוב מההתחלה', exact: true })).toBeHidden();

  const afterRetry = await page.evaluate(() => {
    const drafts = JSON.parse(localStorage.getItem('coordinate_lms_drafts_v2') || '{}') as Record<string, {
      startedAt?: number;
      submitted?: boolean;
      questions?: Record<string, unknown>;
    }>;
    const results = JSON.parse(localStorage.getItem('coordinate_lms_results_v2') || '{}') as Record<string, unknown>;
    return {
      draft: drafts['guest:1'],
      guestResult: results['guest:1'],
    };
  });

  expect(afterRetry.draft?.submitted).toBe(false);
  expect(afterRetry.draft?.startedAt).toBeGreaterThan(submittedBefore as number);
  expect(afterRetry.draft?.questions).toEqual({});
  expect(afterRetry.guestResult).toBeUndefined();
});
