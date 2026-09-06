import { test, expect } from '@playwright/test';

const phones = [
  { name: 'small-android', width: 320, height: 568 },
  { name: 'android-compact', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-modern', width: 390, height: 844 },
  { name: 'large-phone', width: 430, height: 932 },
  { name: 'phone-landscape', width: 667, height: 375 },
];

for (const phone of phones) {
  test(`welcome keeps both practice choices above the fold — ${phone.name}`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto('/#/');

    const withRegistration = page.getByRole('button', { name: 'לתרגל עם רישום', exact: true });
    const withoutRegistration = page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true });

    await expect(withRegistration).toBeVisible();
    await expect(withoutRegistration).toBeVisible();
    await expect(page.locator('.lms-welcome__summary')).toHaveCount(2);

    const geometry = await page.evaluate(() => {
      const root = document.querySelector('.lms-welcome') as HTMLElement | null;
      const buttons = [...document.querySelectorAll('.lms-welcome__choice')] as HTMLElement[];
      return {
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        scrollHeight: root?.scrollHeight ?? 0,
        clientHeight: root?.clientHeight ?? 0,
        scrollWidth: root?.scrollWidth ?? 0,
        clientWidth: root?.clientWidth ?? 0,
        buttons: buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
        }),
      };
    });

    expect(geometry.scrollHeight, `${phone.name}: welcome vertically scrolls`).toBeLessThanOrEqual(geometry.clientHeight + 1);
    expect(geometry.scrollWidth, `${phone.name}: welcome horizontally scrolls`).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(geometry.buttons).toHaveLength(2);

    for (const box of geometry.buttons) {
      expect(box.top, `${phone.name}: button starts above viewport`).toBeGreaterThanOrEqual(0);
      expect(box.bottom, `${phone.name}: button falls below viewport`).toBeLessThanOrEqual(geometry.viewportHeight);
      expect(box.left, `${phone.name}: button starts left of viewport`).toBeGreaterThanOrEqual(0);
      expect(box.right, `${phone.name}: button exceeds viewport width`).toBeLessThanOrEqual(geometry.viewportWidth);
    }
  });
}

test('welcome choices navigate to the correct practice modes', async ({ page }) => {
  await page.goto('/#/');
  const previousDocument = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('button', { name: 'לתרגל בלי רישום', exact: true }).click();
  await expect(page).toHaveURL(/#\/workbook\/1$/);
  await page.waitForFunction(
    (before) => performance.timeOrigin !== before,
    previousDocument,
  );

  await page.goto('/#/');
  await page.getByRole('button', { name: 'לתרגל עם רישום', exact: true }).click();
  await expect(page).toHaveURL(/#\/login$/);
});
