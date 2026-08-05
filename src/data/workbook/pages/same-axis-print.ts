import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, wordBlank } from '../authoring';

export const SAME_AXIS_PRINT: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'אותו x או אותו y',
  subtitle: 'מקיפים נקודות שיש להן שיעור זהה — ומגלים מילה',
  content: `
<div class="rule-box">
בכל סרטוט מסומנת נקודה אחת, ולצידה כתובים שיעוריה; לצד כל נקודה אחרת כתובה אות.
הקיפו בעיפרון את כל הנקודות שיש להן אותו שיעור כמו הנקודה המסומנת: אותו שיעור
${ltr('x')} — הנקודות ממוקמות על קו ${blank(5, 'property')}; אותו שיעור ${ltr('y')} —
הנקודות ממוקמות על קו אופקי. האותיות שבתוך העיגולים יוצרות מילה.
</div>
<div class="two-col">
<section class="q-card">
<h3>א. אותו שיעור ${ltr('x')} כמו הנקודה ${ltr('(3,1)')}.</h3>
${grid({
  size: 'md',
  label: 'מערכת צירים ובה חמש נקודות: הנקודה המסומנת 3,1 והנקודות ז, ה, ק, ט',
  points: [
    { x: 3, y: 1, label: '(3,1)', color: '#dc2626' },
    { x: 3, y: 5, label: 'ז' },
    { x: 3, y: 3, label: 'ה' },
    { x: 6, y: 1, label: 'ק' },
    { x: 5, y: 4, label: 'ט' },
  ],
})}
<ul class="tasks compact">
<li>הקפתם ${blank(3, 'number')} נקודות, ובכולן שיעור ה־${ltr('x')} הוא 3.</li>
<li>הנקודות שהקפתם ממוקמות על קו ${blank(5, 'property')}.</li>
<li>האותיות שבנקודות שהקפתם, מלמעלה למטה, הן ${blank(3, 'letter')} ו־${blank(3, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. אותו שיעור ${ltr('y')} כמו הנקודה ${ltr('(2,2)')}.</h3>
${grid({
  size: 'md',
  label: 'מערכת צירים ובה חמש נקודות: הנקודה המסומנת 2,2 והנקודות י, ם, ב, ל',
  points: [
    { x: 2, y: 2, label: '(2,2)', color: '#dc2626' },
    { x: 7, y: 2, label: 'י' },
    { x: 5, y: 2, label: 'ם' },
    { x: 2, y: 5, label: 'ב' },
    { x: 4, y: 5, label: 'ל' },
  ],
})}
<ul class="tasks compact">
<li>בשתי הנקודות שהקפתם שיעור ה־${ltr('y')} הוא ${blank(3, 'number')}.</li>
<li>לשתי הנקודות שהקפתם ולנקודה ${ltr('(2,2)')} יש שיעור ${blank(3, 'letter')} זהה.</li>
<li>האותיות שבנקודות שהקפתם, מימין לשמאל, הן ${blank(3, 'letter')} ו־${blank(3, 'letter')}.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ג. מרכיבים את המילה.</h3>
<ul class="tasks compact">
<li>כתבו את ארבע האותיות שהקפתם לפי סדר הסעיפים, מימין לשמאל: ${blank(10, 'concept')}.</li>
<li>מה קיבלתם? ${wordBlank('medium', 'concept', 'מקום להשלמת המילה שהתגלתה')}</li>
<li>לשתי הנקודות שהקפתם בסעיף ב יש שיעור ${ltr('y')} זהה, ולכן הקטע שביניהן מקביל לציר ${blank(3, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. מזהים בלי סרטוט.</h3>
<p>הקיפו כל נקודה שיש לה אותו שיעור ${ltr('x')} כמו הנקודה ${ltr('(4,2)')}:</p>
<div class="choice-row">
<span class="choice">${ltr('(4,5)')}</span>
<span class="choice">${ltr('(6,2)')}</span>
<span class="choice">${ltr('(2,4)')}</span>
<span class="choice">${ltr('(4,0)')}</span>
<span class="choice">${ltr('(4,6)')}</span>
</div>
<ul class="tasks compact">
<li>בכל הנקודות שהקפתם שיעור ה־${ltr('x')} הוא ${blank(3, 'number')}, ולכן כולן ממוקמות על קו אחד עם הנקודה ${ltr('(4,2)')}.</li>
<li>כתבו שתי נקודות משלכם שיש להן שיעור ${ltr('y')} זהה: ${pair()} ו־${pair()}.</li>
</ul>
</section>
`,
});
