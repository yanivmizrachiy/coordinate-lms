import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven } from '../authoring';

/* Real life, grade 7: a phone home screen IS a coordinate system. The icons sit
   on a grid, „הזזתי את האפליקציה” is a translation, and the child already knows
   that swapping row and column lands you somewhere else entirely. */
export const LIFE_PHONE_SCREEN: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מסך הטלפון הוא מערכת צירים',
  subtitle: 'כל אפליקציה יושבת בזוג סדור אחד ויחיד',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">האפליקציות על המסך מסודרות בשורות ובעמודות, בדיוק כמו נקודות ב${blank(6, 'concept')} הצירים.</div>
<div class="completion-sentence">ערך ה־${ltr('x')} אומר באיזו עמודה האפליקציה, ושיעור ה־${ltr('y')} אומר באיזו ${blank(5, 'property')}.</div>
</div>
<section class="q-card">
<h3>א. השלימו לפי המסך.</h3>
${grid({
  size: 'md',
  label: 'מסך טלפון: חמש אפליקציות מסומנות כנקודות על מערכת צירים',
  points: [
    { x: 1, y: 5, label: 'מוזיקה' },
    { x: 4, y: 5, label: 'מצלמה' },
    { x: 6, y: 5, label: 'הודעות' },
    { x: 1, y: 2, label: 'מפות' },
    { x: 6, y: 2, label: 'שעון' },
  ],
})}
<ul class="tasks compact">
<li>אפליקציית המצלמה ממוקמת בזוג הסדור ${pair()}.</li>
<li>בזוג הסדור ${ltr('(1,2)')} ממוקמת אפליקציית ${blank(7, 'concept')}.</li>
<li>אפליקציות המוזיקה, המצלמה וההודעות ממוקמות באותה שורה, ולכן שיעור ה־${ltr('y')} שלהן ${blank(5, 'relation')}.</li>
<li>אפליקציית המפות ואפליקציית השעון ממוקמות באותו גובה, ולכן הקטע שביניהן מקביל לציר ${blank(3, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. כמה רחוק גררתי את האפליקציה?</h3>
<ul class="tasks compact">
<li>גררתי את אפליקציית המוזיקה מ־${ltr('(1,5)')} אל מקום ההודעות ב־${ltr('(6,5)')}, וזהו תרגיל החיסור:</li>
</ul>
${exerciseGiven('', '6 − 1', 'משבצות')}
<ul class="tasks compact">
<li>לכן היא זזה ${blank(3, 'number')} עמודות ימינה, כלומר ההפרש בין ערכי ה־${ltr('x')} הוא 5.</li>
<li>גררתי את אפליקציית השעון מ־${ltr('(6,2)')} אל ${ltr('(6,5)')}. ה־${ltr('y')} הגבוה הוא 5, ה־${ltr('y')} הנמוך הוא ${blank(3, 'number')}, וזהו תרגיל החיסור:</li>
</ul>
${exerciseGiven('', '5 − 2', 'משבצות')}
<ul class="tasks compact">
<li>ההזזה הזאת היא של 3 יחידות ${blank(6, 'direction')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. הסדר קובע — גם בטלפון.</h3>
<ul class="tasks compact">
<li>חבר אמר לי „האפליקציה ב־${ltr('(2,6)')}”, ואני חיפשתי ב־${ltr('(6,2)')} ולא מצאתי. הוא התכוון לעמודה 2 ולשורה ${blank(3, 'number')}.</li>
<li>שני הזוגות בנויים מאותם מספרים, אבל ה${blank(5, 'concept')} שלהם שונה, ולכן הם שני מקומות שונים על המסך.</li>
<li>סמנו על הסרטוט את המקום שבו הייתם שמים אפליקציה חדשה, כך שתהיה באותה עמודה של אפליקציית המפות: ${pair()}.</li>
<li>המרחק בין האפליקציה שסימנתם ובין אפליקציית המפות הוא ${blank(3, 'number')} יח'.</li>
</ul>
</section>
`,
});
