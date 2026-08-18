import { test, expect } from '@playwright/test';

/* The district badge must stand clear of the film — the invariant this file has
   always guarded. On the landing the badge lives in the dark top bar and the
   film in its own section card, so they must be visible and disjoint on every
   viewport, the tall phone included. */
test('the district badge stays outside the film', async ({ page }) => {
  await page.goto('/#/');
  const badge = page.locator('.ls-topbar__logo');
  const film = page.locator('#opening .ls-viewer');
  await expect(badge).toBeVisible();
  await expect(film).toBeVisible();
  const [b, f] = await Promise.all([badge.boundingBox(), film.boundingBox()]);
  expect(b && f, 'badge or film not measurable').toBeTruthy();
  const overlap =
    b!.x < f!.x + f!.width && f!.x < b!.x + b!.width &&
    b!.y < f!.y + f!.height && f!.y < b!.y + b!.height;
  expect(overlap, 'the badge overlaps the film').toBe(false);
});
