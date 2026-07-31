import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* Based on the two-libraries question Yaniv sent: two sets of points on one
   pair of axes, one starting higher and one climbing faster, and the year they
   meet. Here it is two classes collecting bottle caps. */
export const GRAPH_TWO_SERIES: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'שתי סדרות באותם צירים — ומתי הן משתוות',
  content: `
<p>כיתה ז'1 אספה 300 פקקים ומוסיפה 100 בכל חודש. כיתה ז'2 אספה 100 פקקים ומוסיפה 200 בכל חודש. בגרף שתי הסדרות באותם צירים.</p>
<section class="q-card">
<h3>א. קוראים מהגרף.</h3>
${grid({
  size: 'lg',
  axisX: 'חודשים',
  axisY: 'פקקים (מאות)',
  /* ז'2 reaches 700 caps in month 3 — the y axis must reach past 7, or the
     point lands OUTSIDE the system (Yaniv: „הנקודה האדומה יצאה מהמערכת"). */
  ymax: 8,
  label: 'שתי סדרות נקודות: כיתה ז1 מתחילה גבוה, כיתה ז2 עולה מהר יותר',
  points: [
    { x: 1, y: 4, label: '' }, { x: 2, y: 5, label: '' }, { x: 3, y: 6, label: '' },
    { x: 1, y: 3, label: '', color: '#dc2626' }, { x: 2, y: 5, label: '', color: '#dc2626' },
    { x: 3, y: 7, label: '', color: '#dc2626' },
  ],
})}
<ul class="tasks compact">
<li>אחרי חודש אחד היו לכיתה ז'1 ${blank(3, 'number')} מאות פקקים, ולכן הנקודה שמתאימה לה היא ${pair()}.</li>
<li>בחודש ה־${blank(3, 'number')} לשתי הכיתות אותו מספר פקקים, כי לשתי הנקודות שיעור ${ltr('y')} זהה.</li>
<li>אחרי החודש הזה, מספר הפקקים של כיתה ז'2 ${blank(5, 'relation')} משל כיתה ז'1.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הביטוי האלגברי של כל כיתה.</h3>
<ul class="tasks compact">
<li>נסמן באות ${ltr('x')} את מספר החודשים, ובאות ${ltr('y')} את מספר הפקקים.</li>
<li>עבור כיתה ז'1: ${ltr('y = 100x + ')}${blank(5, 'number')}.</li>
<li>עבור כיתה ז'2: ${ltr('y = ')}${blank(5, 'number')}${ltr(' + 100')}.</li>
<li>אחרי 6 חודשים מספר הפקקים של כיתה ז'2 ${blank(5, 'relation')} מזה של כיתה ז'1.</li>
</ul>
</section>
`,
});
