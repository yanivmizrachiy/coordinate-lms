import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* Drawn from Yaniv's misparim repo (the „זווית לכיתה ז'” unit) — the questions
   there that live in the first quadrant. The mathematics is his; the wording is
   rebuilt to this booklet's rules: completions instead of open answers, „הנקודה”
   before every letter, and a marking task that is asked about afterwards. */
export const RAYS_RIGHT_ANGLE: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'זוויות ברביע הראשון',
  subtitle: 'שתי קרניים מראשית הצירים — הזווית שביניהן',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">קרן שיוצאת מראשית הצירים ועוברת דרך נקודה שעל ציר ${ltr('x')} ממוקמת על ציר ${ltr('x')} עצמו, ולכן היא ${blank(5, 'property')}.</div>
<div class="completion-sentence">קרן שיוצאת מראשית הצירים ועוברת דרך נקודה שעל ציר ${ltr('y')} היא אנכית, ולכן הזווית בין שתי הקרניים האלה היא זווית ${blank(5, 'property')}.</div>
</div>
<section class="q-card">
<h3>א. סמנו, ציירו ובדקו — ואז הקיפו.</h3>
<p>סמנו כל אפשרות על הסרטוט, ציירו את הקרן מראשית הצירים דרכה, ובדקו איזו יוצרת זווית ישרה.</p>
${grid({ size: 'md', label: 'מערכת צירים לבדיקת האפשרויות: מסמנים נקודה ומציירים ממנה קרן' })}
<ul class="tasks compact">
<li>אחת הקרניים של זווית ישרה עוברת דרך הנקודה ${ltr('(4,0)')}. הנקודה שיכולה להיות על הקרן השנייה היא:
<span class="choice-row"><span class="choice">${ltr('(0,4)')}</span><span class="choice">${ltr('(4,2)')}</span><span class="choice">${ltr('(2,4)')}</span><span class="choice">${ltr('(4,4)')}</span></span></li>
<li>אחת הקרניים עוברת דרך הנקודה ${ltr('(0,6)')}. הנקודה שיכולה להיות על הקרן השנייה היא:
<span class="choice-row"><span class="choice">${ltr('(6,0)')}</span><span class="choice">${ltr('(3,6)')}</span><span class="choice">${ltr('(6,2)')}</span><span class="choice">${ltr('(1,6)')}</span></span></li>
</ul>
</section>
<section class="q-card">
<h3>ב. השלימו לפי הסרטוט.</h3>
${grid({
  size: 'md',
  label: 'שתי קרניים מראשית הצירים: אחת דרך (5,0) ואחת דרך (0,3)',
  points: [{ x: 0, y: 0, label: 'O' }, { x: 5, y: 0, label: 'P' }, { x: 0, y: 3, label: 'Q' }],
  segments: [
    { from: [0, 0], to: [5, 0], type: 'shape' },
    { from: [0, 0], to: [0, 3], type: 'shape' },
  ],
})}
<ul class="tasks compact">
<li>הקרן ${ltr('OP')} ממוקמת על ציר ${blank(3, 'letter')}, והקרן ${ltr('OQ')} ממוקמת על ציר ${ltr('y')}.</li>
<li>גודל הזווית שנוצרת בין שתי הקרניים הוא ${blank(4, 'number')} מעלות.</li>
<li>בכל נקודה שעל הקרן ${ltr('OP')} שיעור ה־${ltr('y')} הוא ${blank(3, 'number')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. כתבו שתי נקודות שונות שיכולות להיות על הקרן השנייה.</h3>
<p>אחת הקרניים של זווית ישרה יוצאת מראשית הצירים ועוברת דרך הנקודה ${ltr('(3,0)')}.</p>
<ul class="tasks compact">
<li>הקרן הזאת ממוקמת על ציר ${blank(3, 'letter')}, ולכן הקרן השנייה חייבת לשכב על הציר האחר.</li>
<li>שתי נקודות אפשריות: ${pair()} ו־${pair()}.</li>
<li>בשתיהן ערך ה־${ltr('x')} הוא ${blank(3, 'number')}, וזה מה שמעמיד אותן על אותה קרן.</li>
</ul>
</section>
`,
});
