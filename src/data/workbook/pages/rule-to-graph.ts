import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, grid, wordBank } from '../authoring';

/* נשאב מריפו parabula-next של יניב („רביע ראשון — 21 דפי עבודה", עמוד 16,
   „מכלל לטבלה ולגרף"), שוחזר ממפתח התשובות למורה והותאם לכללי USER_MEMORY.md.
   The patterns chapter ends with a rule in words („כתבו כלל המתאר את הדפוס”);
   this sheet walks the same road in the other direction — the rule is given,
   the learner builds the table and marks the points. The graphs chapter later
   does the reverse trip on real data, so both directions are practised. */
export const RULE_TO_GRAPH: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מכלל לטבלה ולגרף',
  subtitle: 'בונים טבלה מכלל, מסמנים את הנקודות, ומגלים קו',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">הכלל ${ltr('y = 2x')} אומר: שיעור ה־${ltr('y')} גדול פי ${blank(2, 'number')} מערך ה־${ltr('x')}.</div>
<div class="completion-sentence">מכל כלל אפשר לבנות טבלה, ומכל טבלה אפשר לסמן ${blank(5, 'concept')} על מערכת הצירים.</div>
</div>
${wordBank(['נקודות', '2'])}
<div class="two-col">
<section class="q-card span-2">
<h3>א. מהכלל ${ltr('y = 2x')} אל הטבלה ואל הסרטוט.</h3>
<table class="work-table center">
<thead>
<tr><th>ערך ${ltr('x')}</th><td>0</td><td>1</td><td>2</td><td>3</td></tr>
</thead>
<tbody>
<tr><th>שיעור ${ltr('y')}</th><td>${blank(2)}</td><td>${blank(2)}</td><td>${blank(2)}</td><td>${blank(2)}</td></tr>
</tbody>
</table>
<ul class="tasks compact">
<li>כתבו את ארבע הנקודות מהטבלה: <span class="pair math-ltr" dir="ltr">(0,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(1,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(2,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(3,<span class="pair-blank"></span>)</span>.</li>
<li>סמנו את ארבע הנקודות על מערכת הצירים.</li>
</ul>
${grid({ size: 'md', label: 'מערכת צירים ריקה לסימון הנקודות של הכלל' })}
<ul class="tasks compact">
<li>הנקודות שסימנתם ממוקמות על קו ${blank(4, 'property')} אחד.</li>
<li>בכל נקודה שמתאימה לכלל, שיעור ה־${ltr('y')} גדול פי 2 מערך ה־${blank(2, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הכלל ${ltr('y = x + 2')} — חלק מהטבלה כבר מלא.</h3>
<table class="work-table center">
<thead>
<tr><th>ערך ${ltr('x')}</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
</thead>
<tbody>
<tr><th>שיעור ${ltr('y')}</th><td>2</td><td>${blank(2)}</td><td>${blank(2)}</td><td>5</td><td>${blank(2)}</td></tr>
</tbody>
</table>
<ul class="tasks compact">
<li>בכל נקודה שמתאימה לכלל, שיעור ה־${ltr('y')} גדול ב־${blank(2, 'number')} מערך ה־${ltr('x')}.</li>
<li>אם ערך ה־${ltr('x')} שווה 6, שיעור ה־${ltr('y')} הוא ${blank(2, 'number')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. הכלל ${ltr('x = y + 4')} — הפעם שיעורי ה־${ltr('y')} נתונים.</h3>
<table class="work-table center">
<thead>
<tr><th>שיעור ${ltr('y')}</th><td>0</td><td>1</td><td>2</td><td>3</td></tr>
</thead>
<tbody>
<tr><th>ערך ${ltr('x')}</th><td>${blank(2)}</td><td>${blank(2)}</td><td>${blank(2)}</td><td>${blank(2)}</td></tr>
</tbody>
</table>
<ul class="tasks compact">
<li>בכלל הזה הגדול מבין השניים הוא תמיד ערך ה־${blank(2, 'letter')}.</li>
<li>אם ${ltr('y = 2')}, אז ערך ה־${ltr('x')} הוא ${blank(2, 'number')}.</li>
</ul>
</section>
<section class="q-card span-2">
<h3>ד. כלל משלכם.</h3>
<ul class="tasks compact">
<li>בחרו מספר והשלימו כלל: שיעור ה־${ltr('y')} גדול ב־${blank(2, 'number')} מערך ה־${ltr('x')}.</li>
<li>כתבו שתי נקודות שמתאימות לכלל שלכם: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ו־<span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>, וסמנו אותן על מערכת הצירים שבמשימה א.</li>
<li>בשתי הנקודות שסימנתם, ההפרש בין שיעור ה־${ltr('y')} ובין ערך ה־${ltr('x')} הוא ${blank(2, 'number')}.</li>
</ul>
</section>
</div>
`,
});
