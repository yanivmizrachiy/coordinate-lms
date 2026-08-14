import { expect, test, type Page } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

async function registerStudent(page: Page, suffix: string): Promise<void> {
  await page.goto('/#/login');
  await page.getByPlaceholder('שם מלא').fill('תלמיד בדיקה ' + suffix);
  await page.getByPlaceholder('שם משתמש').fill('student_' + suffix);
  await page.getByPlaceholder('כתובת אימייל').fill(`student-${suffix}@example.test`);
  await page.getByPlaceholder('סיסמה — לפחות 10 תווים, כולל אות ומספר')
    .fill('student-password-' + suffix + '1');
  await page.getByPlaceholder('בית ספר').fill('בית ספר בדיקה');
  await page.getByPlaceholder('עיר').fill('ירושלים');
  await page.getByPlaceholder('כיתה').fill('ז1');
  await page.getByRole('button', { name: 'הרשמה והפעלת שמירה ודוחות' }).click();
  await expect(page).toHaveURL(/#\/workbook\/1$/);
}

test('registered three-attempt state survives reload and never resets', async ({ page }) => {
  await registerStudent(page, 'attempts');
  await page.goto('/#/workbook/10');

  for (let expectedAttempts = 1; expectedAttempts <= 3; expectedAttempts += 1) {
    const target = page.locator('[data-lms-qid="p10-q1"]');
    await expect(target).toBeVisible();
    await target.fill('תשובה שגויה');
    await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
    await expect(target).toHaveAttribute(
      'data-lms-attempts',
      String(expectedAttempts),
    );

    if (expectedAttempts < 3) await page.reload();
  }

  const locked = page.locator('[data-lms-qid="p10-q1"]');
  await expect(locked).toHaveAttribute('data-lms-state', 'locked');
  await expect(locked).toHaveAttribute('contenteditable', 'false');
  await page.reload();
  await expect(page.locator('[data-lms-qid="p10-q1"]'))
    .toHaveAttribute('data-lms-attempts', '3');
});

test('rapid duplicate submission creates one durable registered completion', async ({ page }) => {
  await registerStudent(page, 'duplicate');
  await page.goto('/#/workbook/19');
  const submit = page.getByRole('button', { name: 'סיימתי את הפעילות' });
  await expect(submit).toBeEnabled();

  await submit.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });

  await expect(page.getByRole('button', { name: 'העמוד הוגש' }))
    .toBeDisabled();
  await expect(page.locator('.lms-panel__status'))
    .toContainText('ההגשה נשמרה בחשבון המקומי הרשום');

  const persisted = await page.evaluate(() => {
    const results = JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, { pageNumber: number; score: number }>;
    const activity = JSON.parse(
      localStorage.getItem('coordinate_lms_activity_v2') || '[]',
    ) as Array<{ pageNumber: number; type: string }>;
    return {
      results: Object.values(results).filter((result) => result.pageNumber === 19),
      submissions: activity.filter(
        (event) => event.pageNumber === 19 && event.type === 'page_submit',
      ),
    };
  });

  expect(persisted.results).toHaveLength(1);
  expect(persisted.results[0]?.score).toBe(100);
  expect(persisted.submissions).toHaveLength(1);

  await page.reload();
  await expect(page.getByRole('button', { name: 'העמוד הוגש' }))
    .toBeDisabled();
});
