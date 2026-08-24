import { test, expect } from '@playwright/test';

test('every sheet keeps its A4 shape on a phone exactly as on a desktop', async ({ page }) => {
  /* The print surface is EXACTLY A4 — that is what reaches the printer. The
     practice surface renders the same canonical A4 page and then lays the
     interaction rows into it, so it keeps the A4 WIDTH but may legitimately
     grow TALLER than one printed page; clipping it to 297mm is what used to
     cut the last questions off a dense page on a phone. A practice sheet may
     therefore be taller than 1.41, never shorter and never wider. */
  for (const route of ['/#/print', '/#/workbook/18']) {
    const practice = route.includes('workbook');
    await page.goto(route);
    await page.locator('.sheet').first().waitFor();
    await page.waitForTimeout(600);
    const off = await page.evaluate((grows: boolean) => {
      const bad: string[] = [];
      document.querySelectorAll('.sheet').forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.width < 50) return;
        const ratio = r.height / r.width;
        const broken = grows ? ratio < 1.414 - 0.03 : Math.abs(ratio - 1.414) > 0.03;
        if (broken) bad.push(`sheet ${i}: ${ratio.toFixed(2)} instead of ${grows ? '≥1.41' : '1.41'}`);
      });
      return bad;
    }, practice);
    expect(off.slice(0, 5), `${route}: ${off.length} sheets lost their A4 shape — ${off.slice(0, 5).join(' | ')}`).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1);
  }
});

test('a spread instruction line was nearly full before it was stretched', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2500);
  const thin = await page.evaluate(() => {
    const bad: string[] = [];
    document.querySelectorAll<HTMLElement>('.sheet .spread').forEach((el) => {
      const w = el.offsetWidth;
      const scale = w ? el.getBoundingClientRect().width / w : 1;
      if (!w || !scale) return;
      const copy = el.cloneNode(true) as HTMLElement;
      copy.style.cssText = `position:absolute;left:-9999px;top:0;width:${w}px;text-align:start;text-align-last:auto`;
      el.parentElement!.appendChild(copy);
      const range = document.createRange();
      range.selectNodeContents(copy);
      const lines = new Map<number, { l: number; r: number }>();
      for (const r of range.getClientRects()) {
        if (r.width < 0.5) continue;
        const key = Math.round(r.top / 2);
        const line = lines.get(key) ?? { l: Infinity, r: -Infinity };
        lines.set(key, { l: Math.min(line.l, r.left), r: Math.max(line.r, r.right) });
      }
      const keys = [...lines.keys()].sort((a, b) => a - b);
      const lastKey = keys[keys.length - 1];
      const last = lastKey === undefined ? undefined : lines.get(lastKey);
      copy.remove();
      if (!last) return;
      const fill = Math.round((((last.r - last.l) / scale) / w) * 100);
      const n = el.closest('.sheet')?.querySelector('.sheet-number')?.textContent?.trim() ?? '?';
      if (fill < 45) bad.push(`page ${n}: last line fills ${fill}% — „${el.textContent!.trim().slice(0, 40)}”`);
    });
    return bad;
  });
  expect(thin, thin.join(' | ')).toEqual([]);
});

test('the footer rule is the same blue as the heading rule, on every sheet', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2500);
  const off = await page.evaluate(() => {
    const bad: string[] = [];
    document.querySelectorAll('.sheet').forEach((s, i) => {
      const foot = s.querySelector('.gz-footer');
      const head = s.querySelector('.sheet-header');
      if (!foot || !head || s.classList.contains('toc-sheet')) return;
      const f = getComputedStyle(foot).borderTopColor;
      const h = getComputedStyle(head).borderBottomColor;
      if (f !== h) bad.push(`sheet ${i}: footer ${f} vs heading ${h}`);
    });
    return bad;
  });
  expect(off.slice(0, 4), off.join(' | ')).toEqual([]);
});

test('every poster and its webp twin show the same picture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one decode of every poster is enough');
  const { readdirSync } = await import('node:fs');
  const posters = readdirSync('public/assets/games').filter((f) => f.endsWith('.png')).map((f) => `/assets/games/${f}`);
  expect(posters.length, 'no posters found to compare').toBeGreaterThan(0);
  await page.goto('/#/');
  const drifted = await page.evaluate(async (paths: string[]) => {
    const load = (src: string): Promise<HTMLImageElement> => new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => no(new Error(`cannot load ${src}`));
      img.src = src;
    });
    const pixels = async (src: string, w: number, h: number): Promise<Uint8ClampedArray> => {
      const img = await load(src);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      return c.getContext('2d')!.getImageData(0, 0, w, h).data;
    };
    const bad: string[] = [];
    const BLOCK = 32;
    for (const png of paths) {
      const twin = png.replace(/\.png$/, '.webp');
      const img = await load(png);
      const W = img.naturalWidth; const H = img.naturalHeight;
      const [a, b] = [await pixels(png, W, H), await pixels(twin, W, H)];
      let worst = 0;
      for (let by = 0; by + BLOCK <= H; by += BLOCK) {
        for (let bx = 0; bx + BLOCK <= W; bx += BLOCK) {
          let sum = 0;
          for (let y = by; y < by + BLOCK; y++) {
            for (let x = bx; x < bx + BLOCK; x++) {
              const i = (y * W + x) * 4;
              sum += Math.abs(a[i]! - b[i]!) + Math.abs(a[i + 1]! - b[i + 1]!) + Math.abs(a[i + 2]! - b[i + 2]!);
            }
          }
          const mean = sum / (BLOCK * BLOCK * 3);
          if (mean > worst) worst = mean;
        }
      }
      if (worst > 25) bad.push(`${png}: twin drifted — worst 32px block differs by ${worst.toFixed(0)}/255`);
    }
    return bad;
  }, posters);
  expect(drifted, drifted.join(' | ')).toEqual([]);
});

test('no error-correction card is nested inside another', async ({ page }) => {
  await page.goto('/#/print');
  await page.locator('.sheet').first().waitFor();
  await page.waitForTimeout(2000);
  const nested = await page.evaluate(() => document.querySelectorAll('.mist-card .mist-card').length);
  expect(nested, `${nested} error card(s) render nested inside another card`).toBe(0);
});
