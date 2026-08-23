import '../styles/hint-coach.css';

type HintLevel = 1 | 2 | 3;
type HintSet = readonly [string, string, string];

const GENERIC: HintSet = [
  'חזרו לשרטוט או למשפט וחפשו את המידע שקובע את התשובה, בלי לנחש.',
  'פרקו את השאלה: מה נתון, מה צריך למצוא, ואיזה כלל יכול לחבר ביניהם?',
  'נסחו לעצמכם את הכלל במילים ובדקו אם התשובה החדשה מתאימה לכל הנתונים.',
];

/*
 * Hints teach a way of thinking. They deliberately avoid stating the expected
 * word, letter or number. Even the third hint remains a worked direction, not
 * an answer reveal.
 */
const HINTS: Record<string, HintSet> = {
  'axis-x': [
    'בדקו קודם את כיוון הציר המסומן: האם הוא נמשך מצד לצד או מלמטה למעלה?',
    'השוו בין שתי אותיות הצירים שלמדתם לבין שני הכיוונים האפשריים, ורק אז בחרו.',
    'כתבו בצד את x ואת y, הזכירו לעצמכם איזה כיוון שייך לכל אחת, ואז התאימו לשרטוט.',
  ],
  'axis-y': [
    'בדקו קודם את כיוון הציר המסומן: האם הוא נמשך מצד לצד או מלמטה למעלה?',
    'השוו בין שתי אותיות הצירים שלמדתם לבין שני הכיוונים האפשריים, ורק אז בחרו.',
    'כתבו בצד את x ואת y, הזכירו לעצמכם איזה כיוון שייך לכל אחת, ואז התאימו לשרטוט.',
  ],
  'x-tick': [
    'בדקו את המספרים הסמוכים ואת המרווחים ביניהם לפני שאתם משלימים את המספר החסר.',
    'ספרו שנתה־שנתה מן המספר הידוע הקרוב ביותר לפי קנה המידה של הציר.',
    'סמנו את ההפרש בין שתי שנתות סמוכות, ואז חזרו על אותו הפרש עד למקום החסר.',
  ],
  'y-tick': [
    'בדקו את המספרים שמעל ומתחת למקום החסר ואת המרווחים ביניהם.',
    'ספרו שנתה־שנתה מן המספר הידוע הקרוב ביותר לפי קנה המידה של הציר.',
    'סמנו את ההפרש בין שתי שנתות סמוכות, ואז חזרו על אותו הפרש עד למקום החסר.',
  ],
  origin: [
    'חפשו את המקום שבו שני הצירים נפגשים ושאלו איזה מושג שלמדתם מתאר אותו.',
    'המושג המבוקש הוא השם בן שתי המילים של נקודת ההתחלה של מערכת הצירים.',
    'חזרו למושגים של תחילת מערכת צירים; אל תסתכלו על המספרים אלא על נקודת החיתוך עצמה.',
  ],
  'origin-first': [
    'חשבו על השם בן שתי המילים של נקודת המפגש בין הצירים.',
    'אמרו לעצמכם את המושג המלא של נקודת ההתחלה במערכת, ואז כתבו רק את המילה החסרה.',
    'היעזרו במשמעות: מחפשים את המילה שמציינת התחלה, לא כיוון ולא מספר.',
  ],
  'origin-second': [
    'חשבו על השם בן שתי המילים של נקודת המפגש בין הצירים.',
    'אמרו לעצמכם את המושג המלא של נקודת ההתחלה במערכת, ואז כתבו רק את המילה החסרה.',
    'היעזרו במשמעות: המילה החסרה מתייחסת לשני הקווים שמרכיבים את המערכת.',
  ],
  letter: [
    'בדקו אם מדובר בציר שנמשך מצד לצד או בציר שנמשך מלמטה למעלה.',
    'יש שתי אותיות אפשריות בלבד. התאימו כל אות לכיוון שלמדתם ואז חזרו לשרטוט.',
    'אל תנחשו לפי מיקום האות; קבעו קודם את כיוון הציר ורק אחר כך בחרו בין x ל־y.',
  ],
  property: [
    'הסתכלו על הציר ושאלו אם הוא נמשך מצד לצד או מלמטה למעלה.',
    'בחרו את המונח שמתאר את הכיוון הגאומטרי של הקו, לא את אות הציר.',
    'השוו לקו של שורת מחברת ולקו שעולה לגובה; איזה מהם דומה לציר שבשאלה?',
  ],
  direction: [
    'סמנו מאיפה מתחילים ולאן צריכים להגיע, ואז עקבו עם האצבע על הציר.',
    'בדקו אם במהלך התנועה הערכים גדלים או קטנים; זה יעזור לקבוע את הכיוון.',
    'קראו שני מספרים סמוכים בכיוון התנועה והשוו ביניהם לפני שאתם בוחרים את מילת הכיוון.',
  ],
  concept: [
    'חפשו איזה סוג דבר מסומן: ציר, נקודת מפגש, כיוון, מספר או נקודה.',
    'אמרו לעצמכם מה התפקיד של החלק המסומן במערכת ורק אחר כך בחרו את המושג.',
    'נסו לתאר את החלק המסומן במשפט שלם בלי להשתמש עדיין בשם המתמטי; השם אמור לצאת מן התיאור.',
  ],
  number: [
    'אל תנחשו את המספר. בדקו קנה מידה ומספרים סמוכים.',
    'עברו שנתה־שנתה מן המספר הידוע הקרוב ביותר וספרו את המרווחים.',
    'חשבו: ערך התחלתי + מספר המרווחים כפול גודל כל מרווח. אחר כך בדקו מול השרטוט.',
  ],
  relation: [
    'השוו שני ערכים עוקבים בכיוון המתואר וראו מה השתנה.',
    'אל תסתמכו על כיוון החץ בלבד; קראו מספר אחד ואז את הבא אחריו.',
    'כתבו שתי דוגמאות מספריות מן הציר והשוו ביניהן. המילה המתאימה צריכה לתאר את שתיהן.',
  ],
  'pair-x': [
    'בזוג סדור יש מקום ראשון ומקום שני. בדקו איזה ציר נקרא במקום הראשון.',
    'הקרינו את הנקודה אל שני הצירים בנפרד, ורשמו קודם את הערך ששייך למקום הראשון בזוג.',
    'היעזרו בתבנית (x, y) רק כדי לקבוע סדר; את המספר עצמו קראו מן השרטוט.',
  ],
  'pair-y': [
    'בזוג סדור יש מקום ראשון ומקום שני. בדקו איזה ציר נקרא במקום השני.',
    'הקרינו את הנקודה אל שני הצירים בנפרד, ורשמו במקום השני את הערך ששייך אליו.',
    'היעזרו בתבנית (x, y) רק כדי לקבוע סדר; את המספר עצמו קראו מן השרטוט.',
  ],
};

