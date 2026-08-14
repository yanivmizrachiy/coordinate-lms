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
import { calculatePageScore } from './scoring';
import { answersMatch } from './answerValidation';
import { acceptImmediateCorrectAnswer } from './liveFeedback';
import { runSynchronizationRetry } from './syncRetry';
import type {
  ActivityEvent,
  AnswerKey,
  PageDraft,
  PageResult,
  PersistenceOutcome,
  QuestionProgress,
} from './types';

const TARGET_SELECTOR =
  '.blank, .word-blank, .pair-blank';

interface AttachResult {
  panel: HTMLElement;
  cleanup: () => void;
}

interface CheckSummary {
  keyed: number;
  unkeyed: number;
  remaining: number;
}

function targetValue(target: HTMLElement): string {
  return (target.textContent || '').trim();
}

function setTargetValue(
  target: HTMLElement,
  value: string,
): void {
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

function defaultDraft(
  uid: string,
  pageNumber: number,
): PageDraft {
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

function noSaveOutcome(): PersistenceOutcome {
  return {
    localSaved: false,
    central: 'not-required',
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

/** Practice access is public. Registration controls persistence, not pages. */
export function canAccessPage(pageNumber: number): boolean {
  void pageNumber;
  return true;
}

/**
 * Kept as a compatibility renderer for old callers. It is no longer an access
 * gate: anonymous students can practice every page.
 */
export function renderAccessGate(
  outlet: HTMLElement,
  pageNumber: number,
): void {
  const card = elem(
    'section',
    {
      class: 'lms-gate no-print',
      role: 'region',
      'aria-label': 'שמירה ודוחות באמצעות הרשמה',
    },
    elem('h1', {
      text: 'עמוד ' + String(pageNumber) + ' פתוח לתרגול ללא הרשמה',
    }),
    elem('p', {
      text:
        'אפשר לתרגל מיד. הרשמה נדרשת רק כדי לשמור תוצאות, לתעד התקדמות ולקבל דוחות.',
    }),
  );

  const actions = elem('div', {
    class: 'lms-gate__actions',
  });

  const registerButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'הרשמה לשמירה ודוחות',
  });

  registerButton.addEventListener('click', () => {
    location.hash = '#/login';
  });

  const continueButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'המשך ללא שמירה',
  });

  continueButton.addEventListener('click', () => {
    location.hash = '#/workbook/' + String(pageNumber);
  });

  actions.append(registerButton, continueButton);
  card.append(actions);
  outlet.replaceChildren(card);
}

