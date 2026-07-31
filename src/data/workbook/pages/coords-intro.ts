import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, ltr, pair, grid } from '../authoring';

export const COORDS_INTRO: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided dense',
  title: 'שיעור x ושיעור y',
  subtitle: 'קוראים את מיקום הנקודה לפי שני מספרים',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">שיעור ${ltr('x')} מתאר את המיקום ה${wordBlank('medium', 'property', 'מקום להשלמת המילה אופקי')}, והוא גם ה<b>מרחק</b> של הנקודה מציר ${ltr('y')}.</div>
<div class="completion-sentence">שיעור ${ltr('y')} מתאר את המיקום האנכי, והוא גם ה<b>מרחק</b> של הנקודה מציר ${wordBlank('short', 'letter', 'מקום להשלמת האות x')}.</div>
</div>
<section class="q-card">
<h3>א. דוגמה: הנקודה ${ltr('A(4,3)')}.</h3>
${grid({
  size: 'md',
  label: 'הנקודה A(4,3) ושני קווים מקווקווים ממנה: אחד אל ציר x ואחד אל ציר y, עם המרחק המסומן על כל אחד',
  points: [{ x: 4, y: 3, label: 'A(4,3)' }],
  // One dashed line to EACH axis: the pair of them is what makes a coordinate
  // visible as a distance — with only the drop to ציר x, half the idea is missing.
  segments: [
    { from: [4, 0], to: [4, 3], dashed: true, type: 'guide' },
    { from: [0, 3], to: [4, 3], dashed: true, type: 'guide' },
  ],
  // Every box points at what it describes. A coordinate label sits by its own
  // tick on its own axis; a distance label sits on the line it measures. Left
  // floating, „שיעור x = 4” could be read as belonging to either.
  labelboxes: [
    { text: 'שיעור x = 4', at: [5.7, 0.7], to: [4, 0] },
    { text: 'שיעור y = 3', at: [1.7, 4.9], to: [0, 3] },
    { text: "מרחק 4 יח' מציר y", at: [2.4, 3.85], to: [2.4, 3] },
    { text: "מרחק 3 יח' מציר x", at: [6.3, 2.1], to: [4, 2.1] },
  ],
})}
</section>
<section class="q-card">
<h3>ב. מרחק מהצירים.</h3>
<ul class="tasks compact">
<li>הנקודה ${ltr('A')} רחוקה מציר ${ltr('y')} ${blank(4, 'number')} יחידות, וזה בדיוק שיעור ${ltr('x')} שלה.</li>
<li>הנקודה ${ltr('A')} רחוקה מציר ${blank(4, 'letter')} 3 יחידות, וזה בדיוק שיעור ${ltr('y')} שלה.</li>
<li>ככל שנקודה רחוקה יותר מציר ${ltr('y')}, שיעור ${ltr('x')} שלה ${blank(6, 'relation')}.</li>
<li>נקודה שרחוקה 6 יחידות מציר ${ltr('y')} ו־2 יחידות מציר ${ltr('x')} נכתבת ${pair()}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. סמנו כל נקודה על הסרטוט, כתבו לידה את שמה, וכתבו את הזוג הסדור שלה.</h3>
<ul class="tasks">
<li>בנקודה ${ltr('A')} שיעור ${ltr('x')} הוא 2, ושיעור ${ltr('y')} הוא 5. &nbsp; ${pair('A')}</li>
<li>נקודה ${ltr('B')} רחוקה 6 יחידות מציר ${ltr('y')} ו־2 יחידות מציר ${ltr('x')}. &nbsp; ${pair('B')}</li>
<li>נקודה ${ltr('C')} ממוקמת על ציר ${ltr('x')}, ושיעור ${ltr('x')} שלה 3. &nbsp; ${pair('C')}</li>
</ul>
${grid({ size: 'lg', label: 'מערכת צירים לסימון שלוש הנקודות' })}
</section>
`,
});
