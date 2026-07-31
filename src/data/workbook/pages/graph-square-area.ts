import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* Based on the question Yaniv sent about a square's side against its area —
   the one that ends in an algebraic expression. Here the same idea for the
   PERIMETER, which is the linear case a seventh-grader can read straight off
   the graph: four equal sides, so y is four times x. */
export const GRAPH_SQUARE_AREA: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'צלע הריבוע וההיקף — מגרף אל ביטוי אלגברי',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">בריבוע כל ארבע הצלעות ${blank(5, 'relation')}, ולכן ההיקף הוא אורך הצלע כפול ${blank(3, 'number')}.</div>
</div>
<section class="q-card">
<h3>א. בגרף מוצג היקף הריבוע לפי אורך הצלע שלו.</h3>
${grid({
  size: 'lg',
  axisX: 'אורך הצלע (יח\')',
  axisY: 'ההיקף (עשרות יח\')',
  label: 'גרף נקודות: היקף הריבוע לפי אורך הצלע',
  points: [
    { x: 1, y: 0.4, label: '' },
    { x: 2, y: 0.8, label: '' },
    { x: 3, y: 1.2, label: '' },
    { x: 5, y: 2, label: '' },
    { x: 7, y: 2.8, label: '' },
  ],
  ylabels: [0, 10, 20, 30, 40, 50, 60],
})}
<ul class="tasks compact">
<li>כשאורך הצלע הוא 3 יח', ההיקף הוא ${blank(3, 'number')} יח'.</li>
<li>ההיקף הוא 20 יח' כשאורך הצלע ${blank(3, 'number')} יח', כי כל צלע ${blank(5, 'relation')} לשאר.</li>
<li>לכל נקודה בגרף, שיעור ה־${ltr('y')} גדול פי ${blank(3, 'number')} מערך ה־${ltr('x')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. כותבים את הביטוי האלגברי.</h3>
<ul class="tasks compact">
<li>נסמן באות ${ltr('x')} את אורך הצלע, ובאות ${ltr('y')} את ההיקף.</li>
<li>הביטוי שמתאר את ההיקף הוא ${ltr('y = ')}${blank(6, 'number')}.</li>
<li>לפי הביטוי, ריבוע שאורך צלעו 6 יח' — ההיקף שלו ${blank(4, 'number')} יח'.</li>
<li>סמנו על הגרף את הנקודה שמתאימה לריבוע שאורך צלעו 4 יח': ${pair()}.</li>
</ul>
</section>
`,
});
