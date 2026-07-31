import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, ltr } from '../authoring';

const PB = '<span class="pair-blank"></span>';
const pair = (name = ''): string =>
  `<span class="pair math-ltr" dir="ltr">${name}(${PB},${PB})</span>`;

/* Rewritten to Yaniv's style: the opening rule is a completion rather than a
   paragraph to read, every task is a full sentence rather than an "x = ___"
   form, and no two items in a group ask the same thing with different numbers. */
export const ORDERED_PAIR_DRILL: WorkbookPageContent = sheet({
  sectionClass: 'sheet guided',
  title: 'הזוג הסדור — סדר, סוגריים ותרגול',
  subtitle: 'ערך x מצד שמאל, שיעור y מצד ימין',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">כל נקודה נכתבת כזוג סדור בתוך ${wordBlank('medium', 'concept', 'מקום להשלמת המילה סוגריים')}.</div>
<div class="completion-sentence">המספר שנכתב מצד שמאל הוא ערך ${wordBlank('short', 'letter', 'מקום להשלמת האות x')}, והמספר שנכתב מצד ימין הוא שיעור ${ltr('y')}.</div>
<div class="completion-sentence">מכיוון שיש סֵדֶר, קוראים לזה זוג ${wordBlank('medium', 'concept', 'מקום להשלמת המילה סדור')}.</div>
</div>
<section class="q-card">
<h3>א. נתונה נקודה — השלימו את שיעוריה.</h3>
<ul class="tasks">
<li>בנקודה ${ltr('A(3,5)')} ערך ה־${ltr('x')} הוא ${blank(3, 'number')}, ושיעור ה־${ltr('y')} הוא ${blank(3, 'number')}.</li>
<li>בנקודה ${ltr('B(6,2)')} המספר 2 הוא ${blank(6, 'concept')} ה־${ltr('y')}.</li>
<li>בנקודה ${ltr('C(0,4)')} ערך ה־${ltr('x')} הוא 0, ולכן היא ממוקמת על ציר ${blank(3, 'letter')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. נתונים שיעורים — כתבו את הזוג הסדור.</h3>
<ul class="tasks">
<li>ערך ${ltr('x')} הוא 4 ושיעור ${ltr('y')} הוא 7 &nbsp;←&nbsp; ${pair()}</li>
<li>נקודה בשם ${ltr('D')} ששיעוריה 8 ו־1 &nbsp;←&nbsp; ${pair('D')}</li>
<li>נקודה שממוקמת בראשית הצירים &nbsp;←&nbsp; ${pair()}</li>
<li>נקודה שערך ה־${ltr('x')} שלה 5 והיא ממוקמת על ציר ${ltr('x')} &nbsp;←&nbsp; ${pair()}</li>
</ul>
</section>
<section class="q-card">
<h3>ג. הסדר משנה.</h3>
<ul class="tasks">
<li>נקודה ${ltr('(2,6)')} ונקודה ${ltr('(6,2)')} ${blank(6, 'relation')} אותה נקודה.</li>
<li>בנקודה ${ltr('(2,6)')} ערך ה־${ltr('x')} הוא 2, ובנקודה ${ltr('(6,2)')} הוא ${blank(3, 'number')}.</li>
<li>לכן נקודה ${ltr('(6,2)')} ממוקמת ${blank(6, 'direction')} לנקודה ${ltr('(2,6)')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. השלימו — האות נכתבת משמאל לסוגריים.</h3>
<ul class="tasks">
<li>נקודה בשם ${ltr('E')} ששיעוריה 5 ו־3 נכתבת ${pair('E')}</li>
<li>בזוג הסדור ${ltr('(7,2)')} המספר 2 הוא שיעור ${blank(3, 'letter')}.</li>
<li>הזוג הסדור נכתב תמיד בתוך ${blank(7, 'concept')}.</li>
</ul>
</section>
`,
});
