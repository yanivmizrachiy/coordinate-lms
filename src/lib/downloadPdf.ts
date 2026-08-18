import { TOTAL_PAGES } from '../data/workbook';
import { printPages } from './printPages';

/* הורדה אמיתית — קובץ PDF מוכן, לא חלון הדפסה.

   שני קבצים נבנים מראש ממנוע ההדפסה של Chromium (`npm run pdf`):
   `hoveret.pdf` בצבע ו-`hoveret-bw.pdf` בשחור-לבן — כך שגם הורדה בשחור-לבן
   היא קובץ מיידי, לא חלון הדפסה. עמודים נבחרים נגזרים מהקובץ המתאים בדפדפן
   עם pdf-lib (נטען עצל), לפי `hoveret-map.json` שנכתב ואומת בזמן הבנייה:
   גיליון גבוה (שעשועון, פוסטר) תופס יותר מעמוד PDF אחד, ולכן הקירוב הישן
   „עמוד n = n+2" החזיר עמודים שגויים אחרי הגיליון הנשפך הראשון. */

interface PdfMap { total: number; pages: Record<string, { at: number; len: number }> }

const pdfUrl = (bw: boolean): string =>
  `${import.meta.env.BASE_URL}${bw ? 'hoveret-bw.pdf' : 'hoveret.pdf'}`;
const fullName = (bw: boolean): string =>
  bw ? 'מערכת צירים — הרביע הראשון (שחור-לבן).pdf' : 'מערכת צירים — הרביע הראשון.pdf';

function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** החוברת המלאה — הקובץ המוכן, כמו שהוא. */
export function downloadBooklet(bw = false): void {
  const a = document.createElement('a');
  a.href = pdfUrl(bw);
  a.download = fullName(bw);
  document.body.append(a);
  a.click();
  a.remove();
}

/** עמודים נבחרים — נגזרים מהקובץ המוכן המתאים. */
export async function downloadPages(pages: ReadonlySet<number>, bw = false): Promise<void> {
  if (!pages.size) return;
  try {
    const [{ PDFDocument }, bytes, rawMap] = await Promise.all([
      import('pdf-lib'),
      fetch(pdfUrl(bw)).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      }),
      fetch(`${import.meta.env.BASE_URL}hoveret-map.json`)
        .then((r) => (r.ok ? (r.json() as Promise<PdfMap>) : null))
        .catch(() => null),
    ]);
    const src = await PDFDocument.load(bytes);
    // מפה שלא נבנתה מהקובץ הזה (סביבת פיתוח, קובץ ישן) לא קובעת כלום.
    const map = rawMap && rawMap.total === src.getPageCount() ? rawMap : null;
    const out = await PDFDocument.create();
    const ordered = [...pages].sort((a, b) => a - b);
    const indices = ordered.flatMap((n) => {
      const entry = map?.pages[String(n)];
      // בלי מפה — הקירוב הישן (נכון רק כשכל גיליון הוא עמוד PDF אחד).
      if (!entry) return [n + 1];
      return Array.from({ length: entry.len }, (_, i) => entry.at + i);
    });
    const copied = await out.copyPages(src, indices);
    for (const pg of copied) out.addPage(pg);
    const outBytes = await out.save();
    saveBlob(
      new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' }),
      ordered.length === TOTAL_PAGES ? fullName(bw) : `מערכת צירים — עמודים נבחרים (${ordered.length}).pdf`,
    );
  } catch {
    // אין קובץ מוכן (סביבת פיתוח לפני `npm run pdf`)? ההורדה עדיין עובדת —
    // דרך חלון ההדפסה, שבו „שמירה כ-PDF" היא יעד.
    printPages(new Set(pages), bw);
  }
}
