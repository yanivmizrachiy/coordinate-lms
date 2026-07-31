import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven } from '../authoring';

/* Based on the national-test question Yaniv sent: an average score plotted by
   year. Same genre, our own data — the sports hall attendance of a school. */
export const GRAPH_YEARS: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'לאורך השנים — ערך x הוא השנה, שיעור y הוא התוצאה',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">כשערך ה־${ltr('x')} הוא שנה, המרחק בין שתי נקודות על ציר ${ltr('x')} הוא מספר ה${blank(5, 'concept')} שעברו.</div>
</div>
<section class="q-card">
<h3>א. בגרף מוצג מספר התלמידים שנרשמו לחוג המתמטיקה בבית הספר.</h3>
${grid({
  size: 'lg',
  axisX: 'שנים מאז הפתיחה',
  axisY: 'נרשמים (עשרות)',
  label: 'גרף נקודות: מספר הנרשמים לחוג בכל שנה מאז הפתיחה',
  points: [
    { x: 1, y: 2, label: '' },
    { x: 2, y: 3, label: '' },
    { x: 3, y: 5, label: '' },
    { x: 4, y: 4, label: '' },
    { x: 5, y: 6, label: '' },
    { x: 7, y: 5, label: '' },
  ],
})}
<ul class="tasks compact">
<li>בשנה השלישית נרשמו ${blank(3, 'number')} עשרות תלמידים, ולכן הנקודה שמתאימה לה היא ${pair()}.</li>
<li>מספר הנרשמים היה הגבוה ביותר בשנה ה־${blank(3, 'number')}.</li>
<li>בשנה הרביעית מספר הנרשמים ${blank(5, 'relation')} לעומת השנה שלפניה.</li>
<li>לשתי הנקודות שמתאימות לשנה השלישית ולשנה ה־${blank(3, 'number')} יש שיעור ${ltr('y')} זהה.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. משמעות הנקודה, ומחשבים את השינוי.</h3>
<ul class="tasks compact">
<li>משמעות הנקודה ${ltr('(5,6)')}: בשנה ה־5 נרשמו ${blank(3, 'number')} עשרות תלמידים.</li>
</ul>
<ul class="tasks compact">
<li>בין השנה הראשונה ובין השנה החמישית, ואחר כך ההפרש במספר הנרשמים באותן שנים:</li>
</ul>
${exerciseGiven('', '5 − 1', 'שנים')}
${exerciseGiven('', '6 − 2', 'עשרות')}
<ul class="tasks compact">
<li>סמנו על הגרף נקודה שמתארת את השנה השמינית, שבה נרשמו 70 תלמידים: ${pair()}.</li>
<li>הנקודה שסימנתם ממוקמת ${blank(5, 'direction')} מכל הנקודות האחרות בגרף.</li>
</ul>
</section>
`,
});
