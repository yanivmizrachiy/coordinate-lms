import '../styles/hint-coach.css';

type HintLevel = 1 | 2 | 3;
type HintSet = readonly [string, string, string];

const GENERIC: HintSet = [
  'חזרו לשרטוט או למשפט וחפשו את המידע שקובע את התשובה.',
  'פרקו את השאלה: מה נתון, מה צריך למצוא, ואיזה כלל מחבר ביניהם?',
  'הסבירו לעצמכם במילים את הכלל המתמטי לפני תשובה חדשה.',
];

const HINTS: Record<string, HintSet> = {
  'axis-x': ['בדקו את כיוון הציר: הציר האופקי הוא ציר x.', 'חפשו את הציר שנע ימינה ושמאלה. זהו ציר x.', 'כלל: x הוא הציר האופקי ו-y הוא הציר האנכי.'],
  'axis-y': ['בדקו את כיוון הציר: הציר האנכי הוא ציר y.', 'חפשו את הציר שעולים ויורדים עליו. זהו ציר y.', 'כלל: y הוא הציר האנכי ו-x הוא הציר האופקי.'],
  'x-tick': ['על ציר x המספרים גדלים כשזזים ימינה. בדקו את המספרים הסמוכים.', 'ספרו את המרווחים על הציר האופקי לפי קנה המידה.', 'כלל: קוראים את ציר x משמאל לימין ובודקים את המרווח בין שנתות.'],
  'y-tick': ['על ציר y המספרים גדלים כשעולים. בדקו את המספרים הסמוכים.', 'ספרו את המרווחים על הציר האנכי לפי קנה המידה.', 'כלל: קוראים את ציר y מלמטה למעלה ובודקים את המרווח בין שנתות.'],
  origin: ['חפשו את נקודת המפגש של שני הצירים.', 'נקודת המפגש של x ו-y היא ראשית הצירים.', 'כלל: ראשית הצירים היא נקודת החיתוך של שני הצירים.'],
  'origin-first': ['חשבו על השם של הנקודה שבה שני הצירים נפגשים.', 'המושג הוא ראשית הצירים; חסרה כאן המילה הראשונה.', 'כלל: נקודת המפגש נקראת ראשית הצירים.'],
  'origin-second': ['חשבו על השם המלא של המקום שבו שני הצירים נפגשים.', 'המושג הוא ראשית הצירים; חסרה כאן המילה השנייה.', 'כלל: נקודת המפגש נקראת ראשית הצירים.'],
  letter: ['ימינה–שמאלה שייך ל-x; למעלה–למטה שייך ל-y.', 'התאימו בין כיוון הציר לאות שלו: x אופקי, y אנכי.', 'כלל יסוד: x אופקי ו-y אנכי.'],
  property: ['אופקי פירושו ימינה–שמאלה; אנכי פירושו למעלה–למטה.', 'השוו את הציר לקו אופקי ולקו אנכי לפני ההשלמה.', 'כלל: ציר x אופקי וציר y אנכי.'],
  direction: ['שאלו: לאיזה צד צריך לזוז כדי להגיע מהמקום הראשון לשני?', 'על x זזים ימינה או שמאלה; על y עולים או יורדים.', 'כלל: בכיוון החיובי המספרים גדלים — ימינה על x ולמעלה על y.'],
  concept: ['חפשו איזה מושג מתאר את החלק המסומן במערכת הצירים.', 'אם מדובר במפגש הצירים, חשבו על המושג ראשית הצירים.', 'כלל: ראשית הצירים היא נקודת החיתוך של שני הצירים.'],
  number: ['בדקו את קנה המידה ואת המספרים הסמוכים על הציר.', 'עברו שנתה-שנתה מהמספר הידוע הקרוב ביותר.', 'כלל: ערך על ציר נקבע לפי קנה המידה ומספר המרווחים.'],
  relation: ['בדקו אם הערכים גדלים או קטנים בכיוון המתואר.', 'בכיוון החיובי של הציר הערכים גדלים; בכיוון ההפוך הם קטנים.', 'כלל: ימינה על x ולמעלה על y הם הכיוונים שבהם המספרים גדלים.'],
  'pair-x': ['בזוג סדור כותבים קודם את שיעור x — המיקום האופקי.', 'כדי למצוא x, בדקו כמה הנקודה ימינה מראשית הצירים.', 'כלל: זוג סדור נכתב (x, y): קודם אופקי, אחר כך אנכי.'],
  'pair-y': ['בזוג סדור כותבים במקום השני את שיעור y — המיקום האנכי.', 'כדי למצוא y, בדקו כמה הנקודה מעל ראשית הצירים.', 'כלל: זוג סדור נכתב (x, y): קודם אופקי, אחר כך אנכי.'],
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
    const label = level === 1 ? 'רמז' : level === 2 ? 'כיוון נוסף' : 'הסבר';
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
