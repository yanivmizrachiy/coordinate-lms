/* בונה את public/hoveret.pdf — החוברת המלאה כקובץ מוכן להורדה.

   „כפתורים של הורדה והדפסה צריכים להיות שונים": ההורדה נותנת את הקובץ הזה
   מיד, בלי חלון הדפסה. הקובץ נוצר ממנוע ההדפסה של Chromium על התצוגה
   הרציפה (#/print) — אותם דפים בדיוק שהמדפסת מקבלת.

   הרצה: npm run build && npm run pdf && npm run build
   (הבנייה השנייה מכניסה את הקובץ הטרי אל dist/.)                       */
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, PDFName } from 'pdf-lib';

const server = await preview({ preview: { port: 4177, strictPort: true } });
const url = 'http://localhost:4177/#/print';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
await page.goto(url, { waitUntil: 'networkidle' });
// כל 80 הגיליונות (שער + תוכן + 78) חייבים להיות בעץ לפני שמודדים
await page.waitForFunction(() => document.querySelectorAll('.book > .sheet').length >= 80, null, { timeout: 30_000 });
// fitSheets מסיים לגדול אחרי הריצה הדחויה שלו
await page.waitForTimeout(3_000);

/* מפת הגיליונות: גיליון שגבוה מ-A4 (שעשועון, פוסטר) נשפך ליותר מעמוד PDF
   אחד, ולכן „עמוד n = n+2" משקר אחרי הגיליון הנשפך הראשון — וגזירת דפים
   נבחרים הייתה מחזירה עמודים שגויים. גיליון רגיל הוא A4 קשיח עם overflow
   hidden = עמוד אחד תמיד; לכל גיליון גדל (game-sheet / poster-sheet) סופרים
   אמת-קרקע: מרנדרים אותו לבדו ל-PDF וסופרים כמה עמודים יצאו. חיקוי לפי
   גובה נמדד כבר שיקר ב-3 עמודים. */
const sheets = await page.evaluate(() =>
  [...document.querySelectorAll('.book > .sheet')].map((el) => {
    const num = el.querySelector('.sheet-number');
    return { n: num ? Number(num.textContent) : null };
  }),
);
/* אמת-קרקע בקובץ אחד: עוגן-קישור בלתי-נראה בראש כל גיליון שורד את ההדפסה
   כהערת-קישור על עמוד ה-PDF שבו הגיליון מתחיל. רינדור-סולו זייף (עמוד ריק
   נגרר אחרי break-after), וחיקוי לפי גובה נמדד שיקר ב-3 עמודים. */
await page.evaluate(() => {
  document.querySelectorAll('.book > .sheet').forEach((el, j) => {
    const a = document.createElement('a');
    a.href = `https://pdfmap.invalid/${j}`;
    a.className = 'pdfmap-probe';
    a.style.cssText = 'position:absolute;top:1px;right:1px;width:8px;height:8px;display:block;';
    el.prepend(a);
  });
});
const probe = await PDFDocument.load(
  await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }),
);
await page.evaluate(() => document.querySelectorAll('.pdfmap-probe').forEach((a) => a.remove()));

const firstPage = {};
probe.getPages().forEach((pg, idx) => {
  const annots = pg.node.lookup(PDFName.of('Annots'));
  if (!annots) return;
  for (let i = 0; i < annots.size(); i++) {
    const annot = probe.context.lookup(annots.get(i));
    const action = annot?.lookup?.(PDFName.of('A'));
    const uri = action?.lookup?.(PDFName.of('URI'));
    const m = /pdfmap\.invalid\/(\d+)/.exec(uri ? String(uri) : '');
    if (m && !(Number(m[1]) in firstPage)) firstPage[Number(m[1])] = idx;
  }
});
for (let j = 0; j < sheets.length; j++) {
  if (!(j in firstPage)) throw new Error(`sheet ${j} left no probe annotation — the map cannot be built`);
  if (j > 0 && firstPage[j] <= firstPage[j - 1]) throw new Error(`sheet ${j} starts before sheet ${j - 1} — the probe order is broken`);
}
for (let j = 0; j < sheets.length; j++) {
  const next = j + 1 < sheets.length ? firstPage[j + 1] : probe.getPageCount();
  sheets[j].pages = next - firstPage[j];
}

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

const expected = sheets.reduce((sum, s) => sum + s.pages, 0);
for (const f of ['public/hoveret.pdf', 'public/hoveret-bw.pdf']) {
  const count = (await PDFDocument.load(readFileSync(f))).getPageCount();
  if (count !== expected) {
    throw new Error(`${f} holds ${count} pdf pages but the sheet heights add up to ${expected} — the map would lie`);
  }
}
let at = 0;
const pages = {};
for (const s of sheets) {
  if (s.n) pages[String(s.n)] = { at, len: s.pages };
  at += s.pages;
}
writeFileSync('public/hoveret-map.json', JSON.stringify({ total: expected, pages }));
console.log(`public/hoveret.pdf written — ${expected} pdf pages for ${sheets.length} sheets, map verified`);
