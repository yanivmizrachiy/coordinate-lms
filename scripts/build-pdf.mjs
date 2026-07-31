/* בונה את public/hoveret.pdf — החוברת המלאה כקובץ מוכן להורדה.

   „כפתורים של הורדה והדפסה צריכים להיות שונים": ההורדה נותנת את הקובץ הזה
   מיד, בלי חלון הדפסה. הקובץ נוצר ממנוע ההדפסה של Chromium על התצוגה
   הרציפה (#/print) — אותם דפים בדיוק שהמדפסת מקבלת.

   הרצה: npm run build && npm run pdf && npm run build
   (הבנייה השנייה מכניסה את הקובץ הטרי אל dist/.)                       */
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { mkdirSync } from 'node:fs';

const server = await preview({ preview: { port: 4177, strictPort: true } });
const url = 'http://localhost:4177/#/print';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
await page.goto(url, { waitUntil: 'networkidle' });
// כל 79 הגיליונות (שער + תוכן + 77) חייבים להיות בעץ לפני שמודדים
await page.waitForFunction(() => document.querySelectorAll('.book > .sheet').length >= 79, null, { timeout: 30_000 });
// fitSheets מסיים לגדול אחרי הריצה הדחויה שלו
await page.waitForTimeout(3_000);

mkdirSync('public', { recursive: true });
await page.pdf({
  path: 'public/hoveret.pdf',
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});

// הגרסה בשחור-לבן — אותם דפים, עם מחלקת ההדפסה החסכונית
await page.evaluate(() => document.body.classList.add('bw-print'));
await page.waitForTimeout(400);
await page.pdf({
  path: 'public/hoveret-bw.pdf',
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();
await new Promise((resolve) => server.httpServer.close(resolve));
console.log('public/hoveret.pdf written');
