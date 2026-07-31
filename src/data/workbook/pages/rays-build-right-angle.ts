import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* From the misparim „זווית לכיתה ז'” unit: the questions where the learner has
   to BUILD the right angle rather than recognise it. Every marking task is
   followed by a question about what the learner drew. */
export const RAYS_BUILD_RIGHT_ANGLE: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'זוויות ברביע הראשון',
  subtitle: 'בונים זווית ישרה בראשית הצירים, ואז משלימים עליה',
  content: `
<section class="q-card">
<h3>א. סמנו נקודה שיוצרת זווית ישרה, ואז השלימו את החסר.</h3>
${grid({
  size: 'lg',
  label: 'קרן מראשית הצירים דרך הנקודה (0,6), ומקום לסימון נקודות נוספות',
  points: [{ x: 0, y: 0, label: 'O' }, { x: 0, y: 6, label: 'A' }],
  segments: [{ from: [0, 0], to: [0, 6], type: 'shape' }],
})}
<ul class="tasks compact">
<li>סמנו על הסרטוט שתי נקודות שונות, ${ltr('B')} ו־${ltr('C')}, כך שכל קרן מראשית הצירים דרכן תיצור זווית ישרה עם הקרן ${ltr('OA')}.</li>
<li>הנקודות שסימנתם: ${pair('B')} ו־${pair('C')}.</li>
<li>בשתיהן שיעור ה־${ltr('y')} הוא ${blank(3, 'number')}, כי שתיהן ממוקמות על ציר ${ltr('x')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. המשולש ${ltr('OPQ')}.</h3>
${grid({
  size: 'lg',
  label: 'הנקודות O, P ו־Q, שאותן מחברים למשולש',
  points: [{ x: 0, y: 0, label: 'O' }, { x: 4, y: 0, label: 'P' }, { x: 0, y: 4, label: 'Q' }],
})}
<ul class="tasks compact">
<li>חברו את הנקודות ${ltr('O')}, ${ltr('P')} ו־${ltr('Q')} וסרטטו את המשולש.</li>
<li>הזווית הישרה נוצרת ליד הקודקוד ${blank(3, 'letter')}, כי שם נפגשים ציר ${ltr('x')} וציר ${ltr('y')}.</li>
<li>אורך הצלע ${ltr('OP')} הוא ${blank(3, 'number')} יח', ואורך הצלע ${ltr('OQ')} הוא 4 יח'.</li>
</ul>
</section>
`,
});
