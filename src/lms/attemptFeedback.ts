import '../styles/attempt-feedback.css';
import { remainingCreditFraction } from './scoring';

interface TargetSnapshot {
  attempts: number;
  correct: boolean;
  locked: boolean;
  state: string;
}

function targetsFor(control: HTMLElement): HTMLElement[] {
  const anchor = control.parentElement ?? control;
  return Array.from(anchor.querySelectorAll<HTMLElement>('[data-lms-qid]'));
}

function snapshot(target: HTMLElement): TargetSnapshot {
  const state = target.dataset['lmsState'] || 'empty';
  return {
    attempts: Number(target.dataset['lmsAttempts'] || 0),
    correct: state === 'correct',
    locked: state === 'locked',
    state,
  };
}

function scoreable(items: TargetSnapshot[]): TargetSnapshot[] {
  return items.filter((item) =>
    ['correct', 'wrong', 'locked', 'missing'].includes(item.state),
  );
}

function roundedPoints(value: number): number {
  return Math.round(value);
}

function messageFor(items: TargetSnapshot[], qstate: string): string {
  const relevant = scoreable(items);
  if (!relevant.length || qstate === 'idle' || qstate === 'pending') return '';

  const maxAttempt = Math.max(0, ...relevant.map((item) => item.attempts));
  const remaining =
    relevant.reduce(
      (sum, item) =>
        sum +
        remainingCreditFraction({
          attempts: item.attempts,
          correct: item.correct,
          locked: item.locked,
        }),
      0,
    ) / relevant.length;

  const remainingPoints = roundedPoints(remaining * 100);
  const lostPoints = 100 - remainingPoints;

  if (qstate === 'correct') {
    if (lostPoints === 0) {
      return 'נכון בניסיון הראשון — נשמרו כל 100 הנקודות של השאלה.';
    }
    return `נכון. השתמשת ב־${maxAttempt} ניסיונות. בגלל הניסיונות הקודמים ירדו ${lostPoints} נקודות; נשארו ${remainingPoints} מתוך 100 נקודות לשאלה.`;
  }

  if (qstate === 'locked') {
    return 'נוצלו 3 ניסיונות. בחלקים שלא תוקנו לא נשאר ניקוד. קרא את הרמז וההסבר כדי להבין את הדרך לפני שממשיכים.';
  }

  const attemptText = maxAttempt > 0 ? `ניסיון ${maxAttempt} מתוך 3.` : '';
  return `${attemptText} עד עכשיו ירדו ${lostPoints} נקודות מהניקוד האפשרי של השאלה; המקסימום שנותר הוא ${remainingPoints} מתוך 100. תקן רק את החלקים שסומנו ונסה שוב.`.trim();
}

function attach(control: HTMLElement): () => void {
  const status = control.querySelector<HTMLElement>('.lms-qstatus');
  if (!status) return () => {};

  const feedback = document.createElement('div');
  feedback.className = 'lms-qattempt';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  control.append(feedback);

  const refresh = (): void => {
    const qstate = status.dataset['qstate'] || 'idle';
    const message = messageFor(targetsFor(control).map(snapshot), qstate);
    feedback.textContent = message;
    feedback.hidden = !message;
  };

  const observer = new MutationObserver(refresh);
  observer.observe(control.parentElement ?? control, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-qstate', 'data-lms-state', 'data-lms-attempts'],
  });
  refresh();

  return () => {
    observer.disconnect();
    feedback.remove();
  };
}

export function installAttemptFeedback(root: ParentNode): () => void {
  const cleanups = Array.from(
    root.querySelectorAll<HTMLElement>('.lms-qcheck'),
  ).map(attach);
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
