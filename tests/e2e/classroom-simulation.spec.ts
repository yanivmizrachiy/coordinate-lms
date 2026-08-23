import { readFile } from 'node:fs/promises';
import {
  expect,
  test,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test';

interface StudentData {
  accounts: Record<string, unknown>;
  drafts: Record<string, unknown>;
  results: Record<string, unknown>;
  activity: unknown[];
}

async function register(
  page: Page,
  fullName: string,
  school: string,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/#/login');
  await page.getByPlaceholder('שם מלא').fill(fullName);
  await page.getByPlaceholder('בית ספר').fill(school);
  await page.getByPlaceholder('כתובת אימייל').fill(email);
  await page.getByPlaceholder('סיסמה — לפחות 6 תווים').fill(password);
  await page.getByRole('button', { name: 'הרשמה ושמירת הציון' }).click();
  await expect(page).toHaveURL(/#\/workbook\/2$/);
}

async function studentSnapshot(page: Page): Promise<StudentData> {
  return page.evaluate(() => ({
    accounts: JSON.parse(
      localStorage.getItem('coordinate_lms_accounts_v2') || '{}',
    ) as Record<string, unknown>,
    drafts: JSON.parse(
      localStorage.getItem('coordinate_lms_drafts_v2') || '{}',
    ) as Record<string, unknown>,
    results: JSON.parse(
      localStorage.getItem('coordinate_lms_results_v2') || '{}',
    ) as Record<string, unknown>,
    activity: JSON.parse(
      localStorage.getItem('coordinate_lms_activity_v2') || '[]',
    ) as unknown[],
  }));
}

test('isolated two-student and teacher fallback workflow is explicit and durable', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One full multi-context run is sufficient.');
  const isolated: BrowserContextOptions = {
    baseURL: 'http://localhost:4319',
    storageState: { cookies: [], origins: [] },
  };
  const studentAContext = await browser.newContext(isolated);
  const studentBContext = await browser.newContext(isolated);
  const teacherContext = await browser.newContext(isolated);
  const studentA = await studentAContext.newPage();
  const studentB = await studentBContext.newPage();
  const teacher = await teacherContext.newPage();

  try {
    await studentA.goto('/#/workbook/1');
    await expect(studentA.locator('.sheet')).toHaveCount(1);
    await expect(studentA.locator('.lms-panel__identity')).toHaveCount(0);
    await studentA.locator('[data-lms-qid="p1-q1"]').fill('טיוטת אורח');
    await expect
      .poll(() =>
        studentA.evaluate(() =>
          Boolean(
            (JSON.parse(
              localStorage.getItem('coordinate_lms_drafts_v2') || '{}',
            ) as Record<string, unknown>)['guest:1'],
          ),
        ),
      )
      .toBe(true);
    await register(
      studentA,
      'נועה כהן',
      'noa',
      'noa-browser@example.test',
      'student-a-password',
    );
    const target = studentA.locator('[data-lms-qid="p2-q1"]');
    await target.fill('תשובה שגויה');
    const question = target.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " q-card ")][1]',
    );
    await question.getByRole('button', { name: 'להגיש שאלה לבדיקה' }).click();
    await expect(target).toHaveAttribute('data-lms-attempts', '1');
    await studentA.reload();
    await expect(studentA.locator('[data-lms-qid="p2-q1"]'))
      .toHaveAttribute('data-lms-attempts', '1');
    await studentA.goto('/#/login');
    await studentA.getByRole('button', { name: 'התנתקות' }).click();
    await expect(studentA.getByRole('button', { name: 'כבר נרשמתי — התחברות' }))
      .toBeVisible();
    await studentA.getByRole('button', { name: 'כבר נרשמתי — התחברות' }).click();
    await studentA.getByPlaceholder('כתובת אימייל').fill('noa-browser@example.test');
    await studentA.getByPlaceholder('סיסמה — לפחות 6 תווים').fill('student-a-password');
    await studentA.getByRole('button', { name: 'התחברות' }).click();
    await expect(studentA).toHaveURL(/#\/workbook\/2$/);

    await register(
      studentB,
      'אורי לוי',
      'uri',
      'uri-browser@example.test',
      'student-b-password',
    );
    await studentB.locator('[data-lms-qid="p2-q1"]').fill('טיוטת תלמיד ב');
    await expect
      .poll(() =>
        studentB.evaluate(() =>
          Object.keys(
            JSON.parse(
              localStorage.getItem('coordinate_lms_drafts_v2') || '{}',
            ) as Record<string, unknown>,
          ).some((key) => key.endsWith(':2')),
        ),
      )
      .toBe(true);

    const [dataA, dataB] = await Promise.all([
      studentSnapshot(studentA),
      studentSnapshot(studentB),
    ]);
    await register(
      teacher,
      'מורה',
      'teacher',
      'yanivmiz77@gmail.com',
      'teacher-password',
    );
    await teacher.evaluate(
      ([left, right]) => {
        const currentAccounts = JSON.parse(
          localStorage.getItem('coordinate_lms_accounts_v2') || '{}',
        ) as Record<string, unknown>;
        localStorage.setItem(
          'coordinate_lms_accounts_v2',
          JSON.stringify({ ...currentAccounts, ...left.accounts, ...right.accounts }),
        );
        localStorage.setItem(
          'coordinate_lms_drafts_v2',
          JSON.stringify({ ...left.drafts, ...right.drafts }),
        );
        localStorage.setItem(
          'coordinate_lms_results_v2',
          JSON.stringify({ ...left.results, ...right.results }),
        );
        localStorage.setItem(
          'coordinate_lms_activity_v2',
          JSON.stringify([...left.activity, ...right.activity]),
        );
      },
      [dataA, dataB] as const,
    );
    await teacher.goto('/#/admin');
    await expect(teacher.locator('.lms-mode--local'))
      .toContainText('מוצגים נתונים מהמכשיר הזה בלבד');
    await expect(teacher.getByText('נועה כהן')).toBeVisible();
    await expect(teacher.getByText('אורי לוי')).toBeVisible();
    await expect(teacher.getByText('מורה', { exact: true })).toHaveCount(0);

    const downloadPromise = teacher.waitForEvent('download');
    await teacher.getByRole('button', { name: 'ייצוא CSV מלא' }).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).not.toBeNull();
    const csv = await readFile(path!, 'utf8');
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('נועה כהן');
    expect(csv).toContain('אורי לוי');
    expect(csv.trimEnd().split('\r\n')).toHaveLength(157);

    await teacher.goto('/#/keys');
    await expect(teacher.getByRole('heading', { name: 'סטודיו סקירת תשובות' }))
      .toBeVisible();
    await expect(teacher.locator('.lms-panel__status')).toContainText('מתוך 1150');
    await teacher.getByLabel('סינון לפי מצב סקירה').selectOption('unreviewed');
    await expect(teacher.locator('.lms-keys__card').first()).toBeVisible();
  } finally {
    await Promise.all([
      studentAContext.close(),
      studentBContext.close(),
      teacherContext.close(),
    ]);
  }
});