function kindOf(target: HTMLElement): string {
  const grid = target.dataset['gridAnswer'];
  if (grid) return grid;
  if (target.classList.contains('pair-blank')) {
    const pair = target.closest('.pair');
    if (pair) {
      const parts = Array.from(pair.querySelectorAll('.pair-blank'));
      return parts.indexOf(target) === 0 ? 'pair-x' : 'pair-y';
    }
  }
  return target.dataset['missing'] || 'generic';
}

function unresolved(anchor: HTMLElement): HTMLElement[] {
  return Array.from(anchor.querySelectorAll<HTMLElement>('[data-lms-qid]')).filter((target) => {
    const state = target.dataset['lmsState'];
    return state === 'wrong' || state === 'missing' || state === 'locked';
  });
}

function levelOf(targets: HTMLElement[]): HintLevel {
  const attempts = Math.max(1, ...targets.map((target) => Number(target.dataset['lmsAttempts'] || 0)));
  return attempts >= 3 ? 3 : attempts === 2 ? 2 : 1;
}

function hintText(anchor: HTMLElement, level: HintLevel): string {
  const targets = unresolved(anchor);
  const sources = targets.length ? targets : Array.from(anchor.querySelectorAll<HTMLElement>('[data-lms-qid]'));
  const messages: string[] = [];
  for (const target of sources) {
    const set = HINTS[kindOf(target)] ?? GENERIC;
    const message = set[level - 1] ?? set[0] ?? GENERIC[0];
    if (!message) continue;
    if (!messages.includes(message)) messages.push(message);
    if (messages.length === 2) break;
  }
  return messages.join(' ');
}

function attach(control: HTMLElement): () => void {
  const status = control.querySelector<HTMLElement>('.lms-qstatus');
  if (!status) return () => {};

  const hint = document.createElement('div');
  hint.className = 'lms-qhint';
  hint.hidden = true;
  hint.setAttribute('role', 'status');
  hint.setAttribute('aria-live', 'polite');
  control.append(hint);

  const refresh = (): void => {
    const state = status.dataset['qstate'] || 'idle';
    if (state !== 'wrong' && state !== 'partial' && state !== 'locked') {
      hint.hidden = true;
      hint.textContent = '';
      hint.removeAttribute('data-hint-level');
      return;
    }

    const anchor = control.parentElement ?? control;
    const level = levelOf(unresolved(anchor));
    const label = level === 1 ? 'רמז' : level === 2 ? 'כיוון נוסף' : 'הכוונה נוספת';
    hint.dataset['hintLevel'] = String(level);
    hint.textContent = `${label}: ${hintText(anchor, level)}`;
    hint.hidden = false;
  };

  const observer = new MutationObserver(refresh);
  observer.observe(status, { attributes: true, attributeFilter: ['data-qstate'], childList: true, subtree: true });
  refresh();
  return () => { observer.disconnect(); hint.remove(); };
}

export function installHintCoach(root: ParentNode): () => void {
  const cleanups = Array.from(root.querySelectorAll<HTMLElement>('.lms-qcheck')).map(attach);
  return () => { for (const cleanup of cleanups) cleanup(); };
}
