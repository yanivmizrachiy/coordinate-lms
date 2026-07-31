import { TOTAL_PAGES } from '../data/workbook';
import { printPages } from './printPages';

/* הורדה אמיתית — קובץ PDF מוכן, לא חלון הדפסה.

   שני קבצים נבנים מראש ממנוע ההדפסה של Chromium (`npm run pdf`):
   `hoveret.pdf` בצבע ו-`hoveret-bw.pdf` בשחור-לבן — כך שגם הורדה בשחור-לבן
   היא קובץ מיידי, לא חלון הדפסה. עמודים נבחרים נגזרים מהקובץ המתאים בדפדפן
   עם pdf-lib (נטען עצל). מפת העמודים: 1=שער, 2=תוכן, עמוד חוברת n = n+2. */

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
    const [{ PDFDocument }, bytes] = await Promise.all([
      import('pdf-lib'),
      fetch(pdfUrl(bw)).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      }),
    ]);
    const src = await PDFDocument.load(bytes);
    const out = await PDFDocument.create();
    const ordered = [...pages].sort((a, b) => a - b);
    const copied = await out.copyPages(src, ordered.map((n) => n + 1)); // n+2, אפס-מבוסס
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
