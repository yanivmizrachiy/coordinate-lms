import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, wordBank } from '../authoring';

export const AXES_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'הכרת מערכת הצירים',
  subtitle: 'שמות הצירים, הראשית ומיקום ביחס לצירים',
  content: `
<div class="two-col">
<section class="q-card span-2">
<h3>א. השלימו את החסר.</h3>
${wordBank(['ציר x', 'ציר y', 'O'])}
${grid({
  size: 'lg',
  // One drawing serves the whole sheet: naming the axes, marking the origin,
  // reading where A and B sit, and marking the learner's own points.
  axisNames: false,
  label: 'מערכת צירים ובה תיבות ריקות לשמות הצירים ולראשית, והנקודות A ו־B',
  points: [
    { x: 3, y: 4, label: 'A' },
    { x: 6, y: 2, label: 'B' },
  ],
})}
</section>
<section class="q-card">
<h3>ב. השלימו את החסר.</h3>
<ul class="tasks compact">
<li>נקודה ${ltr('A')} ממוקמת מעל ציר ${blank(4, 'letter')} ומימין לציר ${blank(4, 'letter')}.</li>
<li>נקודה ${ltr('B')} ממוקמת מימין לנקודה ${ltr('A')}, ולכן ערך ${ltr('x')} שלה ${blank(6, 'relation')} יותר.</li>
<li>נקודה ${blank(4, 'letter')} ממוקמת מתחת לנקודה ${ltr('A')}.</li>
<li>כאשר ערך ${ltr('x')} גדל, נעים ${blank(6, 'direction')}.</li>
<li>כאשר ערך ${blank(4, 'letter')} גדל, נעים למעלה.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. סמנו על הסרטוט נקודות משלכם, וכתבו את הזוג הסדור של כל אחת.</h3>
<ul class="tasks compact">
<li>נקודה ${ltr('C')} — מימין לנקודה ${ltr('B')} ומעל ציר ${ltr('x')}. &nbsp; ${pair('C')}</li>
<li>נקודה ${ltr('D')} — מתחת לנקודה ${ltr('A')} ומשמאל לנקודה ${ltr('B')}. &nbsp; ${pair('D')}</li>
<li>נקודה ${ltr('E')} — על ציר ${ltr('y')} עצמו. &nbsp; ${pair('E')}</li>
</ul>
</section>
<section class="q-card span-2">
<h3>ד. נכון או לא נכון</h3>
<p>סמנו בכל שורה אם המשפט נכון או לא נכון.</p>
<table class="tf-table" data-balanced="true">
<tbody>
<tr data-answer="true"><td>ראשית הצירים היא הנקודה (0,0).</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-2-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-2-1" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="false"><td>ציר x הוא הציר האנכי.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-2-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-2-2" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="true"><td>נקודה שממוקמת מעל ציר x ומימין לציר y היא נקודה ברביע הראשון.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-2-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-2-3" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="false"><td>הנקודה (3,0) ממוקמת על ציר y.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-2-4" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-2-4" value="false"><span>לא נכון</span></label>
</div></td></tr>
</tbody>
</table>
</section>
</div>
`,
});
