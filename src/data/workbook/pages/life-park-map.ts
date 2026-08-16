import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exercise, exerciseGiven, wordBank } from '../authoring';

/* נשאב מריפו parabula-next של יניב („רביע ראשון — 21 דפי עבודה", עמוד 19,
   „מפת הפארק"), שוחזר ממפתח התשובות למורה והותאם לכללי USER_MEMORY.md.
   A park map IS a coordinate system: every object is a point, every path runs
   along a street line, so a walk is a sum of differences — the same mathematics
   as the courier sheet, asked from the map-reader's side. */
export const LIFE_PARK_MAP: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מפת הפארק — כל עצם הוא נקודה',
  subtitle: 'קוראים מפה, מודדים שבילים ומחשבים מסלול',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">במפת הפארק כל עצם הוא ${blank(4, 'concept')}, וכל שביל מקביל לאחד הצירים.</div>
<div class="completion-sentence">אורך כל שביל הוא תוצאה של תרגיל ${blank(4, 'concept')} בין השיעורים.</div>
</div>
${wordBank(['חיסור', 'נקודה'])}
<section class="q-card">
<h3>א. קוראים את המפה.</h3>
<p>על מפת הפארק מסומנים שישה עצמים:</p>
<ul class="tasks compact">
<li>השער ממוקם בנקודה ${ltr('A(1,0)')}, והספסל ממוקם בנקודה ${ltr('B(3,2)')}.</li>
<li>המזרקה ממוקמת בנקודה ${ltr('C(6,2)')}, והנדנדה ממוקמת בנקודה ${ltr('D(0,5)')}.</li>
<li>העץ ממוקם בנקודה ${ltr('E(6,5)')}, והיציאה ממוקמת בנקודה ${ltr('F(8,0)')}.</li>
</ul>
${grid({
  /* md גלש 18px מה-A4 עם ארבעת הסעיפים; sm מחזיר את הדף לגבולו — והבדיקות
     של גודל-הכתב והתוויות שומרות שהמפה נשארת קריאה. */
  size: 'md',
  label: 'מפת הפארק: שער, ספסל, מזרקה, נדנדה, עץ ויציאה',
  points: [
    { x: 1, y: 0, label: 'A', icon: 'gate' },
    { x: 3, y: 2, label: 'B', icon: 'bench' },
    { x: 6, y: 2, label: 'C', icon: 'fountain' },
    { x: 0, y: 5, label: 'D', icon: 'swing' },
    { x: 6, y: 5, label: 'E', icon: 'tree' },
    { x: 8, y: 0, label: 'F', icon: 'exit' },
  ],
  segments: [
    { from: [3, 2], to: [6, 2], type: 'shape' },
    { from: [6, 2], to: [6, 5], type: 'shape' },
    { from: [6, 5], to: [0, 5], type: 'shape' },
    { from: [1, 0], to: [8, 0], type: 'guide' },
  ],
})}
<ul class="tasks compact">
<li>העצם שמתאים לנקודה ${ltr('(0,5)')} הוא ה${blank(5, 'concept')}.</li>
<li>על ציר ${ltr('x')} ממוקמים השער וה${blank(5, 'concept')}, כי שיעור ה־${ltr('y')} של שניהם שווה 0.</li>
<li>הנדנדה ממוקמת על ציר ${blank(2, 'letter')}, כי בנקודה שלה ${ltr('x = 0')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. שבילים עם שיעור ${ltr('y')} זהה.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות ${ltr('B(3,2)')} ו־${ltr('C(6,2)')} יש שיעור ${ltr('y')} זהה, ולכן השביל ${ltr('BC')} מקביל לציר ${blank(2, 'letter')}:</li>
</ul>
${exerciseGiven('BC', '6 − 3')}
<ul class="tasks compact">
<li>גם לשער ${ltr('A(1,0)')} וליציאה ${ltr('F(8,0)')} יש שיעור ${ltr('y')} זהה — והשביל ביניהם ממוקם על ציר ${blank(2, 'letter')} עצמו. כתבו את תרגיל החיסור של אורכו:</li>
</ul>
${exercise('AF')}
<ul class="tasks compact">
<li>כתבו שתי נקודות משלכם שיש להן שיעור ${ltr('x')} זהה: ${pair()} ו־${pair()}.</li>
</ul>
</section>
`,
});
