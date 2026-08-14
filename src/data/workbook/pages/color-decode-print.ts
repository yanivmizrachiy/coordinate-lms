import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, colorGrid, wordBlank } from '../authoring';
import { decodeTargets, decodeXMax, decodeYMax } from '../../colorDecode';

/* Canonical printable-page content mirrored into the LMS. The printable source
   remains unchanged; computerized interaction is added only by the LMS layer. */
const listText = decodeTargets.map((p) => `(${p.x},${p.y})`).join(' · ');

export const COLOR_DECODE_PRINT: WorkbookPageContent = sheet({
  sectionClass: 'sheet practice',
  title: 'פענוח צבעוני',
  subtitle: 'צובעים תאים לפי זוגות סדורים, ומגלים סמל נסתר',
  content: `
<div class="rule-box">
הרשת שלפניכם היא רביע ראשון: מראשית הצירים סופרים את ערך ${ltr('x')} ימינה ואת
שיעור ${ltr('y')} למעלה. כל זוג סדור <span class="math-ltr" dir="ltr">(x,y)</span>
מציין תא אחד. צבעו בעיפרון את כל התאים שברשימה — ומהם יתגלה סמל.
</div>
<section class="q-card">
<h3>א. רשימת התאים.</h3>
<p>${ltr(listText)}</p>
${colorGrid(decodeXMax, decodeYMax)}
<p>מה קיבלתם? ${wordBlank('medium', 'concept', 'מקום להשלמת שם הסמל שהתגלה')}</p>
</section>
<section class="q-card">
<h3>ב. אחרי שהסמל התגלה — השלימו עליו.</h3>
<ul class="tasks compact">
<li>הסמל הוא חץ שמצביע כלפי <b>מעלה</b> — אל תוך הרביע, לכיוון שבו שיעור ה־${ltr('y')} ${blank(4, 'relation')}.</li>
<li>התא הנמוך ביותר שצבעתם — תחתית הגזע — הוא ${pair()}.</li>
<li>כל תאי הגזע ממוקמים על אותו קו אנכי, כי לכולם אותו ערך ${ltr('x')}, והוא ${blank(3, 'number')}.</li>
<li>לשני קצות בסיס הראש, ${ltr('(1,3)')} ו־${ltr('(5,3)')}, יש שיעור ${ltr('y')} ${blank(4, 'relation')}, ולכן הם על אותו קו אופקי.</li>
<li>חוד החץ הוא התא הגבוה ביותר, והוא ${pair()}.</li>
<li>ההפרש בין שיעור ה־${ltr('y')} של החוד ${ltr('(3,5)')} ובין תחתית הגזע ${ltr('(3,0)')} הוא ${blank(3, 'number')} יחידות.</li>
</ul>
</section>
`,
});
