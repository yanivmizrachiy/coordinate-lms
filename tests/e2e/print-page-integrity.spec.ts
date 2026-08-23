import { test, expect } from '@playwright/test';

test('the origin is never labelled twice', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const doubled = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet .coordinate-grid svg')]
      .map((svg) => {
        const os = [...svg.querySelectorAll('text')].filter((t) => t.textContent!.trim() === 'O');
        const n = svg.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
        return os.length > 1 ? `page ${n}` : null;
      })
      .filter(Boolean),
  );
  expect(doubled, doubled.join(', ')).toHaveLength(0);
});

test('the canonical footer sits whole — and in the SAME place — on every sheet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media });
    const faults = await page.evaluate(() => {
      const out: string[] = [];
      const geo: Array<{ n: string; up: number; left: number; right: number }> = [];
      for (const sheet of document.querySelectorAll('.book > .sheet')) {
        const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
        const f = sheet.querySelector('.gz-footer');
        if (!f) { if (!sheet.classList.contains('cover-sheet')) out.push(`page ${n}: no footer`); continue; }
        const fr = f.getBoundingClientRect();
        const sr = sheet.getBoundingClientRect();
        if (!fr.height) { out.push(`page ${n}: footer collapsed`); continue; }
        if (fr.bottom > sr.bottom + 1) out.push(`page ${n}: footer clipped`);
        geo.push({ n, up: sr.bottom - fr.bottom, left: fr.left - sr.left, right: sr.right - fr.right });
      }
      const base = geo[0];
      if (base) {
        for (const g of geo) {
          if (Math.abs(g.up - base.up) > 2) out.push(`page ${g.n}: footer height differs (${Math.round(g.up)} vs ${Math.round(base.up)})`);
          if (Math.abs(g.left - base.left) > 2 || Math.abs(g.right - base.right) > 2) out.push(`page ${g.n}: footer insets differ`);
        }
      }
      return [...new Set(out)];
    });
    expect(faults, `${media}: ${faults.join(' | ')}`).toEqual([]);
  }
  await page.emulateMedia({ media: 'screen' });
});

test('no drawing escapes its card and no two drawings overlap', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const faults = await page.evaluate(() => {
    const out: string[] = [];
    for (const sheet of document.querySelectorAll('.book > .sheet')) {
      const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
      const grids = [...sheet.querySelectorAll<HTMLElement>('.coordinate-grid')];
      for (const g of grids) {
        const r = g.getBoundingClientRect();
        const host = g.parentElement!.getBoundingClientRect();
        if (r.width > host.width + 2 || r.left < host.left - 2 || r.right > host.right + 2) out.push(`page ${n}: drawing ${Math.round(r.width)}px wide in a ${Math.round(host.width)}px card`);
      }
      for (let i = 0; i < grids.length; i++) {
        for (let j = i + 1; j < grids.length; j++) {
          const a = grids[i]!.getBoundingClientRect();
          const b = grids[j]!.getBoundingClientRect();
          const overlap = a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
          if (overlap) out.push(`page ${n}: two drawings painted over each other`);
        }
      }
    }
    return [...new Set(out)];
  });
  expect(faults, faults.join(' | ')).toHaveLength(0);
});

test('no sheet leaves a band of white above its footer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the A4 sheet');
  await page.goto('/#/print');
  await page.waitForTimeout(9000);
  const bands = await page.evaluate(() =>
    [...document.querySelectorAll('.book > .sheet')].flatMap((sheet) => {
      if (sheet.classList.contains('cover-sheet') || sheet.classList.contains('poster-sheet')) return [];
      const n = sheet.querySelector('.sheet-number')?.textContent?.trim() ?? '(cover)';
      const f = sheet.querySelector('.gz-footer');
      const content = sheet.querySelector('.sheet-content');
      if (!f || !content) return [];
      let lowest = 0;
      for (const el of content.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.height && r.bottom > lowest) lowest = r.bottom;
      }
      const gap = f.getBoundingClientRect().top - lowest;
      return gap > 120 ? [`page ${n}: ${Math.round(gap)}px of unused page`] : [];
    }),
  );
  expect(bands, bands.join(' | ')).toEqual([]);
});
