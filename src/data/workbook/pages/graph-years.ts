import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven, wordBank } from '../authoring';

/* Based on the national-test question Yaniv sent: an average score plotted by
   year. Same genre, our own data — the sports hall attendance of a school. */
export const GRAPH_YEARS: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'לאורך השנים — ציר ה־x מציין את השנה, וציר ה־y את התוצאה',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">כאשר ציר ה־${ltr('x')} מציין שנים, ההפרש בין שיעורי ה־${ltr('x')} של שתי נקודות הוא מספר ה${blank(5, 'concept')} שעברו.</div>
</div>
${wordBank(['שנים'])}
<section class="q-card">
<h3>א. בגרף מוצג מספר התלמידים שנרשמו לחוג המתמטיקה בבית הספר.</h3>
${grid({
  size: 'lg',
  axisX: 'שנים מאז הפתיחה',
  axisY: 'נרשמים (עשרות)',
  /* בסעיף ב מסמנים את השנה השמינית עם 70 תלמידים = 7 עשרות, ולכן ציר ה־y חייב
     להגיע מעל 7 — אחרת הנקודה (8,7) יוצאת מהמערכת (עמוד 64: „הנקודה יצאה"). */
  ymax: 8,
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
