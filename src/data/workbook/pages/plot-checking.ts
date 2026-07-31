import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* The correction task used to hand the mistake over („גיא סימן K(2,5) במקום
   K(5,2)”) and then ask what the mistake was. Now the sheet shows only the task
   Guy was given and what he actually drew; finding the swap is the work. */
export const PLOT_B: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'בודקים ומתקנים סימון',
  subtitle: 'הסדר בזוג הסדור קובע את המקום',
  content: `
<section class="q-card">
<h3>א. באיזה שרטוט סומנו נכון הנקודה ${ltr('A(2,5)')} והנקודה ${ltr('B(5,2)')}?</h3>
<div class="choice-grid">
<div><b>1</b>
${grid({ size: 'sm', label: 'אפשרות 1', points: [{ x: 5, y: 2, label: 'A' }, { x: 2, y: 5, label: 'B' }] })}
</div>
<div><b>2</b>
${grid({ size: 'sm', label: 'אפשרות 2', points: [{ x: 2, y: 5, label: 'A' }, { x: 5, y: 2, label: 'B' }] })}
</div>
<div><b>3</b>
${grid({ size: 'sm', label: 'אפשרות 3', points: [{ x: 2, y: 3, label: 'A' }, { x: 5, y: 3, label: 'B' }] })}
</div>
<div><b>4</b>
${grid({ size: 'sm', label: 'אפשרות 4', points: [{ x: 3, y: 5, label: 'A' }, { x: 3, y: 2, label: 'B' }] })}
</div>
</div>
<ul class="tasks compact">
<li>השרטוט הנכון הוא מספר ${blank(3, 'number')}.</li>
<li>בשרטוט הנכון ערך ה־${ltr('x')} של הנקודה ${ltr('A')} הוא ${blank(3, 'number')}, כי ערך ה־${ltr('x')} נכתב מצד שמאל.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. גיא התבקש לסמן את הנקודה ${ltr('K(5,2)')}. זה מה שהוא סימן:</h3>
<div class="cols-2">
${grid({
  size: 'md',
  label: 'הנקודה שגיא סימן בפועל',
  points: [{ x: 2, y: 5, label: 'K', color: '#dc2626' }],
})}
<div>
<ul class="tasks compact">
<li>הנקודה שגיא סימן בפועל היא ${pair()}.</li>
<li>הנקודה שהוא היה צריך לסמן היא ${pair('K')}.</li>
<li>לכן גיא החליף בין ערך ה־${ltr('x')} ובין ${blank(5, 'concept')} ה־${ltr('y')}.</li>
<li>סמנו על הסרטוט את המקום הנכון, ובדקו: הוא ${blank(6, 'direction')} לנקודה שגיא סימן.</li>
</ul>
</div>
</div>
</section>
<section class="q-card">
<h3>ג. אם מזיזים את הנקודה ${ltr('(2,5)')} — לאן מגיעים?</h3>
<ul class="tasks compact">
<li>אם מזיזים 3 יחידות ימינה, אז מגיעים אל הנקודה ${pair()}.</li>
<li>אם מזיזים 2 יחידות ${blank(6, 'direction')}, אז מגיעים אל הנקודה ${ltr('(2,3)')}.</li>
<li>כדי להגיע אל הנקודה ${ltr('(2,1)')} צריך הזזה של ${blank(4, 'number')} יחידות למטה.</li>
</ul>
</section>
`,
});