export function attachLmsToPage(
  sheetWrap: HTMLElement,
  pageNumber: number,
): AttachResult {
  const session = currentSession();
  const persistenceEnabled = session !== null;
  const uid = session?.uid || 'guest';

  const targets = Array.from(
    sheetWrap.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
  );

  const panel = elem('section', {
    class: 'lms-panel no-print',
    'aria-label': 'תרגול מתוקשב',
  });

  const heading = elem('div', {
    class: 'lms-panel__heading',
  });

  heading.append(
    elem('div', {
      class: 'lms-panel__title',
      text: '✍️ תרגול מתוקשב — עמוד ' + String(pageNumber),
    }),
    elem('div', {
      class: 'lms-panel__identity',
      text: session
        ? 'תלמיד: ' + session.fullName + ' — השמירה פעילה'
        : 'תרגול ללא הרשמה — אין שמירה או מעקב',
    }),
  );

  const status = elem('div', {
    class: 'lms-panel__status',
    text: 'המערכת מכינה את אזורי המענה…',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  const scoreHost = elem('div', {
    class: 'lms-panel__scorehost',
    'aria-live': 'polite',
  });

  const buttons = elem('div', {
    class: 'lms-panel__buttons',
  });

  const checkButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'בדיקת תשובות',
  }) as HTMLButtonElement;

  const submitButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text:
      targets.length === 0
        ? 'סיימתי את הפעילות'
        : 'הגשת העמוד וקבלת ציון',
  }) as HTMLButtonElement;
  checkButton.disabled = true;
  submitButton.disabled = true;

  const accountButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: session ? 'החשבון שלי' : 'הרשמה לשמירה ודוחות',
  });

  accountButton.addEventListener('click', () => {
    location.hash = '#/login';
  });

  const retryButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'ניסיון סנכרון נוסף',
    hidden: 'true',
  }) as HTMLButtonElement;

  buttons.append(
    checkButton,
    submitButton,
    retryButton,
    accountButton,
  );

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

  panel.append(heading, status, scoreHost, buttons);

  let draft = defaultDraft(uid, pageNumber);
  let answerKey: AnswerKey = {};
  let latestResult: PageResult | null = null;
  let saveTimer: number | undefined;
  let lastActivityAt = Date.now();
  let draftSyncFailed = false;
  let resultSyncFailed = false;
  let submissionInFlight = false;
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

    if (
      delta > 0 &&
      delta <= LMS_CONFIG.activityIdleSeconds
    ) {
      draft.activeSeconds += delta;
    }

    lastActivityAt = now;
    draft.updatedAt = now;
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
    target.contentEditable =
      draft.submitted || progress.correct || progress.locked
        ? 'false'
        : 'true';
  }

  function inlineExpectedAnswers(target: HTMLElement): string[] {
    const raw = target.dataset.lmsAnswers;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === 'string')
        : [];
    } catch {
      return [];
    }
  }

  function showImmediateCorrectFeedback(
    target: HTMLElement,
    qid: string,
  ): boolean {
    const progress = progressFor(qid);
    const storedExpected = answerKey[qid] || [];
    const expected = storedExpected.length > 0
      ? storedExpected
      : inlineExpectedAnswers(target);

    if (!acceptImmediateCorrectAnswer(progress, expected)) {
      return false;
    }

    updateTarget(target, progress);
    target.dataset.lmsFeedback = 'correct';
    return true;
  }

  function rememberOutcome(
    operation: 'draft' | 'result',
    outcome: PersistenceOutcome,
  ): boolean {
    if (!persistenceEnabled) return true;
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
    if (!persistenceEnabled) return noSaveOutcome();
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
    if (!persistenceEnabled) return noSaveOutcome();
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
    if (!persistenceEnabled) return;
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
    if (!persistenceEnabled) return;
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
    scoreHost.replaceChildren(
      elem(
        'div',
        { class: 'lms-score' },
        elem('div', {
          class: 'lms-score__circle',
          text: String(score),
          'aria-label': 'ציון ' + String(score),
        }),
        elem('div', {
          class: 'lms-score__label',
          text: 'הציון בעמוד: ' + String(score) + ' מתוך 100',
        }),
      ),
    );
  }

  async function performCheck(): Promise<CheckSummary> {
    touch();
    snapshotAnswers();
    answerKey = await loadAnswerKey(pageNumber);

    let keyed = 0;
    let unkeyed = 0;
    let remaining = 0;

    for (const target of targets) {
      const qid = target.dataset.lmsQid;

      if (!qid) continue;

      const expected = answerKey[qid] || [];
      const progress = progressFor(qid);

      if (expected.length === 0) {
        unkeyed += 1;
        target.dataset.lmsState = progress.answer
          ? 'pending'
          : 'empty';
        continue;
      }

      keyed += 1;

      if (progress.correct || progress.locked) {
        updateTarget(target, progress);
        continue;
      }

      if (!progress.answer.trim()) {
        target.dataset.lmsState = 'missing';
        remaining += 1;
        continue;
      }

      progress.attempts += 1;

      const correct = answersMatch(progress.answer, expected);

      if (correct) {
        progress.correct = true;
      } else if (
        progress.attempts >= LMS_CONFIG.maxAttempts
      ) {
        progress.locked = true;
      } else {
        remaining += 1;
      }

      updateTarget(target, progress);
    }

    draft.updatedAt = Date.now();
    const draftOutcome = await persistDraft();

    const activityOutcome = await persistActivity({
      uid,
      pageNumber,
      type: 'answer_check',
      createdAt: Date.now(),
      metadata: {
        keyed,
        unkeyed,
        remaining,
      },
    });

    if (
      persistenceEnabled &&
      (draftOutcome.central === 'failed' || activityOutcome.central === 'failed')
    ) {
      setMessage(
        status,
        'הבדיקה נשמרה במכשיר, אך הסנכרון המרכזי נכשל. אפשר לנסות שוב בכפתור הסנכרון.',
        'error',
      );
    } else if (keyed === 0 && targets.length > 0) {
      setMessage(
        status,
        'לעמוד הזה עדיין לא הוגדרה בדיקה אוטומטית מלאה. העמוד נשאר פתוח, אך אין לפרסם גרסה סופית עד שהשאלה תתוקשב ותיבדק.',
        'error',
      );
    } else if (remaining > 0) {
      setMessage(
        status,
        'הבדיקה הושלמה. נותרו ' +
          String(remaining) +
          ' תשובות לתיקון. לכל תשובה מותר עד 3 ניסיונות.',
        'normal',
      );
    } else if (!persistenceEnabled) {
      setMessage(
        status,
        'הבדיקה הושלמה. זהו תרגול ללא הרשמה ולכן התוצאה אינה נשמרת. אפשר להירשם בכל שלב כדי להפעיל שמירה ודוחות.',
        'success',
      );
    } else {
      setMessage(
        status,
        'כל התשובות שניתן לבדוק הושלמו. אפשר להגיש את העמוד.',
        'success',
      );
    }

    return {
      keyed,
      unkeyed,
      remaining,
    };
  }

  function runCheck(): Promise<CheckSummary> {
    if (checkPromise) return checkPromise;
    checkButton.disabled = true;
    checkPromise = performCheck().finally(() => {
      checkPromise = null;
      checkButton.disabled = draft.submitted || submissionInFlight;
    });
    return checkPromise;
  }

  async function submitPage(): Promise<void> {
    if (submissionInFlight || draft.submitted) return;
    submissionInFlight = true;
    submitButton.disabled = true;
    checkButton.disabled = true;

    try {
      touch();
      snapshotAnswers();

      let score = 100;
      const attempts: Record<string, number> = {};
      const answers: Record<string, string> = {};

      if (targets.length > 0) {
        const summary = await runCheck();
        if (summary.keyed === 0) return;

        answerKey = await loadAnswerKey(pageNumber);
        const keyedEntries = Object.keys(answerKey)
          .map((qid) => draft.questions[qid])
          .filter(
            (progress): progress is QuestionProgress =>
              Boolean(progress),
          );

        if (
          keyedEntries.some(
            (progress) =>
              !progress.correct && !progress.locked,
          )
        ) {
          setMessage(
            status,
            'עדיין יש תשובות שניתן לתקן. לאחר 3 ניסיונות התשובה תינעל.',
            'error',
          );
          return;
        }

        score = calculatePageScore(
          keyedEntries.map((progress) => ({
            attempts: progress.attempts,
            correct: progress.correct,
            locked: progress.locked,
          })),
          true,
        );

        for (const [qid, progress] of Object.entries(
          draft.questions,
        )) {
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
        submissionId: crypto.randomUUID(),
      };

      const resultOutcome = persistenceEnabled
        ? await savePageResult(latestResult)
        : noSaveOutcome();
      rememberOutcome('result', resultOutcome);

      draft.submitted = true;
      draft.score = score;
      draft.updatedAt = submittedAt;
      const draftOutcome = await persistDraft();
      showScore(score);

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

      const syncFailed = persistenceEnabled && [
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
      } else if (!persistenceEnabled) {
        setMessage(
          status,
          'קיבלת ציון לתרגול. מאחר שלא נרשמת, הציון והפעילות לא נשמרו ולא תועדו. הרשמה תפעיל שמירה ודוחות לפעילות שתבצע לאחר ההתחברות.',
          'success',
        );
        accountButton.textContent = 'הרשמה לשמירה ודוחות';
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
          'ההגשה נשמרה בחשבון המקומי הרשום; סנכרון מרכזי אינו פעיל.',
          'normal',
        );
      }
    } finally {
      submissionInFlight = false;
      submitButton.disabled = draft.submitted;
      checkButton.disabled = draft.submitted || checkPromise !== null;
      if (draft.submitted) submitButton.textContent = 'העמוד הוגש';
    }
  }

  checkButton.addEventListener('click', () => {
    void runCheck();
  });

  submitButton.addEventListener('click', () => {
    void submitPage();
  });

  retryButton.addEventListener('click', () => {
    void retrySynchronization();
  });

  const retryWhenOnline = (): void => {
    if (persistenceEnabled && !retryButton.hidden) void retrySynchronization();
  };
  window.addEventListener('online', retryWhenOnline);

  if (isAdminSession() && targets.length > 0) {
    const keyButton = elem('button', {
      class: 'btn btn--teacher',
      type: 'button',
      text: 'שמירת התשובות שמולאו כמפתח מורה',
      title:
        'מלאו בכל אזור את התשובה הנכונה ולחצו לשמירת המפתח',
    });

    keyButton.addEventListener('click', () => {
      const key: AnswerKey = {};

      for (const target of targets) {
        const qid = target.dataset.lmsQid;
        const answer = targetValue(target);

        if (qid && answer) {
          key[qid] = [answer];
        }
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
            'נשמר מפתח מורה עבור ' +
              String(count) +
              ' אזורי תשובה.',
            'success',
          );
        })
        .catch((error: unknown) => {
          setMessage(
            status,
            error instanceof Error
              ? error.message
              : 'שמירת המפתח נכשלה.',
            'error',
          );
        });
    });

    buttons.append(keyButton);
  }

  targets.forEach((target, index) => {
    const qid =
      'p' +
      String(pageNumber) +
      '-q' +
      String(index + 1);

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

      if (!progress.locked && !progress.correct) {
        const accepted = showImmediateCorrectFeedback(target, qid);
        if (!accepted) {
          target.dataset.lmsState = progress.answer
            ? 'filled'
            : 'empty';
        }
      }

      scheduleSave();

      void persistActivity({
        uid,
        pageNumber,
        type: 'answer_change',
        createdAt: Date.now(),
        metadata: {
          qid,
        },
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

    listeners.push({
      target,
      input: onInput,
      keydown: onKeydown,
    });
  });

  const statePromise = persistenceEnabled
    ? Promise.all([
        loadDraft(uid, pageNumber),
        loadAnswerKey(pageNumber),
        loadPageResult(uid, pageNumber),
      ])
    : Promise.all([
        Promise.resolve<PageDraft | null>(null),
        loadAnswerKey(pageNumber),
        Promise.resolve<PageResult | null>(null),
      ]);

  void statePromise.then(([storedDraft, storedKey, storedResult]) => {
    answerKey = storedKey;
    latestResult = storedResult;

    if (storedDraft) {
      draft = storedDraft;
    }

    let restoredCorrectAnswer = false;

    for (const target of targets) {
      const qid = target.dataset.lmsQid;

      if (!qid) continue;

      const progress = progressFor(qid);

      if (progress.answer) {
        setTargetValue(target, progress.answer);
      }

      if (
        !draft.submitted &&
        showImmediateCorrectFeedback(target, qid)
      ) {
        restoredCorrectAnswer = true;
      } else {
        updateTarget(target, progress);
      }
    }

    if (restoredCorrectAnswer) scheduleSave();

    if (draft.score !== undefined) {
      showScore(draft.score);
    }

    checkButton.disabled = draft.submitted;
    submitButton.disabled = draft.submitted;
    if (draft.submitted) submitButton.textContent = 'העמוד הוגש';

    const keyedCount = Object.keys(answerKey).length;

    if (draft.submitted) {
      setMessage(
        status,
        persistenceEnabled
          ? 'העמוד כבר הוגש. הציון והתקדמות הניסיונות נשמרו.'
          : 'העמוד הוגש בתרגול הנוכחי בלבד. ללא הרשמה אין שמירה לאחר יציאה או רענון.',
        'success',
      );
    } else if (targets.length === 0) {
      setMessage(
        status,
        persistenceEnabled
          ? 'זהו עמוד פעילות. בסיום לחצו על כפתור ההשלמה; הפעילות תישמר בחשבון.'
          : 'זהו עמוד פעילות. אפשר לבצע אותו ללא הרשמה; הפעילות לא תישמר.',
      );
    } else if (keyedCount > 0) {
      setMessage(
        status,
        'נמצאו ' +
          String(targets.length) +
          ' אזורי מענה. בדיקה אוטומטית זמינה ל־' +
          String(keyedCount) +
          ' תשובות.' +
          (persistenceEnabled ? ' השמירה פעילה.' : ' אין שמירה ללא הרשמה.'),
        'success',
      );
    } else {
      setMessage(
        status,
        'נמצאו ' +
          String(targets.length) +
          ' אזורי מענה, אך הבדיקה האוטומטית לעמוד הזה עדיין אינה שלמה.',
        'error',
      );
    }
  }).catch(() => {
    setMessage(
      status,
      persistenceEnabled
        ? 'טעינת ההתקדמות נכשלה. ההגשה מושבתת כדי למנוע דריסה של נתונים קיימים; רעננו את העמוד ונסו שוב.'
        : 'טעינת בדיקת התשובות נכשלה. רעננו את העמוד ונסו שוב.',
      'error',
    );
  });

  void persistActivity({
    uid,
    pageNumber,
    type: 'page_open',
    createdAt: Date.now(),
    metadata: {
      answerTargets: targets.length,
    },
  });

  const heartbeat = persistenceEnabled
    ? window.setInterval(() => {
        touch();
        scheduleSave();

        void persistActivity({
          uid,
          pageNumber,
          type: 'heartbeat',
          createdAt: Date.now(),
          metadata: {
            activeSeconds: draft.activeSeconds,
          },
        });
      }, LMS_CONFIG.activityHeartbeatSeconds * 1000)
    : undefined;

  return {
    panel,
    cleanup: () => {
      if (heartbeat !== undefined) window.clearInterval(heartbeat);

      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer);
      }

      touch();
      snapshotAnswers();

      if (persistenceEnabled) {
        void persistDraft();
        void persistActivity({
          uid,
          pageNumber,
          type: 'page_leave',
          createdAt: Date.now(),
          metadata: {
            activeSeconds: draft.activeSeconds,
          },
        });
      }

      for (const listener of listeners) {
        listener.target.removeEventListener(
          'input',
          listener.input,
        );

        listener.target.removeEventListener(
          'keydown',
          listener.keydown,
        );
      }

      window.removeEventListener('online', retryWhenOnline);
    },
  };
}
