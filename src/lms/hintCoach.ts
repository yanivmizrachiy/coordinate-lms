import '../styles/hint-coach.css';

type HintLevel = 1 | 2 | 3 | 4;
type HintSet = readonly [string, string, string];

const GENERIC: HintSet = [
  'חזרו רק לחלק בשאלה שבו טעיתם. חפשו בציור או במשפט את המספר או המילה שקשורים אליו.',
  'בדקו מה בדיוק צריך לכתוב במקום החסר, ואז הסתכלו שוב רק על החלק המתאים בציור או במשפט.',
  'עברו צעד־צעד: מצאו את הנתון המתאים בשאלה, קראו אותו שוב, ורק אז כתבו תשובה חדשה.',
];

/* The final stage explains the same idea more directly, without printing the
   missing answer itself. The language intentionally stays simpler than the
   worksheet language because this is shown only after repeated mistakes. */
const FINAL_GUIDANCE: Record<string, string> = {
  generic:
    'הסתכלו שוב רק על המקום שקשור לתשובה. מצאו שם את המספר, המילה או הסימון המתאימים, ובדקו שהם עונים בדיוק למה שנשאל.',
  'axis-x':
    'הסתכלו על הציר המסומן. אם הוא הולך מצד לצד, הוא ציר x; אם הוא עולה מלמטה למעלה, הוא ציר y. עכשיו בחרו לפי הציור.',
  'axis-y':
    'הסתכלו על הציר המסומן. אם הוא הולך מצד לצד, הוא ציר x; אם הוא עולה מלמטה למעלה, הוא ציר y. עכשיו בחרו לפי הציור.',
  letter:
    'הסתכלו על כיוון הציר: מצד לצד או מלמטה למעלה. לפי הכיוון הזה בחרו את האות של הציר.',
  property:
    'הסתכלו על הקו עצמו: האם הוא הולך מצד לצד או מלמטה למעלה? כתבו את המילה שמתארת את הכיוון הזה.',
  'x-tick':
    'מצאו מספר שכבר כתוב על הציר ליד המקום החסר. בדקו בכמה המספר משתנה ממקום מסומן אחד לבא אחריו, והמשיכו באותו שינוי.',
  'y-tick':
    'מצאו מספר שכבר כתוב על הציר ליד המקום החסר. בדקו בכמה המספר משתנה ממקום מסומן אחד לבא אחריו, והמשיכו באותו שינוי.',
  number:
    'מצאו את המספר הכתוב הקרוב ביותר למקום החסר. עברו מקום מסומן אחד בכל פעם ובדקו בכמה המספר משתנה בכל מעבר.',
  origin:
    'חפשו את המקום שבו ציר x וציר y נפגשים. עכשיו היזכרו בשם של המקום הזה במערכת הצירים.',
  'origin-first':
    'אמרו לעצמכם את השם המלא של המקום שבו שני הצירים נפגשים. כתבו רק את המילה הראשונה בשם הזה.',
  'origin-second':
    'אמרו לעצמכם את השם המלא של המקום שבו שני הצירים נפגשים. כתבו רק את המילה השנייה בשם הזה.',
  direction:
    'התחילו מהמספר הראשון בכיוון שמבקשים. הסתכלו על המספר הבא: הוא גדול יותר או קטן יותר? זה מראה לאיזה כיוון מתקדמים.',
  relation:
    'בחרו שני מספרים שמופיעים אחד אחרי השני בכיוון שמבקשים. בדקו אם המספר השני גדול יותר או קטן יותר מהראשון.',
  concept:
    'הסתכלו רק על החלק המסומן ושאלו: מה רואים כאן — ציר, מספר, נקודה או מקום שבו הצירים נפגשים? עכשיו כתבו את השם המתאים.',
  'pair-x':
    'הסתכלו על הזוג הסדור של הנקודה שמופיעה בשאלה. מה המספר שכתוב בצד השמאלי בתוך הסוגריים? זהו שיעור ה־x של אותה נקודה.',
  'pair-y':
    'הסתכלו על הזוג הסדור של הנקודה שמופיעה בשאלה. מה המספר שכתוב בצד הימני בתוך הסוגריים? זהו שיעור ה־y של אותה נקודה.',
  'x-order':
    'הסתכלו על הנקודות אחת־אחת. קראו לכל נקודה את שיעור ה־x שלה. הנקודה עם המספר הקטן יותר נמצאת שמאלה יותר.',
  'ordered-pair-order':
    'הסתכלו על שני הזוגות. המספר שבצד השמאלי אומר כמה זזים על ציר x, והמספר שבצד הימני אומר כמה עולים על ציר y. החלפת המספרים משנה את המקום.',
};

