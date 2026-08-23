import '../styles/hint-coach.css';

const ANSWER_TARGET_SELECTOR = '[data-lms-qid]';

type HintLevel = 1 | 2 | 3;

interface HintSet {
  first: string;
  second: string;
  third: string;
}

const HINTS: Record<string, HintSet> = {
  'axis-x': {
    first: 'בדקו את כיוון הציר: הציר האופקי הוא ציר x.',
    second: 'דרך עבודה: חפשו את הציר שנע ימינה ושמאלה. זהו ציר x.',
    third: 'כלל שכדאי לזכור: x הוא הציר האופקי, ו-y הוא הציר האנכי.',
  },
  'axis-y': {
    first: 'בדקו את כיוון הציר: הציר האנכי הוא ציר y.',
    second: 'דרך עבודה: חפשו את הציר שעולים ויורדים עליו. זהו ציר y.',
    third: 'כלל שכדאי לזכור: y הוא הציר האנכי, ו-x הוא הציר האופקי.',
  },
  'x-tick': {
    first: 'על ציר x המספרים גדלים כשזזים ימינה. בדקו את המספרים שלפני ואחרי המקום החסר.',
    second: 'ספרו את המרווחים על הציר האופקי. כל שנתה מייצגת את קנה המידה שמופיע בשרטוט.',
    third: 'כלל: קוראים את ציר x משמאל לימין ובודקים את קנה המידה בין שנתות סמוכות.',
  },
  'y-tick': {
    first: 'על ציר y המספרים גדלים כשעולים. בדקו את המספרים שמתחת ומעל המקום החסר.',
    second: 'ספרו את המרווחים על הציר האנכי. כל שנתה מייצגת את קנה המידה שמופיע בשרטוט.',
    third: 'כלל: קוראים את ציר y מלמטה למעלה ובודקים את קנה המידה בין שנתות סמוכות.',
  },
  'origin-first': {
    first: 'חשבו על השם של הנקודה שבה שני הצירים נפגשים.',
    second: 'המפגש של ציר x וציר y נקרא ראשית הצירים. חסרה כאן המילה הראשונה בשם.',
    third: 'כלל: נקודת המפגש של שני הצירים נקראת ראשית הצירים.',
  },
  'origin-second': {
    first: 'חשבו על השם המלא של המקום שבו שני הצירים נפגשים.',
    second: 'המושג הוא ראשית הצירים. חסרה כאן המילה השנייה בשם.',
    third: 'כלל: נקודת המפגש של שני הצירים נקראת ראשית הצירים.',
  },
  origin: {
    first: 'חפשו את נקודת המפגש של שני הצירים.',
    second: 'נקודת המפגש היא ראשית הצירים; בדרך כלל מסמנים אותה באות O.',
    third: 'כלל: ראשית הצירים היא נקודת החיתוך של ציר x וציר y.',
  },
  letter: {
    first: 'בדקו על איזה ציר מדובר: תנועה ימינה–שמאלה שייכת ל-x, ותנועה למעלה–למטה שייכת ל-y.',
    second: 'התאימו בין כיוון הציר לאות שלו: x אופקי, y אנכי.',
    third: 'כלל יסוד: x הוא הציר האופקי ו-y הוא הציר האנכי.',
  },
  property: {
    first: 'היעזרו בכיוונים: אופקי פירושו ימינה–שמאלה; אנכי פירושו למעלה–למטה.',
    second: 'השוו את הציר לקו אופקי ולקו אנכי לפני שאתם משלימים את התכונה.',
    third: 'כלל: ציר x אופקי וציר y אנכי.',
  },
  direction: {
    first: 'השוו את שני המקומות על הציר ושאלו: לאיזה צד צריך לזוז כדי להגיע מהמספר הראשון לשני?',
    second: 'על ציר x זזים ימינה או שמאלה; על ציר y עולים או יורדים. סמנו לעצמכם מאיפה מתחילים ולאן מגיעים.',
    third: 'כלל: בכיוון החיובי המספרים גדלים — ימינה על x ולמעלה על y.',
  },
  concept: {
    first: 'חפשו איזה מושג מתאר את החלק המסומן במערכת הצירים.',
    second: 'אם מדובר במפגש של הצירים, המושג המרכזי הוא ראשית הצירים.',
    third: 'כלל: ראשית הצירים היא נקודת החיתוך של שני הצירים.',
  },
  number: {
    first: 'אל תנחשו את המספר. בדקו את קנה המידה ואת המספרים הסמוכים על הציר.',
    second: 'עברו שנתה-שנתה מהמספר הידוע הקרוב ביותר עד למקום החסר.',
    third: 'כלל: ערך על ציר נקבע לפי קנה המידה ומספר המרווחים מנקודה ידועה.',
  },
  relation: {
    first: 'בדקו מה קורה לערכים כשמתקדמים בכיוון המתואר: הם גדלים או קטנים?',
    second: 'בכיוון החיובי של הציר הערכים גדלים; בכיוון ההפוך הם קטנים.',
    third: 'כלל: ימינה על x ולמעלה על y הם הכיוונים שבהם המספרים גדלים.',
  },
  'pair-x': {
    first: 'בזוג סדור כותבים קודם את שיעור x — המיקום האופקי.',
    second: 'כדי למצוא x, בדקו כמה הנקודה ימינה מראשית הצירים.',
    third: 'כלל: זוג סדור נכתב (x, y): קודם אופקי, אחר כך אנכי.',
  },
  'pair-y': {
    first: 'בזוג סדור כותבים במקום השני את שיעור y — המיקום האנכי.',
    second: 'כדי למצוא y, בדקו כמה הנקודה נמצאת מעל ראשית הצירים.',
    third: 'כלל: זוג סדור נכתב (x, y): קודם אופקי, אחר כך אנכי.',
  },
  generic: {
    first: 'חזרו לשרטוט או למשפט וחפשו את המידע שקובע את התשובה, לא רק את המקום הריק.',
    second: 'פרקו את השאלה: מה נתון, מה צריך למצוא, ואיזה כלל של מערכת הצירים מחבר ביניהם?',
    third: 'נסו להסביר לעצמכם במילים את הכלל המתמטי לפני שאתם כותבים תשובה חדשה.',
  },
};

