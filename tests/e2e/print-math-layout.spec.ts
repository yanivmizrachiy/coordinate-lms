import { test, expect } from '@playwright/test';

test('every calculation really is painted left to right', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const d of document.querySelectorAll('.sheet .calc-ltr')) {
      const n = d.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const kids = [...d.children].filter((c) => c.getBoundingClientRect().width > 0);
      if (kids.length < 2) { out.push(`page ${n}: a calculation line did not lay out`); continue; }
      const first = kids[0]!.getBoundingClientRect().left;
      const last = kids[kids.length - 1]!.getBoundingClientRect().left;
      const text = (d as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
      if (first >= last) out.push(`page ${n}: „${text}” is painted right to left`);
    }
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});

test('inline maths reads left to right where it is painted', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    const R = (el: Element) => el.getBoundingClientRect();
    for (const span of document.querySelectorAll('.sheet .math-ltr')) {
      const txt = (span.textContent ?? '').trim();
      if (!/[=+−-]$/.test(txt)) continue;
      const next = span.nextSibling;
      if (!next || next.nodeType !== Node.TEXT_NODE) continue;
      const after = (next.textContent ?? '').trim();
      const m = after.match(/^[0-9(]+/);
      if (!m) continue;
      const rng = document.createRange();
      const start = (next.textContent ?? '').indexOf(m[0]);
      rng.setStart(next, start); rng.setEnd(next, start + m[0].length);
      const ob = rng.getBoundingClientRect(); const sb = R(span);
      if (ob.width && ob.left < sb.right - 2) {
        const n = span.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        out.push(`page ${n}: „${txt} ${m[0]}” is painted „${m[0]} ${txt}”`);
      }
    }
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});

test('each final answer sits on its own painted line', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    let seen = 0;
    for (const fin of document.querySelectorAll('.sheet .calc-final')) {
      const n = fin.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const rows = [...fin.querySelectorAll('.calc-final__row')].map((r) => r.getBoundingClientRect());
      seen += rows.length;
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1]!, b = rows[i]!;
        const overlaps = a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
        if (overlaps) out.push(`page ${n}: two final answers are painted over each other`);
      }
      const secs = [...(fin.closest('.calc-box')?.querySelectorAll('.calc-sec') ?? [])];
      if (secs.length === rows.length && rows.length === 2) {
        for (let i = 0; i < rows.length; i++) {
          const sb = secs[i]!.getBoundingClientRect();
          const centred = rows[i]!.left + rows[i]!.width / 2;
          if (centred < sb.left - 4 || centred > sb.right + 4) out.push(`page ${n}: an answer is not under its own working box`);
        }
      }
      const work = fin.closest('.calc-box')?.querySelector('.calc-work')?.getBoundingClientRect();
      if (work && rows.length && rows[0]!.top < work.bottom - 1) out.push(`page ${n}: the answer is not under the working slot`);
    }
    if (!seen) out.push('no final-answer rows were found at all');
    return [...new Set(out)];
  });
  expect(faults.length, faults.join(' | ')).toBe(0);
});
