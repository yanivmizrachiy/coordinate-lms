import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, wordBank } from '../authoring';

/* Two halves of the same skill, in Yaniv's order: first read everything the
   drawing already says, then put a point on it yourself and answer about the
   point YOU chose — the answer is not in the book, so it cannot be copied. */
export const READ_FROM_DRAWING: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided dense',
  title: 'מה אפשר לקרוא מהסרטוט?',
  subtitle: 'קוראים נתונים על נקודות מסומנות, ואז מסמנים נקודה משלכם',
  content: `
<section class="q-card">
<h3>א. השלימו לפי הסרטוט.</h3>
${grid({
  size: 'md',
  label: 'ארבע נקודות מסומנות: A B C D',
  points: [
    { x: 2, y: 5, label: 'A' },
    { x: 5, y: 2, label: 'B' },
    { x: 5, y: 4, label: 'C' },
    { x: 3, y: 2, label: 'D' },
  ],
})}
${wordBank(['A', 'B', 'C', 'D', 'x', 'y', '2', '4', 'משמאל', 'אנכי'])}
<ul class="tasks compact">
<li>הנקודה שממוקמת הכי גבוה היא ${blank(3, 'letter')}.</li>
<li>שיעור ה־${ltr('y')} של נקודה ${ltr('C')} הוא ${blank(3, 'number')}.</li>
<li>נקודה ${ltr('D')} ממוקמת ${blank(6, 'direction')} לנקודה ${ltr('B')}.</li>
<li>לנקודות ${ltr('B')} ו־${ltr('C')} יש שיעור ${blank(3, 'letter')} זהה.</li>
<li>המרחק של נקודה ${ltr('A')} מציר ${ltr('y')} הוא ${blank(3, 'number')} יחידות.</li>
<li>הקטע ${ltr('BD')} מקביל לציר ${blank(3, 'letter')}.</li>
<li>נקודה ${blank(3, 'letter')} ממוקמת משמאל לכל שאר הנקודות.</li>
<li>נקודה ${ltr('B')} ונקודה ${ltr('C')} ממוקמות על אותו קו ${blank(5, 'property')}.</li>
<li>נקודה ${blank(3, 'letter')} רחוקה מציר ${ltr('x')} 5 יחידות.</li>
<li>הזוג הסדור של נקודה ${ltr('D')} הוא ${pair()}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. סמנו נקודה משלכם, ואז השלימו את החסר.</h3>
${grid({ size: 'md', label: 'מערכת צירים ריקה לסימון נקודה E שהתלמיד בוחר' })}
<ul class="tasks compact">
<li>סמנו על הסרטוט נקודה ${ltr('E')} שרחוקה מציר ${ltr('x')} 2 יחידות.</li>
<li>שיעורי הנקודה שסימנתם: ${pair('E')}.</li>
<li>המרחק של הנקודה שסימנתם מציר ${ltr('y')} הוא ${blank(4, 'number')} יחידות.</li>
</ul>
</section>
`,
});
