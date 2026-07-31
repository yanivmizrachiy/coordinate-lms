import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, wordBank, grid, ltr, mixed } from '../authoring';

/* The opening sheet. Identification only: which axis is which, where they
   meet, where a number sits relative to its neighbours, and halves. No ordered
   pair, no (x,y) notation and no שיעורים — those start once these are secure.

   Every completion asks for a DIFFERENT kind of answer (letter, property,
   concept, direction, relation, number) — never the same one twice in a row.
   The `data-missing` tags are what the variety test reads. */
export const AXES_IDENTIFY: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'מכירים את הצירים',
  subtitle: 'הציר האופקי, הציר האנכי וראשית הצירים',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">ציר ${wordBlank('short', 'letter', 'מקום להשלמת האות x')} הוא הציר האופקי.</div>
<div class="completion-sentence">ציר ${ltr('y')} הוא הציר ה${wordBlank('medium', 'property', 'מקום להשלמת המילה אנכי')}.</div>
<div class="completion-sentence">הנקודה שבה נפגשים שני הצירים נקראת ${wordBlank('medium', 'concept', 'מקום להשלמת המילה ראשית')} ה${wordBlank('medium', 'concept', 'מקום להשלמת המילה צירים')}.</div>
</div>
<section class="q-card">
<h3>א. השלימו את החסר.</h3>
${wordBank(['ציר x', 'ציר y', 'ראשית', 'הצירים', '2', '3', '5', '6'])}
${grid({
  size: 'hero',
  axisNames: false,
  originName: true,
  label: 'מערכת צירים גדולה ובה הנקודות A B C, תיבות ריקות לשמות הצירים, לראשית הצירים ולמספרים החסרים',
  // A is off both axes, B sits on ציר x and C on ציר y — so the questions can
  // alternate between "which axis is this point on" and "which point is here".
  points: [
    { x: 4, y: 3, label: 'A' },
    { x: 7, y: 0, label: 'B' },
    { x: 0, y: 4, label: 'C' },
  ],
  xlabels: [0, 1, 2, '', 4, 5, '', 7, 8],
  ylabels: [0, 1, '', 3, 4, '', 6],
})}
</section>
<div class="cols-2">
<section class="q-card">
<h3>ב. השלימו על כיוון וגודל.</h3>
<!-- Same sentence three times on purpose: the shape stays put so the only
     thing that changes is WHICH part is missing (Yaniv's rule). -->
<ul class="tasks">
<li>ככל שזזים ימינה על ציר ${ltr('x')}, המספרים ${blank(6, 'relation')}.</li>
<li>ככל שזזים למעלה על ציר ${blank(3, 'letter')}, המספרים גדלים.</li>
<li>ככל שזזים ${blank(7, 'direction')} על ציר ${ltr('x')}, המספרים קטנים.</li>
<li>ככל שזזים למטה על ציר ${ltr('y')}, המספרים ${blank(6, 'relation')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. השלימו על מקומם של המספרים.</h3>
<ul class="tasks">
<li>שני הצירים נפגשים במספר ${blank(3, 'number')}.</li>
<li>המספר 7 שעל ציר ${ltr('x')} ממוקם ${blank(6, 'direction')} למספר 6.</li>
<li>המספר 4 שעל ציר ${ltr('y')} ממוקם מתחת למספר ${blank(3, 'number')}.</li>
<li>המספר 2 שעל ציר ${ltr('x')} ממוקם ${blank(6, 'direction')} למספר 5.</li>
</ul>
</section>
</div>
<div class="cols-2">
<section class="q-card">
<h3>ד. סמנו על ציר ${ltr('x')} את המספר ${mixed(3, 1, 2)}, והשלימו.</h3>
<ul class="tasks">
<li>המספר ${mixed(3, 1, 2)} ממוקם מימין למספר ${blank(3, 'number')}.</li>
<li>המספר ${mixed(3, 1, 2)} ממוקם ${blank(6, 'direction')} למספר 4.</li>
<li>המספר ${blank(4, 'number')} ממוקם באמצע, בין 5 ל־6.</li>
<li>המספר ${mixed(2, 1, 2)} ממוקם בין המספר ${blank(3, 'number')} למספר 3.</li>
</ul>
</section>
<section class="q-card">
<h3>ה. השלימו על הנקודות שבסרטוט.</h3>
<!-- Alternating on purpose: point -> axis, then axis -> point (Yaniv's rule). -->
<ul class="tasks">
<li>נקודה ${ltr('B')} ממוקמת על ציר ${blank(3, 'letter')}.</li>
<li>על ציר ${ltr('y')} ממוקמת נקודה ${blank(3, 'letter')}.</li>
<li>נקודה ${ltr('A')} ממוקמת ${blank(6, 'direction')} לציר ${ltr('y')}.</li>
<li>מתחת לנקודה ${ltr('A')} ממוקם על ציר ${ltr('x')} המספר ${blank(3, 'number')}.</li>
</ul>
</section>
</div>
`,
});
