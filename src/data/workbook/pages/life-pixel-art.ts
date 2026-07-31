import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, calcBox, exerciseGiven } from '../authoring';

/* Real life, grade 7: every image on every screen they own is a grid of pixels,
   and a pixel is nothing but an ordered pair with a colour. Colouring squares
   by their coordinates is drawing, and it is also plotting points. */
export const LIFE_PIXEL_ART: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'פיקסלים — כל מסך הוא מערכת צירים',
  subtitle: 'צובעים לפי זוגות סדורים ומקבלים תמונה',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">כל תמונה במסך בנויה מריבועים קטנים שנקראים פיקסלים, ולכל פיקסל יש ${blank(6, 'concept')} סדור משלו.</div>
<div class="completion-sentence">כשמגדילים תמונה קטנה רואים את הריבועים, כי המסך מסודר בשורות ובעמודות — בדיוק כמו ${blank(6, 'concept')} הצירים.</div>
</div>
<section class="q-card">
<h3>א. צבעו את הפיקסלים ותקבלו צורה.</h3>
<p>צבעו את המשבצות שמעל ומימין לכל זוג סדור: ${ltr('(2,2)')}, ${ltr('(3,2)')}, ${ltr('(4,2)')}, ${ltr('(5,2)')}, ${ltr('(2,3)')}, ${ltr('(5,3)')}, ${ltr('(2,4)')}, ${ltr('(3,4)')}, ${ltr('(4,4)')}, ${ltr('(5,4)')}.</p>
${grid({ size: 'md', label: 'מערכת צירים ריקה לצביעת פיקסלים' })}
<ul class="tasks compact">
<li>הצורה שהתקבלה היא ${blank(7, 'concept')}.</li>
<li>השורה התחתונה שצבעתם משתרעת מ־${ltr('x')} השווה 2 עד ${ltr('x')} השווה 5, ולכן ההפרש הוא ${blank(3, 'number')}.</li>
<li>הצלע התחתונה מקבילה לציר ${blank(3, 'letter')}, והצלע השמאלית מקבילה לציר ${ltr('y')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. כמה פיקסלים צריך?</h3>
<p>מסך קטנטן של שעון חכם משתרע מ־${ltr('(1,1)')} ועד ${ltr('(7,5)')}.</p>
<ul class="tasks compact">
<li>האורך הוא ההפרש בין ה־${ltr('x')} הימני ובין ה־${ltr('x')} השמאלי, והרוחב הוא ההפרש בין ה־${ltr('y')} הגבוה ובין ה־${ltr('y')} ה${blank(5, 'property')}.</li>
</ul>
${exerciseGiven('AB', '7 − 1')}
${exerciseGiven('BC', '5 − 1')}
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>ג. תכננו פיקסל משלכם, ואז השלימו את החסר.</h3>
<ul class="tasks compact">
<li>סמנו על הסרטוט פיקסל שממוקם בתוך הצורה שצבעתם.</li>
<li>הזוג הסדור של הפיקסל שבחרתם הוא ${pair()}.</li>
<li>המרחק שלו מציר ${ltr('y')} הוא ${blank(3, 'number')} יח', וזה בדיוק ערך ה־${ltr('x')} שלו.</li>
</ul>
</section>
`,
});
