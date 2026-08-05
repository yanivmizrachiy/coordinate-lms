import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

export const SUSPECT_POINT_PRINT: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'הנקודה החשודה',
  subtitle: 'פוסלים לפי הרמזים, ומקיפים את הנקודה היחידה שמתאימה',
  content: `
<div class="rule-box">
הרמזים מדברים על שיעור ה־${ltr('x')} ועל שיעור ה־${ltr('y')} של הנקודה. מתחו קו
על כל נקודה שאינה מתאימה לרמז, והקיפו את הנקודה שנשארה. היא מתאימה לכל הרמזים
יחד, ולכן היא הנקודה ה${blank(6, 'property')}.
</div>
<section class="q-card">
<h3>א. שש נקודות חשודות במערכת אחת.</h3>
<p>לפניכם שש נקודות מסומנות באותיות. שני הסיבובים שלמטה עובדים על הסרטוט הזה.</p>
${grid({
  size: 'lg',
  label: 'שש נקודות מסומנות באותיות: A במיקום (2,3), B במיקום (5,3), C במיקום (5,1), D במיקום (2,1), E במיקום (4,5), F במיקום (7,2)',
  points: [
    { x: 2, y: 3, label: 'A' },
    { x: 5, y: 3, label: 'B' },
    { x: 5, y: 1, label: 'C' },
    { x: 2, y: 1, label: 'D' },
    { x: 4, y: 5, label: 'E' },
    { x: 7, y: 2, label: 'F' },
  ],
})}
</section>
<div class="two-col">
<section class="q-card">
<h3>ב. סיבוב 1: מי הנקודה החשודה?</h3>
<p>רמז 1: שיעור ה־${ltr('x')} שווה 5.</p>
<p>רמז 2: שיעור ה־${ltr('y')} גדול מ־2.</p>
<ul class="tasks compact">
<li>לרמז הראשון מתאימות שתי נקודות בלבד: הנקודה ${blank(2, 'letter')} והנקודה ${blank(2, 'letter')}.</li>
<li>מבין השתיים, הרמז השני פוסל את זו שבה שיעור ה־${ltr('y')} ${blank(4, 'relation')} מ־2.</li>
<li>הקיפו את הנקודה שנשארה, וכתבו את שיעוריה: ${pair()}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. סיבוב 2: אותן שש נקודות, שני רמזים אחרים.</h3>
<p>רמז 1: שיעור ה־${ltr('y')} קטן מ־3.</p>
<p>רמז 2: הנקודה ממוקמת על אותו קו אנכי כמו הנקודה ${ltr('(7,0)')}.</p>
<ul class="tasks compact">
<li>לשתי נקודות שממוקמות על אותו קו אנכי יש שיעור ${blank(3, 'letter')} זהה.</li>
<li>הקו האנכי שעובר דרך הנקודה ${ltr('(7,0)')} הוא הקו שבו ערך ה־${ltr('x')} שווה ${blank(3, 'number')}.</li>
<li>הקיפו את הנקודה החשודה בסיבוב הזה. ערך ה־${ltr('x')} שלה גדול יותר משל הנקודה שהקפתם בסיבוב 1, ולכן היא ממוקמת ${blank(6, 'direction')} לה, ושיעוריה ${pair()}.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ד. סמנו נקודה חשודה משלכם.</h3>
<ul class="tasks">
<li>סמנו על הסרטוט נקודה ${ltr('G')} שרחוקה מציר ${ltr('x')} 6 יחידות, וכתבו את שיעוריה: ${pair('G')}.</li>
<li>רמז שמתאים לנקודה ${ltr('G')} בלבד, ואינו מתאים לאף אחת משש הנקודות המודפסות: שיעור ה־${ltr('y')} שלה ${blank(4, 'relation')} מ־5.</li>
<li>רמז נוסף שמתאים לנקודה ${ltr('G')} שסימנתם: ערך ה־${ltr('x')} שלה שווה ${blank(3, 'number')}.</li>
</ul>
</section>
`,
});
