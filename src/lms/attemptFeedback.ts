import '../styles/attempt-feedback.css';
import { LMS_CONFIG } from './config';
import { teacherVoice, type TeacherFeedbackState } from './teacherVoice';

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

/* How many corrections the learner can still use, phrased as an invitation to
   act — never as arithmetic about points. */
function correctionsLeftLabel(attempts: number): string {
  const left = Math.max(0, LMS_CONFIG.maxAttempts - attempts);
  if (left <= 0) return '';
  if (left === 1) return 'זו אפשרות התיקון האחרונה, קחו רגע לחשוב.';
  return `אפשר לתקן עוד ${left} פעמים.`;
}

function feedbackState(qstate: string): TeacherFeedbackState {
  if (qstate === 'correct' || qstate === 'partial' || qstate === 'locked') {
    return qstate;
  }
  return 'wrong';
}

function messageFor(
  items: TargetSnapshot[],
  qstate: string,
  questionIndex: number,
): string {
  /* The child hears a teacher, not an accountant: encouragement and the next
     step only. The scoring model still runs exactly as before — its arithmetic
     shows up in the final page grade, never inside these notes. */
  const relevant = scoreable(items);
  if (!relevant.length || qstate === 'idle' || qstate === 'pending') return '';

  const maxAttempt = Math.max(0, ...relevant.map((item) => item.attempts));
  const voice = teacherVoice(feedbackState(qstate), maxAttempt, questionIndex);

  if (qstate === 'correct') return voice;

  if (qstate === 'locked') {
    return `${voice} נוצלו כל אפשרויות התיקון לשאלה הזאת. קראו את ההסבר כדי להבין את הדרך, וממשיכים הלאה.`;
  }

  const used = Math.min(maxAttempt, LMS_CONFIG.maxAttempts);
  return `${voice} תקנו רק את החלקים שסומנו. ${correctionsLeftLabel(used)}`.trim();
}

function attach(control: HTMLElement, questionIndex: number): () => void {
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
    const message = messageFor(
      targetsFor(control).map(snapshot),
      qstate,
      questionIndex,
    );
    if (feedback.textContent !== message) feedback.textContent = message;
    const shouldHide = !message;
    if (feedback.hidden !== shouldHide) feedback.hidden = shouldHide;
  };

  /* Observe only grading-state attributes. Observing childList here would make
     our own feedback.textContent update trigger the observer again forever. */
  const observer = new MutationObserver(refresh);
  observer.observe(control.parentElement ?? control, {
    subtree: true,
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
  ).map((control, index) => attach(control, index));
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
