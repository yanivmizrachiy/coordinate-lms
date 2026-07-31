import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven } from '../authoring';

/* The step between the sent questions and an algebraic expression: points that
   climb by the same amount every time. Reading the step off the graph is what
   turns a picture into a rule. */
export const GRAPH_CONSTANT_RATE: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'קצב קבוע — כשכל צעד משנה באותו מספר',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">אם בכל צעד על ציר ${ltr('x')} שיעור ה־${ltr('y')} עולה באותו מספר, אומרים שהקצב ${blank(5, 'property')}.</div>
<div class="completion-sentence">את הקצב מוצאים בתרגיל ${blank(5, 'concept')}: שיעור ה־${ltr('y')} של הנקודה הבאה פחות שיעור ה־${ltr('y')} של הנקודה שלפניה.</div>
</div>
<section class="q-card">
<h3>א. בגרף מוצג גובה הנר שנשרף, בכל שעה.</h3>
${grid({
  size: 'lg',
  axisX: 'שעות',
  axisY: 'גובה הנר (ס"מ)',
  label: 'גרף נקודות: גובה הנר יורד בקצב קבוע',
  points: [
    { x: 0, y: 6, label: '' }, { x: 1, y: 5, label: '' }, { x: 2, y: 4, label: '' },
    { x: 3, y: 3, label: '' }, { x: 4, y: 2, label: '' },
  ],
})}
<ul class="tasks compact">
<li>בתחילת המדידה גובה הנר היה ${blank(3, 'number')} ס"מ, ולכן הנקודה הראשונה היא ${pair()}.</li>
<li>בכל שעה הגובה ${blank(5, 'relation')} ב־1 ס"מ, ולכן הקצב קבוע.</li>
<li>ההפרש בין הגובה בשעה 0 ובין הגובה בשעה 4 מחושב כך:</li>
</ul>
${exerciseGiven('', '6 − 2', 'ס"מ')}
</section>
<section class="q-card">
<h3>ב. מהגרף אל הביטוי.</h3>
<ul class="tasks compact">
<li>נסמן באות ${ltr('x')} את מספר השעות, ובאות ${ltr('y')} את גובה הנר בס"מ.</li>
<li>הביטוי שמתאר את הגובה הוא ${ltr('y = 6 − ')}${blank(4, 'number')}.</li>
<li>לפי הביטוי, אחרי 5 שעות הגובה ${blank(5, 'relation')} ל־1 ס"מ.</li>
<li>סמנו את הנקודה שמתאימה לשעה 5, ובדקו: היא ממוקמת ${blank(5, 'direction')} לנקודה שמתאימה לשעה 4.</li>
</ul>
</section>
`,
});
