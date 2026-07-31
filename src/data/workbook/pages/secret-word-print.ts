import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid } from '../authoring';

/* מילת הצופן — הגרסה המודפסת. הדף הזה החליף שעשועון מקוון עם שדות הקלדה
   וכפתורי „בדקו": יניב — „המשימות שלנו רק להדפסה ולא מתוקשבות". אותה
   מיומנות (קריאת זוג סדור וזיהוי נקודה לפי תכונה), עכשיו על נייר: חמש
   אותיות מסומנות על מערכת אחת, חמש שאלות, והמילה נכתבת בסוף.

   האותיות במיקומן: נ(3,2) · ק(6,4) · ו(2,5) · ד(7,1) · ה(4,3) — המילה
   שמתקבלת, מימין לשמאל, היא „נקודה". */
export const SECRET_WORD_PRINT: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מילת הצופן',
  subtitle: 'קוראים נקודות, מזהים תכונות — ומפענחים מילה',
  content: `
<section class="q-card">
<h3>א. חמש אותיות מוצפנות במערכת.</h3>
<p>לפניכם מערכת צירים ובה חמש נקודות, ולצד כל נקודה אות. כל תשובה נכונה חושפת אות אחת של מילת הצופן.</p>
${grid({
  size: 'lg',
  label: 'חמש נקודות מסומנות באותיות: נ במיקום (3,2), ק במיקום (6,4), ו במיקום (2,5), ד במיקום (7,1), ה במיקום (4,3)',
  points: [
    { x: 3, y: 2, label: 'נ' },
    { x: 6, y: 4, label: 'ק' },
    { x: 2, y: 5, label: 'ו' },
    { x: 7, y: 1, label: 'ד' },
    { x: 4, y: 3, label: 'ה' },
  ],
})}
</section>
<section class="q-card">
<h3>ב. מפענחים אות־אות.</h3>
<ul class="tasks">
<li>האות שממוקמת בנקודה ${ltr('(3,2)')} היא ${blank(2, 'letter')}.</li>
<li>שיעור ה־${ltr('x')} של הנקודה של האות <strong>ו</strong> הוא ${blank(3, 'number')}.</li>
<li>הנקודה של האות <strong>ד</strong> היא הנקודה ה${blank(5, 'property')} ביותר במערכת.</li>
<li>האות שממוקמת בנקודה ${ltr('(4,3)')} היא ${blank(2, 'letter')}.</li>
<li>הנקודה של האות <strong>ק</strong> רחוקה ${blank(3, 'number')} יחידות מציר ה־${ltr('y')}.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. מילת הצופן.</h3>
<ul class="tasks compact">
<li>כתבו את חמש האותיות לפי סדר השאלות, מימין לשמאל: ${blank(10, 'concept')}.</li>
<li>סמנו את הנקודה של האות הראשונה במילה, וכתבו את שיעוריה: ${pair()}.</li>
</ul>
</section>
<div class="two-col">
<section class="q-card">
<h3>ד. משווים בין האותיות.</h3>
<ul class="tasks">
<li>האות שממוקמת הכי גבוה במערכת היא ${blank(2, 'letter')}.</li>
<li>המרחק האופקי בין הנקודה של <strong>נ</strong> לנקודה של <strong>ה</strong> הוא ${blank(3, 'number')} יחידה.</li>
<li>הנקודה של האות <strong>ד</strong> היא ה${blank(5, 'property')} ביותר במערכת.</li>
</ul>
</section>
<section class="q-card">
<h3>ה. מוסיפים אות משלכם.</h3>
<ul class="tasks">
<li>סמנו נקודה חדשה ששיעור ה־${ltr('y')} שלה הוא 6, וכתבו את שיעוריה: ${pair()}.</li>
<li>כתבו לצד הנקודה את האות <strong>ם</strong>. איזו מילה נוצרת עכשיו מכל האותיות? ${blank(8, 'concept')}.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ו. בודקים את המילה.</h3>
<ul class="tasks compact">
<li>האות האמצעית במילה שפענחתם היא ${blank(2, 'letter')}.</li>
<li>ההפרש בין שיעור ה־${ltr('x')} של <strong>ק</strong> לשיעור ה־${ltr('x')} של <strong>ה</strong> הוא ${blank(3, 'number')} יחידות.</li>
<li>הנקודה של <strong>ק</strong> ממוקמת ${blank(6, 'direction')} לנקודה של <strong>ה</strong>.</li>
</ul>
</section>
`,
});