function hintKind(target: HTMLElement): string {
  const gridKind = target.dataset['gridAnswer'];
  if (gridKind && HINTS[gridKind]) return gridKind;

  if (target.classList.contains('pair-blank')) {
    const pair = target.closest('.pair');
    if (pair) {
      const blanks = Array.from(pair.querySelectorAll<HTMLElement>('.pair-blank'));
      return blanks.indexOf(target) === 0 ? 'pair-x' : 'pair-y';
    }
  }

  const missing = target.dataset['missing'];
  return missing && HINTS[missing] ? missing : 'generic';
}

function levelFor(targets: HTMLElement[]): HintLevel {
  const attempts = Math.max(
    1,
    ...targets.map((target) => Number(target.dataset['lmsAttempts'] || '0')),
  );
  if (attempts >= 3) return 3;
  if (attempts === 2) return 2;
  return 1;
}

function textAtLevel(set: HintSet, level: HintLevel): string {
  if (level === 3) return set.third;
  if (level === 2) return set.second;
  return set.first;
}

function hintFor(anchor: HTMLElement, level: HintLevel): string {
  const unresolved = Array.from(
    anchor.querySelectorAll<HTMLElement>(ANSWER_TARGET_SELECTOR),
  ).filter((target) => {
    const state = target.dataset['lmsState'];
    return state === 'wrong' || state === 'missing' || state === 'locked';
  });

  const sources = unresolved.length > 0
    ? unresolved
    : Array.from(anchor.querySelectorAll<HTMLElement>(ANSWER_TARGET_SELECTOR));

  const hints: string[] = [];
  for (const target of sources) {
    const hint = textAtLevel(HINTS[hintKind(target)] ?? HINTS.generic, level);
    if (!hints.includes(hint)) hints.push(hint);
    if (hints.length >= 2) break;
  }

  return hints.join(' ');
}

function attachHint(control: HTMLElement): () => void {
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
    const shouldTeach = state === 'wrong' || state === 'partial' || state === 'locked';

    if (!shouldTeach) {
      hint.hidden = true;
      hint.textContent = '';
      hint.removeAttribute('data-hint-level');
      return;
    }

    const anchor = control.parentElement ?? control;
    const relevant = Array.from(
      anchor.querySelectorAll<HTMLElement>(ANSWER_TARGET_SELECTOR),
    ).filter((target) => {
      const targetState = target.dataset['lmsState'];
      return targetState === 'wrong' || targetState === 'missing' || targetState === 'locked';
    });
    const level = levelFor(relevant);
    const label = level === 1 ? 'רמז' : level === 2 ? 'כיוון נוסף' : 'הסבר';

    hint.dataset['hintLevel'] = String(level);
    hint.textContent = label + ': ' + hintFor(anchor, level);
    hint.hidden = false;
  };

  const observer = new MutationObserver(refresh);
  observer.observe(status, {
    attributes: true,
    attributeFilter: ['data-qstate'],
    childList: true,
    characterData: true,
    subtree: true,
  });
  refresh();

  return () => {
    observer.disconnect();
    hint.remove();
  };
}

/**
 * Adds pedagogical, curriculum-aligned correction guidance to each question.
 * The scoring engine remains authoritative: a wrong submission still counts as
 * an attempt and therefore can reduce the final score. The coach only explains
 * how to think about the correction; it does not reset attempts or overwrite
 * answers.
 */
export function installHintCoach(root: ParentNode): () => void {
  const cleanups = Array.from(
    root.querySelectorAll<HTMLElement>('.lms-qcheck'),
  ).map(attachHint);

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
