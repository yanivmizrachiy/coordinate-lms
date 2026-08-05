import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, grid, exerciseGiven } from '../authoring';

const WALLS = [
  { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
  { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
];

const wallPoints = WALLS.map((w) => ({
  x: w.x, y: w.y, label: '■', color: '#64748b', anchor: 'middle', dx: 0, dy: 4,
}));

export const COORDINATE_MAZE_PRINT: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'מבוך הקואורדינטות',
  subtitle: 'מסמנים מסלול בעיפרון — כל צעד משנה שיעור אחד',
  content: `
<div class="rule-box">
במבוך זזים צעד אחד בכל פעם, וכל צעד משנה שיעור אחד בלבד: צעד ימינה או שמאלה
משנה את שיעור ה־${ltr('x')}, וצעד למעלה או ${blank(5, 'direction')} משנה את
שיעור ה־${blank(2, 'letter')}. הנקודות שמסומן עליהן הסימן ■ הן קירות, ואסור
לעמוד עליהן.
</div>
<section class="q-card">
<h3>א. סמנו את המסלול מנקודת ההתחלה אל היעד.</h3>
<p>המסלול פותח בנקודת ההתחלה ${ltr('(0,0)')}, והיעד ממוקם בנקודה ${ltr('(6,4)')}. סמנו בעיפרון את המסלול לאורך קווי הרשת, צעד אחרי צעד, בלי לעמוד על קיר ובלי לצאת מהרביע הראשון. נקודת פנייה היא נקודה שבה שיניתם כיוון.</p>
${grid({
  size: 'lg',
  label: 'מבוך ברביע הראשון: נקודת התחלה (0,0), יעד (6,4), וקירות בנקודות (2,0), (2,1), (2,2), (2,3), (5,3), (5,4), (5,5), (5,6)',
  xmax: 8,
  ymax: 6,
  originAngle: false,
  points: [
    ...wallPoints,
    { x: 0, y: 0, label: 'התחלה', dx: 14, dy: -14 },
    { x: 6, y: 4, label: 'יעד' },
  ],
})}
<ul class="tasks compact">
<li>נקודות הפנייה שסימנתם, לפי סדר המסלול: ${pair()} ${pair()} ${pair()} ${pair()}.</li>
<li>במסלול שסימנתם יש ${blank(3, 'number')} צעדים.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. השלימו על המסלול שסימנתם.</h3>
<ul class="tasks">
<li>המסלול מתחיל בנקודה ${pair()}, ונגמר בנקודה ${pair()}.</li>
<li>בכל צעד ימינה או שמאלה שיעור ה־${ltr('x')} משתנה, ושיעור ה־${ltr('y')} ${blank(7, 'relation')}.</li>
<li>בכל צעד למעלה או ${blank(5, 'direction')} שיעור ה־${ltr('y')} משתנה, ושיעור ה־${ltr('x')} נשאר זהה.</li>
<li>הצעד הראשון שסימנתם הוא צעד ${blank(5, 'direction')}, ואחריו הגעתם אל הנקודה ${pair()}.</li>
<li>את עמודת הקירות שבה שיעור ה־${ltr('x')} הוא 2 אפשר לעבור רק בשיעור ${ltr('y')} שגדול מ־${blank(3, 'number')}.</li>
<li>את עמודת הקירות שבה שיעור ה־${ltr('x')} הוא ${blank(3, 'number')} אפשר לעבור רק בשיעור ${ltr('y')} שקטן מ־3.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. מנקודת ההתחלה אל היעד — מה ההפרש בכל כיוון?</h3>
<p>ההפרש בין שיעור ה־${ltr('x')} של היעד ובין שיעור ה־${ltr('x')} של נקודת ההתחלה:</p>
${exerciseGiven('', '6 − 0', 'יחידות')}
<p>וההפרש בין שיעורי ה־${ltr('y')} של אותן שתי נקודות:</p>
${exerciseGiven('', '4 − 0', 'יחידות')}
<ul class="tasks compact">
<li>מספר הצעדים במסלול שסימנתם ${blank(5, 'relation')} מסכום שני ההפרשים, כי צריך לעקוף את הקירות.</li>
</ul>
</section>
`,
});
