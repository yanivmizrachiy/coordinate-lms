import { elem } from '../lib/dom';
import { currentSession, isAdminSession } from './auth';
import { LMS_CONFIG } from './config';
import {
  loadAnswerKey,
  loadDraft,
  loadPageResult,
  logActivity,
  saveAnswerKey,
  saveDraft,
  savePageResult,
} from './repository';
import {
  calculatePageScore,
  equalQuestionTargetWeights,
  SCORE_POLICY_VERSION,
  scorePolicyOf,
} from './scoring';
import { answersMatch } from './answerValidation';
import { runSynchronizationRetry } from './syncRetry';
import type {
  ActivityEvent,
  AnswerKey,
  PageDraft,
  PageResult,
  PersistenceOutcome,
  QuestionProgress,
} from './types';

const TARGET_SELECTOR = '.blank, .word-blank, .pair-blank';

interface AttachResult {
  panel: HTMLElement;
  /** The final page grade + teacher comment. The shell places it at the TOP of
      the practice page, above the sheet — the learner meets the result before
      the worksheet, per the rules' "prominently in red" requirement. */
  scoreBanner: HTMLElement;
  cleanup: () => void;
}

interface CheckSummary {
  keyed: number;
  unkeyed: number;
  remaining: number;
}

type TargetOutcome = 'unkeyed' | 'correct' | 'locked' | 'missing' | 'wrong';

type QuestionState =
  | 'idle'
  | 'correct'
  | 'partial'
  | 'wrong'
  | 'locked'
  | 'pending';

interface QuestionGroup {
  id: string;
  targets: HTMLElement[];
  chip: HTMLElement;
  button: HTMLButtonElement;
}

const QUESTION_CHIP: Record<
  QuestionState,
  { icon: string; text: string; done: boolean }
> = {
  idle: { icon: '', text: '', done: false },
  correct: { icon: '✓', text: 'נכון', done: true },
  partial: { icon: '◐', text: 'יש מה לתקן', done: false },
  wrong: { icon: '✕', text: 'נסה שוב', done: false },
  locked: { icon: '🔒', text: 'נעול — נוצלו שלושת התיקונים', done: true },
  pending: { icon: '?', text: 'נשמר לבדיקת המורה', done: true },
};

function targetValue(target: HTMLElement): string {
  return (target.textContent || '').trim();
}

function setTargetValue(target: HTMLElement, value: string): void {
  target.textContent = value;
}

function defaultProgress(): QuestionProgress {
  return {
    answer: '',
    attempts: 0,
    correct: false,
    locked: false,
  };
}

function defaultDraft(uid: string, pageNumber: number): PageDraft {
  const now = Date.now();
  return {
    uid,
    pageNumber,
    startedAt: now,
    updatedAt: now,
    activeSeconds: 0,
    questions: {},
    submitted: false,
  };
}

function setMessage(
  node: HTMLElement,
  text: string,
  kind: 'normal' | 'success' | 'error' = 'normal',
): void {
  node.textContent = text;
  node.dataset.kind = kind;
}

