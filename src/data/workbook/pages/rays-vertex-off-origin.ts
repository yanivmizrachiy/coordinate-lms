import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven } from '../authoring';

/* The second half of „בונים זווית ישרה”. It was the third section of a page
   that already carried two drawings, and a drawing there had nowhere to grow:
   „הציור לא ברור”. On its own sheet the drawing gets the room, and the section
   finally gets the drawing Yaniv asked for — the learner marks, then answers
   about what was marked. */
export const RAYS_VERTEX_OFF_ORIGIN: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'זוויות ברביע הראשון',
  subtitle: 'כשקודקוד הזווית אינו בראשית הצירים',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">זווית ישרה אפשר לבנות בכל מקום ברביע הראשון, ולא רק ב${blank(6, 'concept')} הצירים.</div>
</div>
<section class="q-card">
<h3>א. סמנו על הסרטוט, ואז השלימו עליו.</h3>
${grid({
  size: 'lg',
  label: 'הנקודות A(2,0) ו־B(2,4) והקטע שמחבר ביניהן, עם מקום לסימון נקודות נוספות',
  points: [{ x: 2, y: 0, label: 'A' }, { x: 2, y: 4, label: 'B' }],
  segments: [{ from: [2, 0], to: [2, 4], type: 'shape' }],
})}
<ul class="tasks compact">
<li>הקטע ${ltr('AB')} מקביל לציר ${blank(3, 'letter')}, כי בשתי הנקודות שעליו שיעור ה־${ltr('x')} זהה.</li>
<li>סמנו נקודה ${ltr('C')} כך שהזווית ${ltr('ABC')} תהיה ישרה. הנקודה שסימנתם: ${pair('C')}.</li>
<li>סמנו נקודה ${ltr('D')} נוספת ושונה, שגם בה הזווית ${ltr('ABD')} ישרה: ${pair('D')}.</li>
<li>בשתי הנקודות שסימנתם שיעור ה־${ltr('y')} הוא ${blank(3, 'number')}, כמו שיעור ה־${ltr('y')} של הנקודה ${ltr('B')}.</li>
<li>קודקוד הזווית שבניתם ממוקם בנקודה ${blank(3, 'letter')}, ולא בראשית הצירים.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הקטע שמאונך ל־${ltr('AB')}.</h3>
<ul class="tasks compact">
<li>הקטע ${ltr('BC')} שסימנתם מקביל לציר ${blank(3, 'letter')}, ולכן הוא ${blank(5, 'relation')} לקטע ${ltr('AB')}.</li>
<li>אורך הקטע ${ltr('AB')} הוא ההפרש בין שיעור ה־${ltr('y')} הגבוה ובין הנמוך:</li>
</ul>
${exerciseGiven('AB', '4 − 0')}
<ul class="tasks compact">
<li>נקודה שבה הזווית ${ltr('ABC')} <b>אינה</b> ישרה: ${pair()}, כי שיעור ה־${ltr('y')} שלה ${blank(5, 'relation')} משיעור ה־${ltr('y')} של ${ltr('B')}.</li>
</ul>
</section>
`,
});
