import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

export const READ_PAIRS: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'קוראים נקודה מהסרטוט',
  subtitle: 'מזהים את השיעורים של נקודה שכבר מסומנת',
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
<ul class="tasks compact">
<li>בנקודה ${blank(4, 'letter')} שיעור ה־${ltr('x')} הוא 5 ושיעור ה־${ltr('y')} הוא 2, והיא נכתבת ${pair()}.</li>
<li>בנקודה ${ltr('A')} שיעור ה־${ltr('x')} הוא ${blank(3, 'number')} ושיעור ה־${ltr('y')} הוא 5, והיא נכתבת ${pair('A')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. השלימו.</h3>
<ul class="tasks compact">
<li>המספר המתאים לציר האופקי הוא שיעור ה־${blank(4, 'letter')}.</li>
<li>המספר המתאים לציר האנכי הוא שיעור ה־${blank(4, 'letter')}.</li>
<li>כדי לקבוע נקודה במישור משתמשים ב־${blank(4, 'number')} מספרים.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. הסדר בזוג הסדור משנה.</h3>
<ul class="tasks compact">
<li>הזוג הסדור ${ltr('(2,5)')} מתאר את נקודה ${blank(3, 'letter')}.</li>
<li>את נקודה ${ltr('B')} מתאר הזוג הסדור ${pair()}.</li>
<li>בשני הזוגות מופיעים אותם מספרים, אבל ה${blank(5, 'concept')} שלהם שונה — ולכן הם מתארים שתי נקודות שונות.</li>
</ul>
</section>
`,
});
