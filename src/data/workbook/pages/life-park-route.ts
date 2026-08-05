import type { WorkbookPageContent } from '../types';
import { blank, exerciseGiven, grid, ltr, pair, sheet } from '../authoring';

export const LIFE_PARK_ROUTE: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מסלולים במפת הפארק',
  subtitle: 'מציבים פנס, הולכים לאורך השבילים ומחשבים את הדרך',
  content: `
<section class="q-card">
<h3>א. אותה מפה — והמסלול של נועם מסומן עליה.</h3>
<p>המסלול המקווקו יוצא מהשער ${ltr('A(1,0)')}, עובר בספסל ${ltr('B(3,2)')} ובמזרקה ${ltr('C(6,2)')}, ומסתיים בעץ ${ltr('E(6,5)')}.</p>
${grid({
  size: 'md',
  label: 'מפת הפארק עם מסלול הליכה מקווקו מהשער אל העץ',
  points: [
    { x: 1, y: 0, label: 'A', icon: 'gate' },
    { x: 3, y: 2, label: 'B', icon: 'bench' },
    { x: 6, y: 2, label: 'C', icon: 'fountain' },
    { x: 0, y: 5, label: 'D', icon: 'swing' },
    { x: 6, y: 5, label: 'E', icon: 'tree' },
    { x: 8, y: 0, label: 'F', icon: 'exit' },
  ],
  segments: [
    { from: [1, 0], to: [3, 0], type: 'guide' },
    { from: [3, 0], to: [3, 2], type: 'guide' },
    { from: [3, 2], to: [6, 2], type: 'guide' },
    { from: [6, 2], to: [6, 5], type: 'guide' },
  ],
})}
</section>
<section class="q-card">
<h3>ב. מציבים פנס חדש.</h3>
<ul class="tasks compact">
<li>סמנו על המפה פנס שממוקם על ציר ${ltr('y')}, בגובה 3 יחידות. הנקודה שמתאימה לפנס היא ${pair()}.</li>
<li>הפנס ממוקם מתחת לנדנדה, וההפרש בין שיעורי ה־${ltr('y')} שלהם הוא ${blank(2, 'number')} יחידות.</li>
<li>סמנו גם נקודה ששיעור ה־${ltr('x')} שלה כמו של הספסל, מעל הספסל ומתחת לעץ, וכתבו אותה: ${pair()}.</li>
<li>הנקודה שסימנתם רחוקה מציר ${ltr('y')} ‏${blank(2, 'number')} יחידות.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. מחשבים את הדרך של נועם.</h3>
<ul class="tasks compact">
<li>מהשער אל הספסל הולכים לאורך השבילים: 2 יחידות ימינה ואחר כך 2 יחידות ${blank(4, 'direction')}, ובסך הכול:</li>
</ul>
${exerciseGiven('', '2 + 2')}
<ul class="tasks compact">
<li>אורך המסלול כולו, מהשער אל העץ:</li>
</ul>
${exerciseGiven('', '4 + 3 + 3')}
</section>
`,
});
