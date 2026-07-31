import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, ltr, pair, grid, wordBank } from '../authoring';

export const AXES_INTRO: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided dense',
  title: 'מכירים את מערכת הצירים',
  subtitle: 'שמות הצירים, הראשית וכיווני הגדילה',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">הציר האנכי הוא ציר ${wordBlank('short', 'letter', 'מקום להשלמת האות y')}.</div>
<div class="completion-sentence">הציר ה${wordBlank('medium', 'property', 'מקום להשלמת המילה אופקי')} הוא ציר ${ltr('x')}.</div>
<div class="completion-sentence">נקודת המפגש בין שני הצירים נקראת ${wordBlank('medium', 'concept', 'מקום להשלמת המילה ראשית')} ה${wordBlank('medium', 'concept', 'מקום להשלמת המילה צירים')}.</div>
<div class="completion-sentence">ראשית הצירים נכתבת כזוג סדור ${pair()}.</div>
<div class="completion-sentence">שני הצירים מאונכים זה לזה, ולכן הזווית שביניהם היא זווית ${wordBlank('medium', 'property', 'מקום להשלמת המילה ישרה')}.</div>
<div class="completion-sentence">בכל נקודה שממוקמת על ציר ${ltr('x')} שיעור ה־${ltr('y')} הוא ${wordBlank('short', 'number', 'מקום להשלמת המספר אפס')}.</div>
<div class="completion-sentence">הנקודה ${ltr('(0,4)')} ממוקמת על ציר ${wordBlank('short', 'letter', 'מקום להשלמת האות y')}.</div>
<div class="completion-sentence">בנקודה ${ltr('(5,0)')} ערך ${ltr('x')} הוא ${wordBlank('short', 'number', 'מקום להשלמת המספר חמש')} ושיעור ${ltr('y')} הוא ${wordBlank('short', 'number', 'מקום להשלמת המספר אפס')}.</div>
</div>
<section class="q-card">
<h3>א. השלימו את החסר.</h3>
${wordBank(['ציר x', 'ציר y', 'ראשית', 'הצירים'])}
${grid({
  size: 'lg',
  // Naming the axes IS the task, so the drawing hides the names and offers
  // boxes instead: one past the x arrow, one above the y arrow, and — because
  // „ראשית הצירים” is two words — two stacked boxes at the origin.
  axisNames: false,
  originName: true,
  label: 'מערכת צירים ובה תיבות ריקות לשם ציר x, לשם ציר y ולשתי מילות „ראשית הצירים”, ותיבות למספרים החסרים שעל הצירים',
  xlabels: [0, 1, '', 3, '', 5, '', '', 8],
  ylabels: [0, '', 2, '', '', 5, ''],
})}
</section>
<div class="cols-2">
<section class="q-card">
<h3>ב. השלימו את החסר.</h3>
<ul class="tasks compact">
<li>המספרים על ציר ${ltr('x')} גדלים כשזזים ${blank(7, 'direction')}.</li>
<li>המספרים על ציר ${blank(4, 'letter')} גדלים כשזזים למעלה.</li>
<li>המספרים על ציר ${ltr('x')} ${blank(6, 'relation')} כשזזים שמאלה.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. נתון זוג סדור — כתבו את השיעורים.</h3>
<ul class="tasks compact">
<li>בנקודה ${ltr('A(3,5)')} ערך ${ltr('x')} הוא ${blank(4, 'number')}, ושיעור ${ltr('y')} הוא ${blank(4, 'number')}.</li>
<li>בנקודה ${ltr('B(6,2)')} המספר 2 הוא שיעור ${blank(4, 'letter')}.</li>
<li>בנקודה ${ltr('B(6,2)')} המספר 6 הוא ${blank(6, 'concept')} ${ltr('x')}.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ד. נתונים השיעורים — כתבו את הזוג הסדור המתאים.</h3>
<ul class="tasks compact">
<li>ערך ${ltr('x')} שווה 4 ושיעור ${ltr('y')} שווה 7, ולכן הזוג הסדור המתאים הוא ${pair('C')}.</li>
<li>אם ${ltr('x = 8')} ו־${ltr('y = 1')}, אז הזוג הסדור המתאים הוא ${pair('D')}.</li>
<li>אם ${ltr('x = 0')} ו־${ltr('y = 6')}, אז הנקודה ממוקמת על ציר ${blank(4, 'letter')}, והזוג הסדור המתאים הוא ${pair('E')}.</li>
</ul>
</section>
`,
});
