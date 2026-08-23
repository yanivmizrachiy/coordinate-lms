import { test, expect } from '@playwright/test';

test('a Hebrew word never comes out in the wrong order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n: Node | null; (n = walk.nextNode()); ) {
      const s = n.textContent ?? '';
      if (!/[֐-׿]/.test(s) || !/['"]/.test(s)) continue;
      const host = (n as Text).parentElement;
      if (!host?.closest('.sheet')) continue;
      const at = (i: number) => { const r = document.createRange(); r.setStart(n!, i); r.setEnd(n!, i + 1); return r.getBoundingClientRect().x; };
      const run = [...s].map((c, i) => ({ c, i })).filter((o) => /[֐-׿'"]/.test(o.c));
      for (let k = 1; k < run.length; k++) {
        if (run[k]!.i !== run[k - 1]!.i + 1) continue;
        if (at(run[k]!.i) >= at(run[k - 1]!.i)) {
          const p = host.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
          out.push(`page ${p}: „${s.trim().slice(0, 24)}” comes out in the wrong order`);
          break;
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

test('no number is left sitting inside a box the learner writes in', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const g of document.querySelectorAll('.sheet .coordinate-grid')) {
      const svg = g.querySelector('svg');
      if (!svg) continue;
      const n = g.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      const boxes = [...svg.querySelectorAll('rect')]
        .filter((r) => (r.getAttribute('stroke') ?? '').toLowerCase() === '#1d4ed8')
        .map((r) => r.getBoundingClientRect());
      for (const t of svg.querySelectorAll('text')) {
        const b = t.getBoundingClientRect();
        if (!b.width) continue;
        if (boxes.some((x) => b.left < x.right - 1 && x.left < b.right - 1 && b.top < x.bottom - 1 && x.top < b.bottom - 1)) {
          out.push(`page ${n}: „${t.textContent!.trim()}” sits inside an answer box`);
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

test('the cover carries the artwork and nothing else', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media });
    const over = await page.evaluate(() => {
      const cover = document.querySelector('.cover-sheet');
      if (!cover) return ['there is no cover sheet'];
      const box = cover.getBoundingClientRect();
      const extra = [...cover.children]
        .filter((e) => !e.classList.contains('cover-image') && !e.classList.contains('cover-picture'))
        .map((e) => e.className);
      const loose = [...document.querySelectorAll('.book > *:not(.sheet)')]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.height && r.top < box.bottom && r.bottom > box.top; })
        .map((e) => `loose ${e.className} over the cover`);
      return [...extra, ...loose];
    });
    expect(over, `${media}: ${over.join(', ')}`).toHaveLength(0);
  }
  await page.emulateMedia({ media: 'screen' });
});
