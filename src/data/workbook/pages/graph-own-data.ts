import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* The last of the six: the learner supplies the data. Nothing here can be read
   off the page, so the whole sheet is the pattern — measure, plot, then answer
   about what you plotted. */
export const GRAPH_OWN_DATA: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'קריאת גרפים ברביע הראשון',
  subtitle: 'הנתונים שלכם — אוספים, מסמנים, ואז משלימים עליהם',
  content: `
<section class="q-card">
<h3>א. סמנו את הנתונים שלכם על הגרף.</h3>
<p>בדקו כמה דקות אתם מקדישים לשיעורי בית בכל יום, במשך שישה ימים. סמנו נקודה לכל יום: ערך ה־${ltr('x')} הוא היום, ושיעור ה־${ltr('y')} הוא הדקות בעשרות.</p>
${grid({
  size: 'lg',
  axisX: 'יום',
  axisY: 'דקות (עשרות)',
  label: 'מערכת צירים ריקה לסימון הנתונים שהתלמיד אסף',
})}
</section>
<section class="q-card">
<h3>ב. השלימו לפי הגרף שסימנתם.</h3>
<ul class="tasks compact">
<li>הנקודה שמתאימה ליום הראשון היא ${pair()}, והנקודה שמתאימה ליום השישי היא ${pair()}.</li>
<li>ביום ${blank(3, 'number')} הקדשתם את מספר הדקות הגדול ביותר.</li>
<li>ההפרש בין היום הגבוה ביותר ובין היום הנמוך ביותר הוא ${blank(3, 'number')} עשרות דקות.</li>
<li>אם יש שני ימים שבהם הקדשתם אותו זמן, לשתי הנקודות שמתאימות להם יש שיעור ${blank(3, 'letter')} זהה.</li>
<li>הנקודה הגבוהה ביותר בגרף שלכם רחוקה מציר ${ltr('x')} ${blank(3, 'number')} יחידות.</li>
</ul>
</section>
`,
});