/* Hints teach the next move without stating the missing answer. */
const HINTS: Record<string, HintSet> = {
  'axis-x': [
    'הסתכלו על הציר המסומן. האם הוא הולך מצד לצד או מלמטה למעלה?',
    'ציר שהולך מצד לצד הוא ציר x. ציר שעולה מלמטה למעלה הוא ציר y. עכשיו בדקו את הציר שבשאלה.',
    'עקבו עם האצבע על הציר המסומן וקבעו קודם את הכיוון שלו. רק אחר כך כתבו את האות המתאימה.',
  ],
  'axis-y': [
    'הסתכלו על הציר המסומן. האם הוא הולך מצד לצד או מלמטה למעלה?',
    'ציר שהולך מצד לצד הוא ציר x. ציר שעולה מלמטה למעלה הוא ציר y. עכשיו בדקו את הציר שבשאלה.',
    'עקבו עם האצבע על הציר המסומן וקבעו קודם את הכיוון שלו. רק אחר כך כתבו את האות המתאימה.',
  ],
  'x-tick': [
    'הסתכלו על המספרים הכתובים ליד המקום החסר. בכמה הם משתנים ממקום מסומן אחד לבא אחריו?',
    'התחילו מהמספר הכתוב הקרוב ביותר. עברו מקום מסומן אחד בכל פעם והמשיכו באותו שינוי.',
    'בדקו שני מספרים שכבר כתובים על הציר. מצאו את ההפרש ביניהם, ואז השתמשו באותו הפרש כדי להגיע למקום החסר.',
  ],
  'y-tick': [
    'הסתכלו על המספרים הכתובים מעל ומתחת למקום החסר. בכמה הם משתנים ממקום מסומן אחד לבא אחריו?',
    'התחילו מהמספר הכתוב הקרוב ביותר. עברו מקום מסומן אחד בכל פעם והמשיכו באותו שינוי.',
    'בדקו שני מספרים שכבר כתובים על הציר. מצאו את ההפרש ביניהם, ואז השתמשו באותו הפרש כדי להגיע למקום החסר.',
  ],
  origin: [
    'חפשו את המקום שבו ציר x וציר y נפגשים.',
    'זהו המקום שממנו מתחילים לקרוא את מערכת הצירים. היזכרו בשם של המקום הזה.',
    'אמרו לעצמכם את השם בן שתי המילים של המקום שבו שני הצירים נפגשים, ואז כתבו אותו.',
  ],
  'origin-first': [
    'חפשו את המקום שבו שני הצירים נפגשים והיזכרו בשם המלא שלו.',
    'אמרו לעצמכם את השם המלא של המקום הזה. איזו מילה באה ראשונה?',
    'כתבו רק את המילה הראשונה בשם של המקום שבו שני הצירים נפגשים.',
  ],
  'origin-second': [
    'חפשו את המקום שבו שני הצירים נפגשים והיזכרו בשם המלא שלו.',
    'אמרו לעצמכם את השם המלא של המקום הזה. איזו מילה באה שנייה?',
    'כתבו רק את המילה השנייה בשם של המקום שבו שני הצירים נפגשים.',
  ],
  letter: [
    'הסתכלו על הציר. האם הוא הולך מצד לצד או מלמטה למעלה?',
    'אם הציר הולך מצד לצד הוא x; אם הוא עולה מלמטה למעלה הוא y.',
    'בדקו שוב את כיוון הציר המסומן ורק אז כתבו את האות.',
  ],
  property: [
    'הסתכלו על הקו: האם הוא הולך מצד לצד או מלמטה למעלה?',
    'קו שהולך מצד לצד וקו שעולה מלמטה למעלה מקבלים שמות שונים. בחרו לפי מה שאתם רואים.',
    'דמיינו שורת מחברת: אם הקו דומה לה הוא הולך מצד לצד; אם הוא עולה כלפי מעלה, כתבו את המילה שמתאימה לכך.',
  ],
  direction: [
    'הסתכלו מאיזה מספר מתחילים ולאיזה מספר מגיעים.',
    'קראו את המספר הראשון ואת המספר הבא בכיוון התנועה. המספרים גדלים או קטנים?',
    'אם המספר הבא גדול יותר, מתקדמים לכיוון שבו המספרים גדלים. אם הוא קטן יותר, לכיוון השני.',
  ],
  concept: [
    'הסתכלו רק על החלק המסומן. מה רואים שם?',
    'החליטו קודם אם זה ציר, מספר, נקודה או מקום שבו הצירים נפגשים.',
    'אחרי שהחלטתם מה רואים, כתבו את השם המתמטי של אותו דבר.',
  ],
  number: [
    'הסתכלו על המספרים שכבר כתובים ליד המקום החסר.',
    'התחילו מהמספר הכתוב הקרוב ביותר ועברו מקום מסומן אחד בכל פעם.',
    'בדקו בכמה המספר משתנה בכל מעבר, והמשיכו באותו שינוי עד המקום החסר.',
  ],
  relation: [
    'בחרו שני מספרים שמופיעים אחד אחרי השני בכיוון שמבקשים.',
    'המספר השני גדול יותר או קטן יותר מהראשון?',
    'בדקו עוד זוג אחד באותו כיוון. אם קורה אותו דבר, כתבו את המילה שמתארת את השינוי.',
  ],
  'pair-x': [
    'הסתכלו על הזוג הסדור של הנקודה שמופיעה בשאלה. מה המספר שכתוב בצד השמאלי בתוך הסוגריים?',
    'המספר שבצד השמאלי בתוך הסוגריים הוא שיעור ה־x של הנקודה.',
    'קראו שוב רק את המספר שבצד השמאלי בתוך הסוגריים. אותו מספר הוא שיעור ה־x שצריך להשתמש בו.',
  ],
  'pair-y': [
    'הסתכלו על הזוג הסדור של הנקודה שמופיעה בשאלה. מה המספר שכתוב בצד הימני בתוך הסוגריים?',
    'המספר שבצד הימני בתוך הסוגריים הוא שיעור ה־y של הנקודה.',
    'קראו שוב רק את המספר שבצד הימני בתוך הסוגריים. אותו מספר הוא שיעור ה־y שצריך להשתמש בו.',
  ],
  'x-order': [
    'הסתכלו רק על המיקום של הנקודות משמאל לימין. איזו נקודה נמצאת הכי שמאלה?',
    'קראו לכל נקודה את שיעור ה־x שלה. מספר קטן יותר פירושו שהנקודה נמצאת שמאלה יותר.',
    'כתבו ליד כל נקודה את שיעור ה־x שלה. סדרו את המספרים מהקטן לגדול, ואז סדרו את אותיות הנקודות באותו סדר.',
  ],
  'ordered-pair-order': [
    'הסתכלו על שני הזוגות הסדורים. האם המספרים נמצאים באותו צד בתוך הסוגריים?',
    'המספר שבצד השמאלי הוא שיעור ה־x, והמספר שבצד הימני הוא שיעור ה־y.',
    'כשמחליפים בין המספר שבצד השמאלי למספר שבצד הימני, משתנים שיעורי הנקודה ולכן גם המיקום שלה משתנה.',
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
  if (attempts >= 4) return 4;
  if (attempts === 3) return 3;
  if (attempts === 2) return 2;
  return 1;
}

function hintText(anchor: HTMLElement, level: HintLevel): string {
  const targets = unresolved(anchor);
  const sources = targets.length
    ? targets
    : Array.from(anchor.querySelectorAll<HTMLElement>('[data-lms-qid]'));
  const messages: string[] = [];

  for (const target of sources) {
    const kind = kindOf(target);
    const message = level === 4
      ? FINAL_GUIDANCE[kind] ?? FINAL_GUIDANCE.generic
      : (HINTS[kind] ?? GENERIC)[level - 1];
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
    const label = level === 1
      ? 'רמז'
      : level === 2
        ? 'כיוון נוסף'
        : level === 3
          ? 'הכוונה נוספת'
          : 'הסבר לפני שממשיכים';
    hint.dataset['hintLevel'] = String(level);
    hint.textContent = `${label}: ${hintText(anchor, level)}`;
    hint.hidden = false;
  };

  const observer = new MutationObserver(refresh);
  observer.observe(status, {
    attributes: true,
    attributeFilter: ['data-qstate'],
    childList: true,
    subtree: true,
  });
  refresh();
  return () => {
    observer.disconnect();
    hint.remove();
  };
}

export function installHintCoach(root: ParentNode): () => void {
  const cleanups = Array.from(
    root.querySelectorAll<HTMLElement>('.lms-qcheck'),
  ).map(attach);
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
