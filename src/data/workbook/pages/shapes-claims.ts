import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, calcBox } from '../authoring';

/* נשאב מריפו parabula-next של יניב („רביע ראשון — 21 דפי עבודה", עמוד 18,
   דף הטענות), שוחזר ממפתח התשובות למורה והותאם לכללי USER_MEMORY.md —
   ובראשם: „נכונה בהכרח / ייתכן שנכונה / לא ייתכן", לעולם לא „תמיד/לפעמים".
   The squares summary already asks the learner to JUDGE claims; this sheet
   teaches HOW a verdict is earned — a general reason, or an example and a
   counterexample. The two-rectangle computation (same area, different
   perimeters) is the counterexample the source page was built around. */
export const SHAPES_CLAIMS: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'טענות על נקודות, הזזות ושטחים',
  subtitle: 'מכריעים כל טענה, ומשלימים את הדוגמה שמכריעה אותה',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">יש טענות שנכונות בהכרח, יש שלא ייתכן שהן נכונות, ויש טענות ש${blank(5, 'relation')} שהן נכונות.</div>
<div class="completion-sentence">טענה כזאת מכריעים בעזרת ${blank(5, 'concept')} — נקודה או צורה שמראות מה באמת קורה.</div>
</div>
<div class="two-col">
<section class="q-card">
<h3>א. נקודה ששני שיעוריה זהים ממוקמת על אחד הצירים.</h3>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span></div>
<ul class="tasks compact">
<li><b>נועה</b> אומרת: „כל נקודה ששני שיעוריה זהים ממוקמת על ציר.”</li>
<li><b>גיא</b> אומר: „רק נקודה אחת כזאת ממוקמת על ציר.”</li>
<li>צודק/צודקת: ${blank(5, 'letter')}.</li>
<li>הנקודה היחידה ששני שיעוריה זהים והיא ממוקמת על ציר היא ${pair()}.</li>
<li>כתבו נקודה ששני שיעוריה זהים והיא אינה ממוקמת על אף ציר: ${pair()}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הזזה של נקודה ימינה משנה את שיעור ה־${ltr('y')} שלה.</h3>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span></div>
<ul class="tasks compact">
<li>בהזזה ימינה משתנה רק ${blank(5, 'concept')} של הנקודה.</li>
<li>הנקודה ${ltr('A(2,3)')} אחרי הזזה של 4 יחידות ימינה מגיעה אל הנקודה ${pair()}.</li>
<li>אחרי ההזזה ${ltr('x = 6')}, ושיעור ה־${ltr('y')} שווה ${blank(2, 'number')} — בדיוק כמו לפני ההזזה.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. המלבן הראשון: אורך 6 יח', רוחב 2 יח'.</h3>
${grid({
  size: 'sm',
  label: 'המלבן הראשון: אורך 6 יחידות ורוחב 2 יחידות',
  segments: [
    { from: [1, 2], to: [7, 2], type: 'shape' },
    { from: [7, 2], to: [7, 4], type: 'shape' },
    { from: [7, 4], to: [1, 4], type: 'shape' },
    { from: [1, 4], to: [1, 2], type: 'shape' },
  ],
})}
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>ד. המלבן השני: רוחבו 3 יח' ואורכו 4 יח'.</h3>
${grid({
  size: 'sm',
  label: 'המלבן השני: אורך 4 יחידות ורוחב 3 יחידות',
  segments: [
    { from: [1, 1], to: [5, 1], type: 'shape' },
    { from: [5, 1], to: [5, 4], type: 'shape' },
    { from: [5, 4], to: [1, 4], type: 'shape' },
    { from: [1, 4], to: [1, 1], type: 'shape' },
  ],
})}
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card span-2">
<h3>ה. דנה טוענת: אם ההיקפים של שני מלבנים שונים, בהכרח גם השטחים שלהם שונים.</h3>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span></div>
<ul class="tasks compact">
<li>ההפרש בין שני ההיקפים שחישבתם הוא ${blank(2, 'number')} יח', ובכל זאת שני השטחים ${blank(4, 'relation')}.</li>
<li>שני המלבנים האלה הם ${blank(5, 'concept')} לטענה של דנה.</li>
</ul>
</section>
</div>
`,
});
