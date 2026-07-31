import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, ltr, pair, grid, exerciseGiven, exercise } from '../authoring';

/* The gap this fills: the booklet asked for lengths and never said how to get
   one. A child counted squares. The length of a segment parallel to an axis is
   a SUBTRACTION — right minus left, high minus low — and the answer of that
   subtraction has a name: ההפרש. */
export const SEGMENT_LENGTH: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'קטעים מקבילים לצירים',
  subtitle: 'האורך הוא ההפרש — התוצאה של תרגיל החיסור',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">בקטע המקביל לציר ${ltr('x')}, האורך הוא ה־${ltr('x')} הימני <b>פחות</b> ה־${ltr('x')} השמאלי, והתוצאה נקראת ה${wordBlank('medium', 'concept', 'מקום להשלמת המילה הפרש')}.</div>
<div class="completion-sentence">בקטע המקביל לציר ${ltr('y')}, האורך הוא ה־${ltr('y')} הגבוה <b>פחות</b> ה־${ltr('y')} ה${wordBlank('medium', 'property', 'מקום להשלמת המילה נמוך')}.</div>
</div>
<section class="q-card">
<h3>א. השלימו לפי הסרטוט.</h3>
${grid({
  size: 'md',
  label: 'הקטע AB מקביל לציר x, והקטע CD מקביל לציר y',
  points: [
    { x: 2, y: 3, label: 'A' },
    { x: 7, y: 3, label: 'B' },
    { x: 5, y: 1, label: 'C' },
    { x: 5, y: 5, label: 'D' },
  ],
  segments: [
    { from: [2, 3], to: [7, 3], type: 'shape' },
    { from: [5, 1], to: [5, 5], type: 'shape' },
  ],
})}
<ul class="tasks compact">
<li>הקטע ${ltr('AB')} מקביל לציר ${blank(3, 'letter')}, ולכן מחשבים את ההפרש בין ערכי ה־${ltr('x')}.</li>
<li>ה־${ltr('x')} הימני הוא 7, ה־${ltr('x')} השמאלי הוא ${blank(3, 'number')}, ולכן זהו תרגיל החיסור:</li>
</ul>
${exerciseGiven('AB', '7 − 2')}
<ul class="tasks compact">
<li>בקטע ${ltr('CD')} מחשבים את ההפרש בין ה־${ltr('y')} הגבוה ובין ה־${ltr('y')} ה${blank(5, 'property')}.</li>
<li>ה־${ltr('y')} הגבוה הוא 5, ה־${ltr('y')} הנמוך הוא ${blank(3, 'number')}, ולכן זהו תרגיל החיסור:</li>
</ul>
${exerciseGiven('CD', '5 − 1')}
</section>
<section class="q-card">
<h3>ב. כתבו את תרגיל החיסור, ואז את האורך.</h3>
<table class="work-table center">
<tbody>
<tr><th>הקטע</th><th>מקביל לציר</th><th>התרגיל והאורך</th></tr>
<tr><td>${ltr('A(1,4)')} ו־${ltr('B(6,4)')}</td><td>${blank(3, 'letter')}</td><td>${exerciseGiven('AB', '6 − 1')}</td></tr>
<tr><td>${ltr('C(3,2)')} ו־${ltr('D(3,6)')}</td><td>${blank(3, 'letter')}</td><td>${exerciseGiven('CD', '6 − 2')}</td></tr>
<tr><td>${ltr('E(0,5)')} ו־${ltr('F(8,5)')}</td><td>${ltr('x')}</td><td>${exercise('EF')}</td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>ג. סמנו קטע משלכם, ואז השלימו את החסר.</h3>
<ul class="tasks compact">
<li>סמנו על הסרטוט שלמעלה קטע ${ltr('EF')} שמקביל לציר ${ltr('x')} ואורכו 4 יח'.</li>
<li>הנקודה ${pair('E')} והנקודה ${pair('F')}.</li>
<li>כתבו את תרגיל החיסור של הקטע שסימנתם, ואת ההפרש שקיבלתם:</li>
</ul>
${exercise('EF')}
</section>
`,
});
