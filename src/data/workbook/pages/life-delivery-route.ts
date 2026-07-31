import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, wordBank, exerciseGiven, exercise } from '../authoring';

/* Real life, grade 7: a courier cannot fly. Every leg runs along a street, so
   every leg is parallel to an axis and its length is a subtraction — and the
   whole route is the sum of those differences. The map app that says „1.4 ק״מ”
   is doing exactly this. */
export const LIFE_DELIVERY_ROUTE: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מסלול השליח — כמה באמת נסע?',
  subtitle: 'רחובות מקבילים לצירים, ואורך כל קטע הוא הפרש',
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">השליח נוסע רק ברחובות, ולכן כל קטע במסלול שלו מקביל לציר ${ltr('x')} או לציר ${blank(3, 'letter')}.</div>
<div class="completion-sentence">אורך כל קטע הוא ה${blank(6, 'concept')} בין השיעורים, ואורך המסלול כולו הוא הסכום של כל הקטעים.</div>
</div>
<section class="q-card">
<h3>א. עוקבים אחרי המסלול.</h3>
${grid({
  size: 'md',
  label: 'מסלול השליח: מהמסעדה אל שתי כתובות',
  points: [
    { x: 1, y: 1, label: 'מסעדה' },
    { x: 6, y: 1, label: 'כתובת א' },
    { x: 6, y: 5, label: 'כתובת ב' },
  ],
  segments: [
    { from: [1, 1], to: [6, 1], type: 'shape' },
    { from: [6, 1], to: [6, 5], type: 'shape' },
  ],
})}
${wordBank(['x', 'y', '4', '5', '9', 'ימינה', 'למעלה', 'הפרש'])}
<ul class="tasks compact">
<li>הקטע ${ltr('AB')} מקביל לציר ${blank(3, 'letter')}, והשליח נסע בו ${blank(6, 'direction')}:</li>
</ul>
${exerciseGiven('AB', '6 − 1')}
<ul class="tasks compact">
<li>בקטע ${ltr('BC')} ה־${ltr('y')} הגבוה הוא 5 וה־${ltr('y')} הנמוך הוא 1:</li>
</ul>
${exerciseGiven('BC', '5 − 1')}
<ul class="tasks compact">
<li>לכן המסלול כולו באורך ${blank(3, 'number')} יח', כי מחברים את שני ההפרשים.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. למה אי אפשר לנסוע בקו ישר?</h3>
<ul class="tasks compact">
<li>הקטע מהמסעדה היישר אל כתובת ב אינו מקביל לאף ציר, כי משתנים בו ${blank(3, 'number')} השיעורים.</li>
<li>בין הבניינים אין רחוב, ולכן השליח חייב לנסוע בשני קטעים: אחד מקביל לציר ${ltr('x')} ואחד מקביל לציר ${blank(3, 'letter')}.</li>
<li>אפליקציית הניווט מחשבת בדיוק כך: היא מחברת את ההפרשים ${blank(5, 'relation')} למדוד בקו אווירי.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. תכננו משלוח משלכם, ואז השלימו את החסר.</h3>
<ul class="tasks compact">
<li>סמנו על הסרטוט כתובת חדשה שממוקמת באותו רחוב של המסעדה, כלומר באותו שיעור ${ltr('y')}.</li>
<li>הכתובת שסימנתם היא ${pair()}.</li>
<li>כתבו את תרגיל החיסור מהמסעדה אל הכתובת שסימנתם, ואת אורך המסלול:</li>
</ul>
${exercise('AD')}
</section>
`,
});
