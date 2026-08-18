import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { TOTAL_PAGES } from '../src/data/workbook';

/* גיליון גבוה (שעשועון, פוסטר) נשפך ליותר מעמוד PDF אחד, ולכן גזירת „דפים
   נבחרים" חייבת מפה אמיתית — הקירוב „עמוד n = n+2" החזיר עמודים שגויים
   אחרי הגיליון הנשפך הראשון. המפה נכתבת ומאומתת ב-npm run pdf; הבדיקה כאן
   שומרת שהקבצים המחויבים לריפו לא נסחפים ממנה. */
describe('the download PDFs match their page map', () => {
  const pub = (f: string): URL => new URL(`../public/${f}`, import.meta.url);

  it('the page map exists, covers every booklet page, and matches both files', async () => {
    expect(existsSync(pub('hoveret-map.json')), 'public/hoveret-map.json is missing — run npm run pdf').toBe(true);
    const map = JSON.parse(readFileSync(pub('hoveret-map.json'), 'utf8')) as {
      total: number;
      pages: Record<string, { at: number; len: number }>;
    };

    /* One sheet = one A4 page. A phone-scaling @media block once leaked into
       page.pdf() (laid out at A4 width < 850px) and gave every sheet an 18px
       bottom margin, so break-after:page pushed a near-blank page before each
       pair — 40 blank pages, total 80→120. The booklet is exactly the numbered
       pages plus the cover and the contents sheet; if that count ever grows, a
       sheet is spilling onto a second page again. */
    expect(map.total, 'the PDF grew extra pages — a sheet is spilling onto a second page').toBe(TOTAL_PAGES + 2);

    const covered = new Set<number>();
    for (let n = 1; n <= TOTAL_PAGES; n++) {
      const entry = map.pages[String(n)];
      expect(entry, `page ${n} is missing from the map`).toBeDefined();
      expect(entry!.len, `page ${n} spans ${entry!.len} pdf pages — it must be exactly one A4 page`).toBe(1);
      for (let i = 0; i < entry!.len; i++) {
        const idx = entry!.at + i;
        expect(covered.has(idx), `pdf page ${idx} is claimed twice`).toBe(false);
        covered.add(idx);
      }
    }
    // השער ותוכן העניינים יושבים לפני עמוד 1, והמפה נגמרת בדיוק בסוף הקובץ.
    expect(Math.min(...covered)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...covered)).toBe(map.total - 1);

    for (const f of ['hoveret.pdf', 'hoveret-bw.pdf']) {
      const doc = await PDFDocument.load(readFileSync(pub(f)));
      expect(doc.getPageCount(), `${f} does not match the map`).toBe(map.total);
    }
  });
});
