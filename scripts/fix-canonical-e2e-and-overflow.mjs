import { readFile, writeFile } from 'node:fs/promises';

async function read(path) {
  return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
}

async function replaceFile(path, replacements) {
  let text = await read(path);
  let changed = false;
  for (const [before, after, label] of replacements) {
    if (text.includes(after)) continue;
    if (!text.includes(before)) throw new Error(`${path}: missing ${label}`);
    text = text.replace(before, after);
    changed = true;
  }
  if (changed) await writeFile(path, text, 'utf8');
}

await replaceFile('tests/e2e/lms-accessibility.spec.ts', [
  [
`test('answer fields keep meaningful labels and support keyboard completion', async ({ page }) => {
  await page.goto('/#/workbook/10');
  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute('aria-label', /מקום להשלמת|תשובה.+:/);

  await target.focus();
  await expect(target).toBeFocused();
  await target.fill('שמאל');
  await target.press('Enter');
  await expect(target).not.toBeFocused();
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');

  const status = page.locator('.lms-panel__status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
});`,
`test('answer fields keep meaningful labels and support keyboard completion', async ({ page }) => {
  await page.goto('/#/workbook/10');
  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute('aria-label', /מקום להשלמת|תשובה.+:/);

  const answers = JSON.parse(
    (await target.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers[0]).toBeTruthy();

  await target.focus();
  await expect(target).toBeFocused();
  await target.fill(answers[0]!);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');
  await target.press('Enter');
  await expect(target).not.toBeFocused();

  const status = page.locator('.lms-panel__status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
});`,
    'dynamic accessible answer',
  ],
  [
`  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();`,
`  const keyed = page.locator('[data-lms-answers]').filter({ hasNot: page.locator('input') }).first();
  if (await keyed.count()) {
    const answers = JSON.parse((await keyed.getAttribute('data-lms-answers')) || '[]') as string[];
    if (answers[0] && (await keyed.getAttribute('contenteditable')) === 'true') {
      await keyed.fill(answers[0]);
      await expect(keyed).toHaveAttribute('data-lms-state', 'correct');
    }
  }

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.lms-panel')).toBeHidden();
  await expect(page.locator('.lms-grid-answer').first()).toBeHidden();
  if (await keyed.count()) {
    expect(await keyed.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('none');
  }`,
    'print hides immediate check',
  ],
]);

await replaceFile('tests/e2e/lms-implicit-answers.spec.ts', [
  [
`  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  await target.fill('שמאל');
  await page.getByRole('button', { name: 'בדיקת תשובות' }).click();
  await expect(target).toHaveAttribute('data-lms-state', 'correct');`,
`  const target = page.locator('[data-lms-qid="p10-q1"]');
  await expect(target).toBeVisible();
  const answers = JSON.parse(
    (await target.getAttribute('data-lms-answers')) || '[]',
  ) as string[];
  expect(answers[0]).toBeTruthy();
  await target.fill(answers[0]!);
  await expect(target).toHaveAttribute('data-lms-state', 'correct');`,
    'dynamic explicit answer',
  ],
]);

await replaceFile('tests/e2e/lms-reliability.spec.ts', [
  ["await page.goto('/#/workbook/43');", "await page.goto('/#/workbook/19');", 'targetless page route'],
  ["result.pageNumber === 43", "result.pageNumber === 19", 'targetless result filter'],
  ["event.pageNumber === 43", "event.pageNumber === 19", 'targetless activity filter'],
]);

await replaceFile('tests/e2e/classroom-simulation.spec.ts', [
  ["toContainText('מתוך 1061')", "toContainText('מתוך 1162')", 'canonical target count'],
]);

let smoke = await read('tests/e2e/smoke.spec.ts');
smoke = smoke.replaceAll('נבחרו 77 עמודים', 'נבחרו 78 עמודים');
smoke = smoke.replaceAll('דף עבודה מספר 5 מתוך 77', 'דף עבודה מספר 5 מתוך 78');
const gameStart = "test('a game sheet reveals its answer when solved correctly'";
const gameEnd = '/* The screen always shows colour.';
if (!smoke.includes("test('numbered workbook pages do not mount retired runtime games'")) {
  const start = smoke.indexOf(gameStart);
  const end = smoke.indexOf(gameEnd, start);
  if (start < 0 || end < 0) throw new Error('smoke.spec.ts: missing retired game test block');
  smoke = smoke.slice(0, start) +
`test('numbered workbook pages do not mount retired runtime games', async ({ page }) => {
  await page.goto('/#/print');
  await page.waitForTimeout(3500);
  await expect(page.locator('[data-game-host]')).toHaveCount(0);
});

` + smoke.slice(end);
}
await writeFile('tests/e2e/smoke.spec.ts', smoke, 'utf8');

await replaceFile('src/lib/fitSheet.ts', [
  [
`export function fitSheet(sheet: HTMLElement): void {
  const content = sheet.querySelector<HTMLElement>('.sheet-content');`,
`export function fitSheet(sheet: HTMLElement): void {
  sheet.classList.remove('sheet--overflow-tight');
  const content = sheet.querySelector<HTMLElement>('.sheet-content');`,
    'reset adaptive overflow class',
  ],
  [
`  /* Spare height goes to the drawings first — a bigger system is worth more to`,
`  /* Canonical pages occasionally become a few pixels taller after wording or
     font changes. Tighten spacing only on a sheet that actually overflows; the
     authored page content and every printable element remain unchanged. */
  if (room() < 0) sheet.classList.add('sheet--overflow-tight');

  /* Spare height goes to the drawings first — a bigger system is worth more to`,
    'adaptive overflow activation',
  ],
]);

let css = await read('src/styles/workbook.css');
const marker = '/* Adaptive A4 overflow recovery — content-preserving. */';
if (!css.includes(marker)) {
  css += `

${marker}
.calc-sym__math sub {
  font-size: 1em;
  line-height: 0;
  vertical-align: -0.16em;
}

@media print {
  .sheet.sheet--overflow-tight .sheet-header {
    padding-bottom: 3px;
    margin-bottom: 4px;
  }
  .sheet.sheet--overflow-tight .q-card {
    padding: 5px 8px;
  }
  .sheet.sheet--overflow-tight .q-card h3 {
    margin: -5px -8px 4px;
    padding: 3px 7px;
    min-height: 1.8em;
  }
  .sheet.sheet--overflow-tight .tasks {
    margin-block: 2px;
  }
  .sheet.sheet--overflow-tight .tasks li {
    margin-block: 1px;
  }
  .sheet.sheet--overflow-tight .rule-box,
  .sheet.sheet--overflow-tight .note-box {
    padding: 4px 7px;
    margin-block: 2px 3px;
  }
  .sheet.sheet--overflow-tight .word-bank {
    padding: 3px 7px;
    margin-block: 2px 3px;
  }
  .sheet.sheet--overflow-tight .calc-pair,
  .sheet.sheet--overflow-tight .choice-row {
    margin-block: 1px 2px;
  }
  .sheet.sheet--overflow-tight .sheet-content {
    padding-bottom: 13mm;
  }
}
`;
  await writeFile('src/styles/workbook.css', css, 'utf8');
}

console.log('Canonical E2E expectations and adaptive A4 overflow handling updated.');
