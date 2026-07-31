import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, calcBox, exerciseGiven } from '../authoring';

/* Real life, grade 7: a ticket says „שורה 4, מקום 7”, and sitting in the wrong
   one is the ordered pair failing in public. The block of seats a group buys is
   a rectangle, so its size is an area — counted, then multiplied. */
export const LIFE_HALL_SEATS: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'שורה ומקום — הכרטיס שלכם',
  subtitle: 'הזוג הסדור שקובע איפה יושבים באולם',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">על הכרטיס כתוב מקום ושורה. המקום הוא ערך ה־${blank(3, 'letter')}, והשורה היא שיעור ה־${ltr('y')}.</div>
<div class="completion-sentence">מי שיושב במקום 3 בשורה 5 ומי שיושב במקום 5 בשורה 3 יושבים בשני כיסאות ${blank(5, 'relation')}.</div>
</div>
<section class="q-card">
<h3>א. מי יושב איפה?</h3>
${grid({
  size: 'md',
  label: 'אולם: ארבעה כיסאות תפוסים, מסומנים כנקודות',
  points: [
    { x: 2, y: 1, label: 'דניאל' },
    { x: 5, y: 1, label: 'נועה' },
    { x: 2, y: 4, label: 'גיא' },
    { x: 7, y: 4, label: 'אורי' },
  ],
})}
<ul class="tasks compact">
<li>על הכרטיס של נועה כתוב ${pair()}.</li>
<li>גיא ואורי יושבים באותה שורה, ולכן שיעור ה־${ltr('y')} שלהם ${blank(5, 'relation')}.</li>
<li>בין הכיסא של גיא ובין הכיסא של אורי מחשבים כך את ההפרש:</li>
</ul>
${exerciseGiven('', '7 − 2', 'מקומות')}
<ul class="tasks compact">
<li>דניאל וגיא יושבים באותו מקום בשורות שונות, ולכן הקטע שביניהם מקביל לציר ${blank(3, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הכיתה מזמינה גוש כיסאות.</h3>
<p>הכיתה הזמינה את כל הכיסאות שבין ${ltr('(3,2)')} ובין ${ltr('(6,4)')} — מלבן שלם של מקומות.</p>
<ul class="tasks compact">
<li>לאורך הגוש: ה־${ltr('x')} הימני פחות ה־${ltr('x')} השמאלי. לרוחב הגוש: ה־${ltr('y')} הגבוה פחות ה־${ltr('y')} ה${blank(5, 'property')}.</li>
</ul>
${exerciseGiven('', '6 − 3', 'מקומות בשורה')}
${exerciseGiven('', '4 − 2', 'שורות')}
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>ג. בחרו לעצמכם מקום, ואז השלימו את החסר.</h3>
<ul class="tasks compact">
<li>סמנו על הסרטוט כיסא פנוי שממוקם בשורה שמעל השורה של נועה.</li>
<li>על הכרטיס שלכם יהיה כתוב ${pair()}.</li>
<li>מהכיסא שבחרתם עד הכיסא של נועה יש הפרש של ${blank(3, 'number')} שורות.</li>
</ul>
</section>
`,
});