export function attachLmsToPage(
  sheetWrap: HTMLElement,
  pageNumber: number,
): AttachResult {
  const session = currentSession();
  const uid = session?.uid || 'guest';

  const targets = Array.from(
    sheetWrap.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
  );

  const panel = elem('section', {
    class: 'lms-panel no-print',
    'aria-label': 'תרגול מתוקשב',
  });

  const status = elem('div', {
    class: 'lms-panel__status',
    text: 'המערכת מכינה את אזורי המענה…',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  const scoreHost = elem('div', {
    class: 'lms-score-banner no-print',
    'aria-live': 'polite',
  });

  const buttons = elem('div', {
    class: 'lms-panel__buttons',
  });

  const submitButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text:
      targets.length === 0
        ? 'סיימתי את הפעילות'
        : 'הגשת העמוד וקבלת ציון',
  }) as HTMLButtonElement;
  submitButton.disabled = true;

  const retryButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'ניסיון סנכרון נוסף',
    hidden: 'true',
  }) as HTMLButtonElement;

  buttons.append(submitButton, retryButton);

  if (isAdminSession()) {
    const adminButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'דשבורד מורה',
    });

    adminButton.addEventListener('click', () => {
      location.hash = '#/admin';
    });

    buttons.append(adminButton);
  }

  panel.append(status, buttons);

  let draft = defaultDraft(uid, pageNumber);
  let answerKey: AnswerKey = {};
  let latestResult: PageResult | null = null;
  let saveTimer: number | undefined;
  let lastActivityAt = Date.now();
  let draftSyncFailed = false;
  let resultSyncFailed = false;
  let submissionInFlight = false;
  let submitConfirmPending = false;
  let checkPromise: Promise<CheckSummary> | null = null;
  const pendingActivity = new Map<string, ActivityEvent>();

  const listeners: Array<{
    target: HTMLElement;
    input: EventListener;
    keydown: EventListener;
  }> = [];

  function progressFor(qid: string): QuestionProgress {
    const existing = draft.questions[qid];
    if (existing) return existing;
    const created = defaultProgress();
    draft.questions[qid] = created;
    return created;
  }

  function touch(): void {
    const now = Date.now();
    const delta = Math.floor((now - lastActivityAt) / 1000);
    if (delta > 0 && delta <= LMS_CONFIG.activityIdleSeconds) {
      draft.activeSeconds += delta;
    }
    lastActivityAt = now;
    draft.updatedAt = now;
  }

  const STATE_WORDS: Record<string, string> = {
    correct: 'נכון',
    wrong: 'לא נכון, אפשר לתקן',
    missing: 'עדיין לא מולא',
    locked: 'נעול לאחר שלושת התיקונים',
    pending: 'נשמר לבדיקת המורה',
  };

  const baseLabels = new WeakMap<HTMLElement, string>();

  function announceState(target: HTMLElement, state: string): void {
    let base = baseLabels.get(target);
    if (base === undefined) {
      base = target.getAttribute('aria-label')?.trim() || '';
      baseLabels.set(target, base);
    }
    const verdict = STATE_WORDS[state];
    target.setAttribute(
      'aria-label',
      verdict ? (base ? base + ' — ' + verdict : verdict) : base,
    );
  }

  function updateTarget(
    target: HTMLElement,
    progress: QuestionProgress,
  ): void {
    let state = 'empty';
    if (progress.correct) state = 'correct';
    else if (progress.locked) state = 'locked';
    else if (progress.attempts > 0) state = 'wrong';
    else if (progress.answer) state = 'filled';

    target.dataset.lmsState = state;
    target.dataset.lmsAttempts = String(progress.attempts);
    announceState(target, state);
    target.contentEditable =
      draft.submitted || progress.correct || progress.locked
        ? 'false'
        : 'true';
  }

  function rememberOutcome(
    operation: 'draft' | 'result',
    outcome: PersistenceOutcome,
  ): boolean {
    const failed = outcome.central === 'failed';
    if (operation === 'draft') draftSyncFailed = failed;
    else resultSyncFailed = failed;
    retryButton.hidden = !(
      draftSyncFailed ||
      resultSyncFailed ||
      pendingActivity.size > 0
    );
    return !failed;
  }

  async function persistDraft(): Promise<PersistenceOutcome> {
    const outcome = await saveDraft(draft);
    rememberOutcome('draft', outcome);
    if (outcome.central === 'failed') {
      setMessage(status, outcome.error || 'הסנכרון המרכזי נכשל.', 'error');
    }
    return outcome;
  }

  async function persistActivity(
    event: ActivityEvent,
  ): Promise<PersistenceOutcome> {
    const stableEvent: ActivityEvent = {
      ...event,
      id: event.id || crypto.randomUUID(),
    };
    const outcome = await logActivity(stableEvent);
    if (outcome.central === 'failed') {
      pendingActivity.set(stableEvent.id || '', stableEvent);
      setMessage(status, outcome.error || 'רישום הפעילות לא הסתנכרן.', 'error');
    } else {
      pendingActivity.delete(stableEvent.id || '');
    }
    retryButton.hidden = !(
      draftSyncFailed ||
      resultSyncFailed ||
      pendingActivity.size > 0
    );
    return outcome;
  }

  async function retrySynchronization(): Promise<void> {
    retryButton.disabled = true;
    setMessage(status, 'מנסה לסנכרן מחדש…');
    const resultToRetry = resultSyncFailed ? latestResult : null;
    const outcomes = await runSynchronizationRetry({
      ...(draftSyncFailed ? { retryDraft: persistDraft } : {}),
      ...(resultToRetry
        ? {
            retryResult: async () => {
              const outcome = await savePageResult(resultToRetry);
              rememberOutcome('result', outcome);
              return outcome;
            },
          }
        : {}),
      pendingActivity: [...pendingActivity.values()],
      retryActivity: persistActivity,
    });
    retryButton.disabled = false;
    if (outcomes.some((outcome) => outcome.central === 'failed')) {
      setMessage(
        status,
        'הנתונים נשמרו במכשיר, אך הסנכרון המרכזי עדיין נכשל. בדקו את החיבור ונסו שוב.',
        'error',
      );
    } else {
      setMessage(status, 'הסנכרון המרכזי הושלם.', 'success');
    }
  }

  function scheduleSave(): void {
    if (saveTimer !== undefined) {
      window.clearTimeout(saveTimer);
    }
    saveTimer = window.setTimeout(() => {
      void persistDraft();
    }, 300);
  }

  function snapshotAnswers(): void {
    for (const target of targets) {
      const qid = target.dataset.lmsQid;
      if (!qid) continue;
      const progress = progressFor(qid);
      progress.answer = targetValue(target);
    }
    draft.updatedAt = Date.now();
  }

  function showScore(score: number): void {
    const perfect = score >= LMS_CONFIG.maxScore;
    scoreHost.replaceChildren(
      elem(
        'div',
        { class: perfect ? 'lms-score lms-score--perfect' : 'lms-score' },
        elem(
          'div',
          {
            class: 'lms-score__circle',
            'aria-label':
              'ציון ' + String(score) + (perfect ? ' — ציון מושלם' : ''),
          },
          ...(perfect
            ? [
                elem('span', {
                  class: 'lms-score__spark',
                  text: '✨',
                  'aria-hidden': 'true',
                }),
                elem('span', { class: 'lms-score__num', text: String(score) }),
              ]
            : [elem('span', { class: 'lms-score__num', text: String(score) })]),
        ),
        elem('div', {
          class: 'lms-score__label',
          text: perfect
            ? '🎉 ציון מושלם! ' + String(score) + ' מתוך 100'
            : 'הציון בעמוד: ' + String(score) + ' מתוך 100',
        }),
      ),
    );
  }

  function gradeTarget(
    target: HTMLElement,
    key: AnswerKey,
    countAttempt: boolean,
  ): TargetOutcome {
    const qid = target.dataset.lmsQid;
    if (!qid) return 'unkeyed';

    const expected = key[qid] || [];
    const progress = progressFor(qid);

    if (expected.length === 0) {
      const state = progress.answer ? 'pending' : 'empty';
      target.dataset.lmsState = state;
      announceState(target, state);
      return 'unkeyed';
    }

    if (progress.correct || progress.locked) {
      updateTarget(target, progress);
      return progress.correct ? 'correct' : 'locked';
    }

    if (!progress.answer.trim()) {
      target.dataset.lmsState = 'missing';
      announceState(target, 'missing');
      return 'missing';
    }

    if (countAttempt) progress.attempts += 1;

    if (answersMatch(progress.answer, expected)) {
      progress.correct = true;
    } else if (progress.attempts >= LMS_CONFIG.maxAttempts) {
      progress.locked = true;
    }

    updateTarget(target, progress);
    return progress.correct ? 'correct' : progress.locked ? 'locked' : 'wrong';
  }

  async function performCheck(): Promise<CheckSummary> {
    touch();
    snapshotAnswers();
    answerKey = await loadAnswerKey(pageNumber);

    let keyed = 0;
    let unkeyed = 0;
    let remaining = 0;

    for (const target of targets) {
      if (!target.dataset.lmsQid) continue;
      const outcome = gradeTarget(target, answerKey, true);
      if (outcome === 'unkeyed') {
        unkeyed += 1;
      } else {
        keyed += 1;
        if (outcome === 'missing' || outcome === 'wrong') remaining += 1;
      }
    }

    refreshQuestions();
    draft.updatedAt = Date.now();
    const draftOutcome = await persistDraft();
    const activityOutcome = await persistActivity({
      uid,
      pageNumber,
      type: 'answer_check',
      createdAt: Date.now(),
      metadata: { keyed, unkeyed, remaining },
    });

    if (
      draftOutcome.central === 'failed' ||
      activityOutcome.central === 'failed'
    ) {
      setMessage(
        status,
        'הבדיקה נשמרה במכשיר, אך הסנכרון המרכזי נכשל. אפשר לנסות שוב בכפתור הסנכרון.',
        'error',
      );
    } else if (keyed === 0 && targets.length > 0) {
      setMessage(
        status,
        'לעמוד הזה עדיין לא הוגדר מפתח תשובות. מנהל יכול לפתוח מצב מורה ולשמור את התשובות הנכונות.',
        'error',
      );
    } else if (remaining > 0) {
      setMessage(
        status,
        'הבדיקה הושלמה. נותרו ' +
          String(remaining) +
          ' תשובות לתיקון. יש ניסיון ראשון ועד 3 אפשרויות תיקון.',
      );
    } else {
      setMessage(
        status,
        'כל התשובות שניתן לבדוק הושלמו. אפשר להגיש את העמוד.',
        'success',
      );
    }

    return { keyed, unkeyed, remaining };
  }

  function runCheck(): Promise<CheckSummary> {
    if (checkPromise) return checkPromise;
    checkPromise = performCheck().finally(() => {
      checkPromise = null;
    });
    return checkPromise;
  }

  /* A page is worth 100 as a whole. First split that value equally among the
     learner-facing question groups, then split each question's share equally
     among its keyed answer targets. Extra blanks inside one question therefore
     never make that question worth more. Submission and the regrade of a
     historical score both flow through here — one scoring mechanism. */
  function collectKeyedEntries(): Array<{
    qid: string;
    weight: number;
    progress: QuestionProgress;
  }> {
    const targetWeights = equalQuestionTargetWeights(
      questionGroups.map((group) =>
        group.targets
          .map((target) => target.dataset.lmsQid)
          .filter(
            (qid): qid is string =>
              Boolean(qid && (answerKey[qid] || []).length > 0),
          ),
      ),
    );

    const keyedEntries: Array<{
      qid: string;
      weight: number;
      progress: QuestionProgress;
    }> = [];
    for (const [qid, weight] of targetWeights) {
      const progress = draft.questions[qid];
      if (progress) keyedEntries.push({ qid, weight, progress });
    }
    return keyedEntries;
  }

  function scoreFromKeyedEntries(
    keyedEntries: ReturnType<typeof collectKeyedEntries>,
  ): number {
    return calculatePageScore(
      keyedEntries.map(({ progress, weight }) => ({
        attempts: progress.attempts,
        correct: progress.correct,
        locked: progress.locked,
        weight,
      })),
      true,
    );
  }

  /* A page submitted before the current scoring policy keeps a score computed
     under the old rules. When the stored draft still holds the full per-target
     attempt record, regrade it here — same weights, same credit curve as a
     fresh submission — and persist the corrected score with its policy stamp.
     Answers and attempts are never touched; nothing is reset. When the stored
     record lacks the data to recompute (no keyed progress survived), the
     legacy score is kept as-is under its legacy policy label rather than
     inventing a number. Comparing values, not just versions, makes the pass
     idempotent AND self-healing: a re-run on a correct record writes nothing. */
  function regradeSubmittedPage(storedQuestionIds: ReadonlySet<string>): void {
    if (!draft.submitted || targets.length === 0) return;
    const keyedEntries = collectKeyedEntries();
    if (keyedEntries.length === 0) return;
    /* Regrade only from progress the STORED record actually contains. By the
       time this runs, hydration has already created default (zero-attempt)
       progress for every live target; grading those defaults would fabricate
       a zero for a record that merely lacks data. */
    if (!keyedEntries.every(({ qid }) => storedQuestionIds.has(qid))) return;

    const score = scoreFromKeyedEntries(keyedEntries);
    const computedAt = Date.now();

    if (
      draft.score !== score ||
      scorePolicyOf(draft) !== SCORE_POLICY_VERSION
    ) {
      draft.score = score;
      draft.scorePolicyVersion = SCORE_POLICY_VERSION;
      draft.scoreComputedAt = computedAt;
      draft.updatedAt = computedAt;
      void persistDraft();
    }

    if (
      latestResult &&
      (latestResult.score !== score ||
        scorePolicyOf(latestResult) !== SCORE_POLICY_VERSION)
    ) {
      /* Same submission, regraded: identity fields stay untouched; only the
         score triple moves to the current policy. bestScore is re-based —
         a legacy-scale maximum must not shadow the current-policy grade. */
      latestResult = {
        ...latestResult,
        score,
        latestScore: score,
        bestScore: score,
        scorePolicyVersion: SCORE_POLICY_VERSION,
        scoreComputedAt: computedAt,
      };
      const resultToPersist = latestResult;
      void savePageResult(resultToPersist).then((outcome) => {
        rememberOutcome('result', outcome);
      });
    }
  }

  async function submitPage(): Promise<void> {
    if (submissionInFlight || draft.submitted) return;
    submissionInFlight = true;
    submitButton.disabled = true;

    try {
      touch();
      snapshotAnswers();

      let score = 100;
      let attempts: Record<string, number> = {};
      let answers: Record<string, string> = {};

      if (targets.length > 0) {
        const summary = await runCheck();
        if (summary.keyed === 0) return;

        answerKey = await loadAnswerKey(pageNumber);
        const keyedEntries = collectKeyedEntries();

        const unresolved = keyedEntries.filter(
          ({ progress }) => !progress.correct && !progress.locked,
        ).length;

        if (unresolved > 0 && !submitConfirmPending) {
          submitConfirmPending = true;
          setMessage(
            status,
            'נותרו ' +
              String(unresolved) +
              ' תשובות שלא הושלמו. אפשר להמשיך לתרגל, או ללחוץ „הגשת העמוד" שוב כדי לקבל ציון על מה שנפתר.',
          );
          return;
        }

        submitConfirmPending = false;
        score = scoreFromKeyedEntries(keyedEntries);

        for (const [qid, progress] of Object.entries(draft.questions)) {
          attempts[qid] = progress.attempts;
          answers[qid] = progress.answer;
        }
      }

      const submittedAt = Date.now();
      latestResult = {
        uid,
        pageNumber,
        score,
        startedAt: draft.startedAt,
        submittedAt,
        activeSeconds: draft.activeSeconds,
        attempts,
        answers,
        scorePolicyVersion: SCORE_POLICY_VERSION,
        scoreComputedAt: submittedAt,
        submissionId: crypto.randomUUID(),
      };

      const resultOutcome = await savePageResult(latestResult);
      rememberOutcome('result', resultOutcome);

      draft.submitted = true;
      draft.score = score;
      draft.scorePolicyVersion = SCORE_POLICY_VERSION;
      draft.scoreComputedAt = submittedAt;
      draft.updatedAt = submittedAt;
      const draftOutcome = await persistDraft();
      showScore(score);
      /* The banner lives at the TOP of the page; the learner submits from the
         bottom. Bring the grade to them — on submission only, never on load. */
      scoreHost.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refreshQuestions();

      const activityOutcome = await persistActivity({
        uid,
        pageNumber,
        type: 'page_submit',
        createdAt: submittedAt,
        metadata: {
          score,
          activeSeconds: draft.activeSeconds,
          submissionId: latestResult.submissionId,
        },
      });

      for (const target of targets) {
        const qid = target.dataset.lmsQid;
        if (qid) updateTarget(target, progressFor(qid));
      }

      const syncFailed = [
        resultOutcome,
        draftOutcome,
        activityOutcome,
      ].some((outcome) => outcome.central === 'failed');

      if (syncFailed) {
        setMessage(
          status,
          'ההגשה נשמרה במכשיר, אבל הסנכרון המרכזי לא הושלם. לחצו על ניסיון סנכרון נוסף.',
          'error',
        );
      } else if (uid === 'guest') {
        setMessage(status, 'העמוד נשמר במכשיר.', 'success');
      } else if (resultOutcome.central === 'saved') {
        setMessage(
          status,
          targets.length === 0
            ? 'הפעילות הושלמה וסונכרנה במערכת המרכזית.'
            : 'העמוד הוגש וסונכרן במערכת המרכזית.',
          'success',
        );
      } else {
        setMessage(
          status,
          'ההגשה נשמרה במכשיר בלבד; סנכרון מרכזי אינו פעיל.',
        );
      }
    } finally {
      submissionInFlight = false;
      submitButton.disabled = draft.submitted;
      if (draft.submitted) submitButton.textContent = 'העמוד הוגש';
    }
  }

  submitButton.addEventListener('click', () => {
    void submitPage();
  });

  retryButton.addEventListener('click', () => {
    void retrySynchronization();
  });

  const retryWhenOnline = (): void => {
    if (!retryButton.hidden) void retrySynchronization();
  };
  window.addEventListener('online', retryWhenOnline);

  if (isAdminSession() && targets.length > 0) {
    const keyButton = elem('button', {
      class: 'btn btn--teacher',
      type: 'button',
      text: 'שמירת התשובות שמולאו כמפתח מורה',
      title: 'מלאו בכל אזור את התשובה הנכונה ולחצו לשמירת המפתח',
    });

    keyButton.addEventListener('click', () => {
      const key: AnswerKey = {};
      for (const target of targets) {
        const qid = target.dataset.lmsQid;
        const answer = targetValue(target);
        if (qid && answer) key[qid] = [answer];
      }

      const count = Object.keys(key).length;
      if (count === 0) {
        setMessage(
          status,
          'לא נמצאו תשובות לשמירה. מלאו את התשובות הנכונות בתוך הדף.',
          'error',
        );
        return;
      }

      void saveAnswerKey(pageNumber, key)
        .then(() => {
          answerKey = key;
          setMessage(
            status,
            'נשמר מפתח מורה עבור ' + String(count) + ' אזורי תשובה.',
            'success',
          );
        })
        .catch((error: unknown) => {
          setMessage(
            status,
            error instanceof Error ? error.message : 'שמירת המפתח נכשלה.',
            'error',
          );
        });
    });

    buttons.append(keyButton);
  }

  targets.forEach((target, index) => {
    const qid = 'p' + String(pageNumber) + '-q' + String(index + 1);
    target.dataset.lmsQid = qid;
    target.dataset.lmsEditable = 'true';
    target.setAttribute('role', 'textbox');
    if (!target.getAttribute('aria-label')?.trim()) {
      const context = target
        .closest('tr, li, p, .completion-sentence, .q-card')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);
      target.setAttribute(
        'aria-label',
        context
          ? 'תשובה ' + String(index + 1) + ': ' + context
          : 'תשובה ' + String(index + 1) + ' בעמוד ' + String(pageNumber),
      );
    }
    target.setAttribute('tabindex', '0');
    target.spellcheck = false;

    const onInput: EventListener = () => {
      touch();
      const progress = progressFor(qid);
      progress.answer = targetValue(target);
      progress.correct = false;
      submitConfirmPending = false;

      if (!progress.locked) {
        target.dataset.lmsState = progress.answer ? 'filled' : 'empty';
      }

      scheduleSave();
      void persistActivity({
        uid,
        pageNumber,
        type: 'answer_change',
        createdAt: Date.now(),
        metadata: { qid },
      });
    };

    const onKeydown: EventListener = (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        keyboardEvent.preventDefault();
        target.blur();
      }
    };

    target.addEventListener('input', onInput);
    target.addEventListener('keydown', onKeydown);
    listeners.push({ target, input: onInput, keydown: onKeydown });
  });

  const questionAnchorOf = (target: HTMLElement): HTMLElement =>
    target.closest<HTMLElement>('.q-card') ??
    target.closest<HTMLElement>('li, tr, p, .completion-sentence') ??
    target;

  const questionGroups: QuestionGroup[] = [];
  const groupByAnchor = new Map<HTMLElement, QuestionGroup>();

  const progressHost = elem('div', {
    class: 'lms-progress no-print',
    role: 'status',
    'aria-live': 'polite',
  });

  function deriveQuestion(group: QuestionGroup): QuestionState {
    let hasKeyed = false;
    let allCorrect = true;
    let anyCorrect = false;
    let anyAttempt = false;
    let anyPending = false;
    let allResolved = true;

    for (const target of group.targets) {
      const qid = target.dataset.lmsQid;
      if (!qid) continue;
      const progress = progressFor(qid);
      const keyed = (answerKey[qid] || []).length > 0;

      if (keyed) {
        hasKeyed = true;
        if (progress.correct) anyCorrect = true;
        else allCorrect = false;
        if (progress.attempts > 0) anyAttempt = true;
        if (!(progress.correct || progress.locked)) allResolved = false;
      } else if (progress.answer.trim()) {
        anyPending = true;
      }
    }

    if (!hasKeyed) return anyPending ? 'pending' : 'idle';
    if (allCorrect) return 'correct';
    if (anyCorrect) return 'partial';
    if (allResolved) return 'locked';
    if (anyAttempt) return 'wrong';
    return 'idle';
  }

  function renderQuestion(group: QuestionGroup): QuestionState {
    const state = deriveQuestion(group);
    const chip = QUESTION_CHIP[state];
    group.chip.dataset.qstate = state;
    group.chip.textContent = chip.icon ? chip.icon + ' ' + chip.text : '';
    group.button.disabled =
      draft.submitted || state === 'correct' || state === 'locked';
    return state;
  }

  function refreshQuestions(): void {
    if (questionGroups.length === 0) return;
    let done = 0;
    for (const group of questionGroups) {
      if (QUESTION_CHIP[renderQuestion(group)].done) done += 1;
    }
    progressHost.textContent =
      String(done) +
      ' מתוך ' +
      String(questionGroups.length) +
      ' שאלות הושלמו';
  }

  async function checkQuestion(group: QuestionGroup): Promise<void> {
    if (draft.submitted) return;
    touch();

    for (const target of group.targets) {
      const qid = target.dataset.lmsQid;
      if (qid) progressFor(qid).answer = targetValue(target);
    }

    answerKey = await loadAnswerKey(pageNumber);
    for (const target of group.targets) {
      gradeTarget(target, answerKey, true);
    }

    draft.updatedAt = Date.now();
    refreshQuestions();

    const draftOutcome = await persistDraft();
    const activityOutcome = await persistActivity({
      uid,
      pageNumber,
      type: 'answer_check',
      createdAt: Date.now(),
      metadata: {
        question: group.id,
        targets: group.targets.length,
      },
    });

    const state = deriveQuestion(group);
    if (
      draftOutcome.central === 'failed' ||
      activityOutcome.central === 'failed'
    ) {
      setMessage(status, 'הבדיקה נשמרה במכשיר, אך הסנכרון המרכזי נכשל.', 'error');
    } else if (state === 'correct') {
      setMessage(status, 'כל הכבוד! השאלה נכונה.', 'success');
    } else if (state === 'partial') {
      setMessage(
        status,
        'חלק מהתשובות נכונות. תקנו את החלק המסומן והשלימו את השאלה.',
      );
    } else if (state === 'pending') {
      setMessage(status, 'התשובה נשמרה לבדיקת המורה.', 'success');
    } else if (state === 'locked') {
      setMessage(
        status,
        'נוצלו הניסיון הראשון ושלושת התיקונים בשאלה זו.',
        'error',
      );
    } else {
      setMessage(status, 'עדיין לא נכון — אפשר לתקן ולהגיש שוב.', 'error');
    }
  }

  for (const target of targets) {
    const anchor = questionAnchorOf(target);
    let group = groupByAnchor.get(anchor);

    if (!group) {
      const chip = elem('span', {
        class: 'lms-qstatus',
        role: 'status',
        'aria-live': 'polite',
      });
      const button = elem('button', {
        class: 'btn btn--gold btn--sm lms-qcheck__btn',
        type: 'button',
        text: 'להגיש ←',
        'aria-label': 'להגיש שאלה לבדיקה',
        title: 'להגיש שאלה לבדיקה',
      }) as HTMLButtonElement;
      const controls = elem(
        'div',
        { class: 'lms-qcheck no-print' },
        button,
        chip,
      );

      group = {
        id: 'q' + String(questionGroups.length + 1),
        targets: [],
        chip,
        button,
      };
      questionGroups.push(group);
      groupByAnchor.set(anchor, group);

      const boundGroup = group;
      button.addEventListener('click', () => {
        void checkQuestion(boundGroup);
      });

      if (anchor === target) target.insertAdjacentElement('afterend', controls);
      else anchor.append(controls);
    }

    group.targets.push(target);
  }

  if (questionGroups.length > 0) panel.append(progressHost);

  void Promise.all([
    loadDraft(uid, pageNumber),
    loadAnswerKey(pageNumber),
    loadPageResult(uid, pageNumber),
  ]).then(([storedDraft, storedKey, storedResult]) => {
    answerKey = storedKey;
    latestResult = storedResult;

    if (storedDraft) draft = storedDraft;
    const storedQuestionIds = new Set(Object.keys(draft.questions));

    for (const target of targets) {
      const qid = target.dataset.lmsQid;
      if (!qid) continue;
      const progress = progressFor(qid);
      if (progress.answer) setTargetValue(target, progress.answer);
      updateTarget(target, progress);
    }

    /* Before showing a stored grade, bring it onto the current scoring
       policy. Runs before showScore so the learner only ever meets the
       policy-current number. */
    regradeSubmittedPage(storedQuestionIds);

    if (draft.score !== undefined) showScore(draft.score);

    refreshQuestions();
    submitButton.disabled = draft.submitted;
    if (draft.submitted) submitButton.textContent = 'העמוד הוגש';

    const keyedCount = Object.keys(answerKey).length;
    if (draft.submitted) {
      setMessage(
        status,
        'העמוד כבר הוגש. הציון והתקדמות הניסיונות נשמרו.',
        'success',
      );
    } else if (targets.length === 0) {
      setMessage(
        status,
        'זהו עמוד פעילות או משחק. בסיום לחצו על כפתור ההשלמה.',
      );
    } else if (keyedCount > 0) {
      setMessage(
        status,
        'נמצאו ' +
          String(targets.length) +
          ' אזורי מענה. מפתח אוטומטי זמין ל־' +
          String(keyedCount) +
          ' תשובות.',
        'success',
      );
    } else {
      setMessage(
        status,
        'נמצאו ' +
          String(targets.length) +
          ' אזורי מענה. נדרש מפתח תשובות של המורה לעמוד זה.',
      );
    }
  }).catch(() => {
    setMessage(
      status,
      'טעינת ההתקדמות נכשלה. ההגשה מושבתת כדי למנוע דריסה של נתונים קיימים; רעננו את העמוד ונסו שוב.',
      'error',
    );
  });

  void persistActivity({
    uid,
    pageNumber,
    type: 'page_open',
    createdAt: Date.now(),
    metadata: { answerTargets: targets.length },
  });

  const heartbeat = window.setInterval(() => {
    touch();
    scheduleSave();
    void persistActivity({
      uid,
      pageNumber,
      type: 'heartbeat',
      createdAt: Date.now(),
      metadata: { activeSeconds: draft.activeSeconds },
    });
  }, LMS_CONFIG.activityHeartbeatSeconds * 1000);

  return {
    panel,
    scoreBanner: scoreHost,
    cleanup: () => {
      window.clearInterval(heartbeat);
      if (saveTimer !== undefined) window.clearTimeout(saveTimer);

      touch();
      snapshotAnswers();
      void persistDraft();
      void persistActivity({
        uid,
        pageNumber,
        type: 'page_leave',
        createdAt: Date.now(),
        metadata: { activeSeconds: draft.activeSeconds },
      });

      for (const listener of listeners) {
        listener.target.removeEventListener('input', listener.input);
        listener.target.removeEventListener('keydown', listener.keydown);
      }

      window.removeEventListener('online', retryWhenOnline);
    },
  };
}
