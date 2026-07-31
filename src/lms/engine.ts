import { elem } from '../lib/dom';
import { currentSession, isAdminSession } from './auth';
import { LMS_CONFIG } from './config';
import {
  loadAnswerKey,
  loadDraft,
  logActivity,
  saveAnswerKey,
  saveDraft,
  savePageResult,
} from './repository';
import { calculatePageScore } from './scoring';
import type {
  AnswerKey,
  PageDraft,
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

function normalizeAnswer(raw: string): string {
  let value = raw
    .trim()
    .replace(/[־–—]/g, '-')
    .replace(/,/g, '.')
    .replace(/\u00a0/g, ' ');

  const mixedHalf = value.match(/^(\d+)\s*1\/2$/);

  if (mixedHalf?.[1]) {
    value = String(Number(mixedHalf[1]) + 0.5);
  }

  value = value.replace(/(\d)½/g, (_match, digit: string) =>
    String(Number(digit) + 0.5),
  );

  return value
    .replace(/\s+/g, '')
    .toLocaleLowerCase('he');
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

function setMessage(
  node: HTMLElement,
  text: string,
  kind: 'normal' | 'success' | 'error' = 'normal',
): void {
  node.textContent = text;
  node.dataset.kind = kind;
}

export function canAccessPage(pageNumber: number): boolean {
  return (
    pageNumber <= LMS_CONFIG.guestFreePages ||
    currentSession() !== null
  );
}

export function renderAccessGate(
  outlet: HTMLElement,
  pageNumber: number,
): void {
  const card = elem(
    'section',
    {
      class: 'lms-gate no-print',
      role: 'region',
      'aria-label': 'נדרשת הרשמה',
    },
    elem('div', {
      class: 'lms-gate__icon',
      text: '🔐',
      'aria-hidden': 'true',
    }),
    elem('h1', {
      text: 'כדי להמשיך לעמוד ' + String(pageNumber) + ' יש להירשם',
    }),
    elem('p', {
      text:
        'עמוד 1 פתוח ללא הרשמה. לאחר קבלת הציון ההתקדמות נשמרת בחשבון התלמיד.',
    }),
  );

  const actions = elem('div', {
    class: 'lms-gate__actions',
  });

  const registerButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'הרשמה והמשך',
  });

  registerButton.addEventListener('click', () => {
    location.hash = '#/login';
  });

  const backButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'חזרה לעמוד הראשון',
  });

  backButton.addEventListener('click', () => {
    location.hash = '#/workbook/1';
  });

  actions.append(registerButton, backButton);
  card.append(actions);
  outlet.replaceChildren(card);
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
        ? 'תלמיד: ' + session.fullName
        : 'מצב אורח — עמוד ראשון בלבד',
    }),
  );

  const status = elem('div', {
    class: 'lms-panel__status',
    text: 'המערכת מכינה את אזורי המענה…',
  });

  const scoreHost = elem('div', {
    class: 'lms-panel__scorehost',
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

  const accountButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: session ? 'החשבון שלי' : 'הרשמה / התחברות',
  });

  accountButton.addEventListener('click', () => {
    location.hash = '#/login';
  });

  buttons.append(checkButton, submitButton, accountButton);

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
  let saveTimer: number | undefined;
  let lastActivityAt = Date.now();

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
      progress.correct || progress.locked
        ? 'false'
        : 'true';
  }

  function scheduleSave(): void {
    if (saveTimer !== undefined) {
      window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(() => {
      void saveDraft(draft);
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

  async function runCheck(): Promise<CheckSummary> {
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

      const normalized = normalizeAnswer(progress.answer);
      const correct = expected.some(
        (value) => normalizeAnswer(value) === normalized,
      );

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
    await saveDraft(draft);

    await logActivity({
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

    if (keyed === 0 && targets.length > 0) {
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
          ' תשובות לתיקון. לכל תשובה מותר עד 3 ניסיונות.',
        'normal',
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

  async function submitPage(): Promise<void> {
    touch();
    snapshotAnswers();

    if (targets.length === 0) {
      const now = Date.now();

      await savePageResult({
        uid,
        pageNumber,
        score: 100,
        startedAt: draft.startedAt,
        submittedAt: now,
        activeSeconds: draft.activeSeconds,
        attempts: {},
        answers: {},
      });

      draft.submitted = true;
      draft.score = 100;
      await saveDraft(draft);
      showScore(100);

      setMessage(
        status,
        'הפעילות סומנה כהושלמה.',
        'success',
      );

      return;
    }

    const summary = await runCheck();

    if (summary.keyed === 0) return;

    answerKey = await loadAnswerKey(pageNumber);

    const keyedEntries = Object.keys(answerKey)
      .map((qid) => draft.questions[qid])
      .filter(
        (progress): progress is QuestionProgress =>
          Boolean(progress),
      );

    const unfinished = keyedEntries.some(
      (progress) =>
        !progress.correct && !progress.locked,
    );

    if (unfinished) {
      setMessage(
        status,
        'עדיין יש תשובות שניתן לתקן. לאחר 3 ניסיונות התשובה תינעל.',
        'error',
      );
      return;
    }

    const score = calculatePageScore(
      keyedEntries.map((progress) => ({
        attempts: progress.attempts,
        correct: progress.correct,
        locked: progress.locked,
      })),
      true,
    );

    const attempts: Record<string, number> = {};
    const answers: Record<string, string> = {};

    for (const [qid, progress] of Object.entries(
      draft.questions,
    )) {
      attempts[qid] = progress.attempts;
      answers[qid] = progress.answer;
    }

    const submittedAt = Date.now();

    await savePageResult({
      uid,
      pageNumber,
      score,
      startedAt: draft.startedAt,
      submittedAt,
      activeSeconds: draft.activeSeconds,
      attempts,
      answers,
    });

    draft.submitted = true;
    draft.score = score;
    draft.updatedAt = submittedAt;
    await saveDraft(draft);

    showScore(score);

    await logActivity({
      uid,
      pageNumber,
      type: 'page_submit',
      createdAt: submittedAt,
      metadata: {
        score,
        activeSeconds: draft.activeSeconds,
      },
    });

    if (uid === 'guest' && pageNumber === 1) {
      setMessage(
        status,
        'העמוד נשמר במצב אורח. כדי לעבור לעמוד 2 יש להירשם, ואז הציון ישויך לחשבון.',
        'success',
      );

      accountButton.textContent = 'הרשמה ושמירת ההתקדמות';
    } else {
      setMessage(
        status,
        'העמוד הוגש ונשמר בהצלחה.',
        'success',
      );
    }
  }

  checkButton.addEventListener('click', () => {
    void runCheck();
  });

  submitButton.addEventListener('click', () => {
    void submitPage();
  });

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
    target.setAttribute(
      'aria-label',
      'תשובה ' + String(index + 1),
    );
    target.setAttribute('tabindex', '0');
    target.spellcheck = false;

    const onInput: EventListener = () => {
      touch();

      const progress = progressFor(qid);
      progress.answer = targetValue(target);
      progress.correct = false;

      if (!progress.locked) {
        target.dataset.lmsState = progress.answer
          ? 'filled'
          : 'empty';
      }

      scheduleSave();

      void logActivity({
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

  void Promise.all([
    loadDraft(uid, pageNumber),
    loadAnswerKey(pageNumber),
  ]).then(([storedDraft, storedKey]) => {
    answerKey = storedKey;

    if (storedDraft) {
      draft = storedDraft;
    }

    for (const target of targets) {
      const qid = target.dataset.lmsQid;

      if (!qid) continue;

      const progress = progressFor(qid);

      if (progress.answer) {
        setTargetValue(target, progress.answer);
      }

      updateTarget(target, progress);
    }

    if (draft.score !== undefined) {
      showScore(draft.score);
    }

    const keyedCount = Object.keys(answerKey).length;

    if (targets.length === 0) {
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
  });

  void logActivity({
    uid,
    pageNumber,
    type: 'page_open',
    createdAt: Date.now(),
    metadata: {
      answerTargets: targets.length,
    },
  });

  const heartbeat = window.setInterval(() => {
    touch();
    scheduleSave();

    void logActivity({
      uid,
      pageNumber,
      type: 'heartbeat',
      createdAt: Date.now(),
      metadata: {
        activeSeconds: draft.activeSeconds,
      },
    });
  }, LMS_CONFIG.activityHeartbeatSeconds * 1000);

  return {
    panel,
    cleanup: () => {
      window.clearInterval(heartbeat);

      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer);
      }

      touch();
      snapshotAnswers();
      void saveDraft(draft);

      void logActivity({
        uid,
        pageNumber,
        type: 'page_leave',
        createdAt: Date.now(),
        metadata: {
          activeSeconds: draft.activeSeconds,
        },
      });

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
    },
  };
}
