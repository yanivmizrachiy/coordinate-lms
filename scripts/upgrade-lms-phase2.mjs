import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  const absolutePath = join(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });

  const normalized =
    content.replace(/^\n/, '').replace(/\s+$/, '') + '\n';

  writeFileSync(absolutePath, normalized, 'utf8');
  console.log('WRITE', relativePath);
}

function replaceOnce(source, search, replacement, fileName) {
  if (source.includes(replacement)) return source;

  if (!source.includes(search)) {
    throw new Error(
      'Could not find patch target in ' + fileName + ':\n' + search,
    );
  }

  return source.replace(search, replacement);
}

/* ----------------------------------------------------------------------- */
/* Configuration                                                           */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/config.ts',
  String.raw`
const configuredAdminEmails = String(
  import.meta.env.VITE_ADMIN_EMAILS || 'yanivmiz77@gmail.com',
)
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS = new Set(configuredAdminEmails);

export const LMS_CONFIG = {
  minScore: 1,
  maxScore: 100,
  maxAttempts: 3,
  guestFreePages: 1,
  activityIdleSeconds: 120,
  activityHeartbeatSeconds: 30,
} as const;
`,
);

/* ----------------------------------------------------------------------- */
/* Data types                                                              */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/types.ts',
  String.raw`
export type StudentRole = 'student' | 'admin';

export interface StudentProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  className?: string;
  school?: string;
  role?: StudentRole;
  createdAt: number;
  lastSeenAt: number;
}

export interface LmsSession {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  role: StudentRole;
  createdAt: number;
}

export interface QuestionProgress {
  answer: string;
  attempts: number;
  correct: boolean;
  locked: boolean;
}

export interface PageDraft {
  uid: string;
  pageNumber: number;
  startedAt: number;
  updatedAt: number;
  activeSeconds: number;
  questions: Record<string, QuestionProgress>;
  submitted: boolean;
  score?: number;
}

export interface ActivityEvent {
  uid: string;
  pageNumber: number;
  type:
    | 'page_open'
    | 'answer_change'
    | 'answer_check'
    | 'page_submit'
    | 'page_leave'
    | 'heartbeat'
    | 'registration'
    | 'login';
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface PageResult {
  uid: string;
  pageNumber: number;
  score: number;
  startedAt: number;
  submittedAt: number;
  activeSeconds: number;
  attempts: Record<string, number>;
  answers: Record<string, string>;
}

export type AnswerKey = Record<string, string[]>;

export interface DashboardStudent {
  profile: StudentProfile;
  results: PageResult[];
}

export interface DashboardSnapshot {
  students: DashboardStudent[];
  generatedAt: number;
  source: 'firebase' | 'local';
}
`,
);

/* ----------------------------------------------------------------------- */
/* Default answer key                                                      */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/answerKey.ts',
  String.raw`
import type { AnswerKey } from './types';

/*
 * Page 1 is supplied so the public guest flow already has a working score.
 * The remaining pages can be keyed through teacher mode without changing
 * their printed wording or design.
 */
export const DEFAULT_ANSWER_KEYS: Record<number, AnswerKey> = {
  1: {
    'p1-q1': ['x', 'X'],
    'p1-q2': ['אנכי', 'אנכית'],
    'p1-q3': ['ראשית'],
    'p1-q4': ['צירים', 'הצירים'],
    'p1-q5': ['גדלים'],
    'p1-q6': ['y', 'Y'],
    'p1-q7': ['שמאלה', 'לשמאל'],
    'p1-q8': ['קטנים'],
    'p1-q9': ['0', 'אפס'],
    'p1-q10': ['מימין', 'ימינה'],
    'p1-q11': ['5', 'חמש'],
    'p1-q12': ['משמאל', 'שמאלה'],
    'p1-q13': ['3', 'שלוש'],
    'p1-q14': ['משמאל', 'שמאלה'],
    'p1-q15': ['5.5', '5,5', '5½', '5 1/2'],
    'p1-q16': ['2', 'שתיים'],
    'p1-q17': ['x', 'X'],
    'p1-q18': ['C', 'c'],
    'p1-q19': ['מימין', 'ימינה'],
    'p1-q20': ['4', 'ארבע'],
  },
};
`,
);

/* ----------------------------------------------------------------------- */
/* Authentication                                                         */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/auth.ts',
  String.raw`
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from './config';
import { auth, db, firebaseConfigured } from './firebase';
import type {
  LmsSession,
  StudentProfile,
  StudentRole,
} from './types';

const SESSION_KEY = 'coordinate_lms_session_v2';
const LOCAL_ACCOUNTS_KEY = 'coordinate_lms_accounts_v2';

interface LocalAccount {
  passwordHash: string;
  profile: StudentProfile;
}

interface RegistrationInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  className?: string;
  school?: string;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadLocalAccounts(): Record<string, LocalAccount> {
  return safeParse<Record<string, LocalAccount>>(
    localStorage.getItem(LOCAL_ACCOUNTS_KEY),
    {},
  );
}

function saveLocalAccounts(
  accounts: Record<string, LocalAccount>,
): void {
  localStorage.setItem(
    LOCAL_ACCOUNTS_KEY,
    JSON.stringify(accounts),
  );
}

async function hashPassword(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

function roleForEmail(email: string): StudentRole {
  return ADMIN_EMAILS.has(email.toLowerCase())
    ? 'admin'
    : 'student';
}

function toSession(profile: StudentProfile): LmsSession {
  return {
    uid: profile.uid,
    fullName: profile.fullName,
    username: profile.username,
    email: profile.email,
    role: profile.role || roleForEmail(profile.email),
    createdAt: profile.createdAt,
  };
}

function persistSession(session: LmsSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function currentSession(): LmsSession | null {
  return safeParse<LmsSession | null>(
    localStorage.getItem(SESSION_KEY),
    null,
  );
}

export function isAdminSession(): boolean {
  return currentSession()?.role === 'admin';
}

export function listLocalProfiles(): StudentProfile[] {
  return Object.values(loadLocalAccounts()).map(
    (account) => account.profile,
  );
}

export async function registerStudent(
  input: RegistrationInput,
): Promise<LmsSession> {
  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName || !username || !email || !password) {
    throw new Error('יש למלא שם, שם משתמש, אימייל וסיסמה.');
  }

  if (password.length < 6) {
    throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים.');
  }

  const createdAt = Date.now();
  const role = roleForEmail(email);

  if (firebaseConfigured && auth && db) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await updateProfile(credential.user, {
      displayName: fullName,
    });

    const profile: StudentProfile = {
      uid: credential.user.uid,
      fullName,
      username,
      email,
      className: input.className?.trim() || '',
      school: input.school?.trim() || '',
      role,
      createdAt,
      lastSeenAt: createdAt,
    };

    await setDoc(
      doc(db, 'students', credential.user.uid),
      profile,
      { merge: true },
    );

    const session = toSession(profile);
    persistSession(session);
    return session;
  }

  const accounts = loadLocalAccounts();

  if (accounts[email]) {
    throw new Error('כבר קיים משתמש עם כתובת האימייל הזאת.');
  }

  const uid = 'local-' + crypto.randomUUID();
  const profile: StudentProfile = {
    uid,
    fullName,
    username,
    email,
    className: input.className?.trim() || '',
    school: input.school?.trim() || '',
    role,
    createdAt,
    lastSeenAt: createdAt,
  };

  accounts[email] = {
    passwordHash: await hashPassword(password),
    profile,
  };

  saveLocalAccounts(accounts);

  const session = toSession(profile);
  persistSession(session);
  return session;
}

export async function loginStudent(
  emailInput: string,
  password: string,
): Promise<LmsSession> {
  const email = emailInput.trim().toLowerCase();

  if (!email || !password) {
    throw new Error('יש להזין אימייל וסיסמה.');
  }

  if (firebaseConfigured && auth && db) {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const profileSnapshot = await getDoc(
      doc(db, 'students', credential.user.uid),
    );

    const now = Date.now();

    const profile: StudentProfile = profileSnapshot.exists()
      ? (profileSnapshot.data() as StudentProfile)
      : {
          uid: credential.user.uid,
          fullName: credential.user.displayName || email,
          username: email.split('@')[0] || email,
          email,
          role: roleForEmail(email),
          createdAt: now,
          lastSeenAt: now,
        };

    profile.lastSeenAt = now;
    profile.role = roleForEmail(email);

    await setDoc(
      doc(db, 'students', credential.user.uid),
      profile,
      { merge: true },
    );

    const session = toSession(profile);
    persistSession(session);
    return session;
  }

  const accounts = loadLocalAccounts();
  const account = accounts[email];

  if (!account) {
    throw new Error('המשתמש לא נמצא בדפדפן הזה.');
  }

  const passwordHash = await hashPassword(password);

  if (passwordHash !== account.passwordHash) {
    throw new Error('הסיסמה שגויה.');
  }

  account.profile.lastSeenAt = Date.now();
  account.profile.role = roleForEmail(account.profile.email);
  saveLocalAccounts(accounts);

  const session = toSession(account.profile);
  persistSession(session);
  return session;
}

export async function logoutStudent(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth).catch(() => undefined);
  }

  persistSession(null);
}
`,
);

/* ----------------------------------------------------------------------- */
/* Repository: drafts, results, activity, answer keys                     */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/repository.ts',
  String.raw`
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import {
  currentSession,
  isAdminSession,
  listLocalProfiles,
} from './auth';
import { DEFAULT_ANSWER_KEYS } from './answerKey';
import { db } from './firebase';
import type {
  ActivityEvent,
  AnswerKey,
  DashboardSnapshot,
  DashboardStudent,
  PageDraft,
  PageResult,
} from './types';

const DRAFTS_KEY = 'coordinate_lms_drafts_v2';
const RESULTS_KEY = 'coordinate_lms_results_v2';
const ACTIVITY_KEY = 'coordinate_lms_activity_v2';
const ANSWER_KEYS_KEY = 'coordinate_lms_answer_keys_v2';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadMap<T>(key: string): Record<string, T> {
  return safeParse<Record<string, T>>(
    localStorage.getItem(key),
    {},
  );
}

function saveMap<T>(key: string, value: Record<string, T>): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function compoundKey(uid: string, pageNumber: number): string {
  return uid + ':' + String(pageNumber);
}

export async function loadDraft(
  uid: string,
  pageNumber: number,
): Promise<PageDraft | null> {
  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  const local = localDrafts[compoundKey(uid, pageNumber)];

  const session = currentSession();

  if (db && session && session.uid === uid && uid !== 'guest') {
    try {
      const snapshot = await getDoc(
        doc(
          db,
          'students',
          uid,
          'drafts',
          'page-' + String(pageNumber),
        ),
      );

      if (snapshot.exists()) {
        const remote = snapshot.data() as PageDraft;
        localDrafts[compoundKey(uid, pageNumber)] = remote;
        saveMap(DRAFTS_KEY, localDrafts);
        return remote;
      }
    } catch {
      return local || null;
    }
  }

  return local || null;
}

export async function saveDraft(draft: PageDraft): Promise<void> {
  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  localDrafts[compoundKey(draft.uid, draft.pageNumber)] = draft;
  saveMap(DRAFTS_KEY, localDrafts);

  const session = currentSession();

  if (
    db &&
    session &&
    session.uid === draft.uid &&
    draft.uid !== 'guest'
  ) {
    await setDoc(
      doc(
        db,
        'students',
        draft.uid,
        'drafts',
        'page-' + String(draft.pageNumber),
      ),
      draft,
      { merge: true },
    ).catch(() => undefined);
  }
}

export async function savePageResult(
  result: PageResult,
): Promise<void> {
  const localResults = loadMap<PageResult>(RESULTS_KEY);
  localResults[compoundKey(result.uid, result.pageNumber)] = result;
  saveMap(RESULTS_KEY, localResults);

  const session = currentSession();

  if (
    db &&
    session &&
    session.uid === result.uid &&
    result.uid !== 'guest'
  ) {
    await setDoc(
      doc(
        db,
        'students',
        result.uid,
        'results',
        'page-' + String(result.pageNumber),
      ),
      result,
      { merge: true },
    ).catch(() => undefined);
  }
}

export async function logActivity(
  event: ActivityEvent,
): Promise<void> {
  const events = safeParse<ActivityEvent[]>(
    localStorage.getItem(ACTIVITY_KEY),
    [],
  );

  events.push(event);

  if (events.length > 5000) {
    events.splice(0, events.length - 5000);
  }

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events));

  const session = currentSession();

  if (
    db &&
    session &&
    session.uid === event.uid &&
    event.uid !== 'guest'
  ) {
    await addDoc(
      collection(db, 'students', event.uid, 'activity'),
      event,
    ).catch(() => undefined);
  }
}

export async function loadAnswerKey(
  pageNumber: number,
): Promise<AnswerKey> {
  const defaults = DEFAULT_ANSWER_KEYS[pageNumber] || {};
  const customKeys = loadMap<AnswerKey>(ANSWER_KEYS_KEY);
  const local = customKeys[String(pageNumber)] || {};

  let remote: AnswerKey = {};

  if (db && currentSession()) {
    try {
      const snapshot = await getDoc(
        doc(db, 'answerKeys', 'page-' + String(pageNumber)),
      );

      if (snapshot.exists()) {
        const data = snapshot.data() as {
          answers?: AnswerKey;
        };

        remote = data.answers || {};
      }
    } catch {
      remote = {};
    }
  }

  return {
    ...defaults,
    ...local,
    ...remote,
  };
}

export async function saveAnswerKey(
  pageNumber: number,
  key: AnswerKey,
): Promise<void> {
  if (!isAdminSession()) {
    throw new Error('רק מנהל יכול לשמור מפתח תשובות.');
  }

  const customKeys = loadMap<AnswerKey>(ANSWER_KEYS_KEY);
  customKeys[String(pageNumber)] = key;
  saveMap(ANSWER_KEYS_KEY, customKeys);

  const session = currentSession();

  if (db && session) {
    await setDoc(
      doc(db, 'answerKeys', 'page-' + String(pageNumber)),
      {
        pageNumber,
        answers: key,
        updatedAt: Date.now(),
        updatedBy: session.uid,
      },
      { merge: true },
    );
  }
}

export async function claimGuestProgress(
  uid: string,
): Promise<void> {
  const drafts = loadMap<PageDraft>(DRAFTS_KEY);
  const results = loadMap<PageResult>(RESULTS_KEY);

  const guestDraftKey = compoundKey('guest', 1);
  const guestResultKey = compoundKey('guest', 1);

  const guestDraft = drafts[guestDraftKey];
  const guestResult = results[guestResultKey];

  if (guestDraft) {
    const claimedDraft: PageDraft = {
      ...guestDraft,
      uid,
      updatedAt: Date.now(),
    };

    drafts[compoundKey(uid, 1)] = claimedDraft;
    delete drafts[guestDraftKey];
    saveMap(DRAFTS_KEY, drafts);
    await saveDraft(claimedDraft);
  }

  if (guestResult) {
    const claimedResult: PageResult = {
      ...guestResult,
      uid,
    };

    results[compoundKey(uid, 1)] = claimedResult;
    delete results[guestResultKey];
    saveMap(RESULTS_KEY, results);
    await savePageResult(claimedResult);
  }
}

function localDashboard(): DashboardSnapshot {
  const profiles = listLocalProfiles();
  const localResults = Object.values(
    loadMap<PageResult>(RESULTS_KEY),
  );

  const students: DashboardStudent[] = profiles.map((profile) => ({
    profile,
    results: localResults
      .filter((result) => result.uid === profile.uid)
      .sort((a, b) => a.pageNumber - b.pageNumber),
  }));

  return {
    students,
    generatedAt: Date.now(),
    source: 'local',
  };
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  if (!db || !isAdminSession()) {
    return localDashboard();
  }

  try {
    const studentsSnapshot = await getDocs(
      collection(db, 'students'),
    );

    const students: DashboardStudent[] = [];

    for (const studentDocument of studentsSnapshot.docs) {
      const profile = studentDocument.data() as DashboardStudent['profile'];

      const resultsSnapshot = await getDocs(
        collection(
          db,
          'students',
          studentDocument.id,
          'results',
        ),
      );

      const results = resultsSnapshot.docs
        .map((resultDocument) => resultDocument.data() as PageResult)
        .sort((a, b) => a.pageNumber - b.pageNumber);

      students.push({
        profile,
        results,
      });
    }

    students.sort(
      (a, b) =>
        b.profile.lastSeenAt - a.profile.lastSeenAt,
    );

    return {
      students,
      generatedAt: Date.now(),
      source: 'firebase',
    };
  } catch {
    return localDashboard();
  }
}
`,
);

/* ----------------------------------------------------------------------- */
/* Interactive LMS layer                                                   */
/* ----------------------------------------------------------------------- */

write(
  'src/lms/engine.ts',
  String.raw`
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
`,
);

/* ----------------------------------------------------------------------- */
/* Login / registration view                                               */
/* ----------------------------------------------------------------------- */

write(
  'src/views/lmsLogin.ts',
  String.raw`
import { elem } from '../lib/dom';
import { navigate } from '../router';
import {
  currentSession,
  loginStudent,
  logoutStudent,
  registerStudent,
} from '../lms/auth';
import { firebaseConfigured } from '../lms/firebase';
import {
  claimGuestProgress,
  logActivity,
} from '../lms/repository';
import type { ViewContext } from './context';

export function lmsLogin({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('הרשמה והתחברות');

  const existingSession = currentSession();
  const shell = elem('div', {
    class: 'container lms-auth',
  });

  if (existingSession) {
    shell.append(
      elem(
        'section',
        { class: 'lms-auth__card' },
        elem('h1', {
          text: 'שלום ' + existingSession.fullName,
        }),
        elem('p', {
          text:
            'החשבון מחובר. כל תוצאה חדשה תישמר תחת המשתמש הזה.',
        }),
      ),
    );

    const actions = elem('div', {
      class: 'lms-auth__actions',
    });

    const continueButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'המשך לעמוד 2',
    });

    continueButton.addEventListener('click', () => {
      navigate('#/workbook/2');
    });

    const adminButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'דשבורד מורה',
    });

    adminButton.addEventListener('click', () => {
      navigate('#/admin');
    });

    const logoutButton = elem('button', {
      class: 'btn btn--ghost',
      type: 'button',
      text: 'התנתקות',
    });

    logoutButton.addEventListener('click', () => {
      void logoutStudent().then(() => {
        location.reload();
      });
    });

    actions.append(continueButton);

    if (existingSession.role === 'admin') {
      actions.append(adminButton);
    }

    actions.append(logoutButton);
    shell.append(actions);
    outlet.append(shell);
    return;
  }

  const title = elem('h1', {
    text: 'הרשמה להמשך התרגול',
  });

  const explanation = elem('p', {
    text:
      'עמוד 1 פתוח ללא הרשמה. לאחר ההרשמה הציון שכבר התקבל נשמר בחשבון.',
  });

  const modeNote = elem('div', {
    class: firebaseConfigured
      ? 'lms-mode lms-mode--online'
      : 'lms-mode lms-mode--local',
    text: firebaseConfigured
      ? 'שמירה מרכזית מחוברת ל־Firebase.'
      : 'Firebase עדיין לא הוגדר. כרגע השמירה היא מקומית בדפדפן.',
  });

  const form = elem('form', {
    class: 'lms-auth__form',
  }) as HTMLFormElement;

  const fullName = elem('input', {
    type: 'text',
    autocomplete: 'name',
    placeholder: 'שם מלא',
    required: 'true',
  }) as HTMLInputElement;

  const username = elem('input', {
    type: 'text',
    autocomplete: 'username',
    placeholder: 'שם משתמש',
    required: 'true',
  }) as HTMLInputElement;

  const email = elem('input', {
    type: 'email',
    autocomplete: 'email',
    placeholder: 'כתובת אימייל',
    required: 'true',
  }) as HTMLInputElement;

  const password = elem('input', {
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'סיסמה — לפחות 6 תווים',
    required: 'true',
  }) as HTMLInputElement;

  const className = elem('input', {
    type: 'text',
    placeholder: 'כיתה',
  }) as HTMLInputElement;

  const school = elem('input', {
    type: 'text',
    placeholder: 'בית ספר',
  }) as HTMLInputElement;

  const status = elem('div', {
    class: 'lms-auth__status',
    role: 'status',
  });

  let registrationMode = true;

  const submitButton = elem('button', {
    class: 'btn btn--gold',
    type: 'submit',
    text: 'הרשמה ושמירת הציון',
  });

  const switchButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'כבר נרשמתי — התחברות',
  });

  switchButton.addEventListener('click', () => {
    registrationMode = !registrationMode;

    fullName.hidden = !registrationMode;
    username.hidden = !registrationMode;
    className.hidden = !registrationMode;
    school.hidden = !registrationMode;

    password.autocomplete = registrationMode
      ? 'new-password'
      : 'current-password';

    submitButton.textContent = registrationMode
      ? 'הרשמה ושמירת הציון'
      : 'התחברות';

    switchButton.textContent = registrationMode
      ? 'כבר נרשמתי — התחברות'
      : 'משתמש חדש — הרשמה';

    status.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitButton.setAttribute('disabled', 'true');
    status.textContent = 'מתבצעת שמירה…';
    status.dataset.kind = 'normal';

    const action = registrationMode
      ? registerStudent({
          fullName: fullName.value,
          username: username.value,
          email: email.value,
          password: password.value,
          className: className.value,
          school: school.value,
        })
      : loginStudent(email.value, password.value);

    void action
      .then(async (session) => {
        await claimGuestProgress(session.uid);

        await logActivity({
          uid: session.uid,
          pageNumber: 1,
          type: registrationMode
            ? 'registration'
            : 'login',
          createdAt: Date.now(),
        });

        status.textContent =
          'החשבון נשמר. עוברים להמשך התרגול…';
        status.dataset.kind = 'success';

        window.setTimeout(() => {
          navigate('#/workbook/2');
        }, 400);
      })
      .catch((error: unknown) => {
        status.textContent =
          error instanceof Error
            ? error.message
            : 'הפעולה נכשלה.';
        status.dataset.kind = 'error';
      })
      .finally(() => {
        submitButton.removeAttribute('disabled');
      });
  });

  form.append(
    fullName,
    username,
    email,
    password,
    className,
    school,
    status,
    submitButton,
    switchButton,
  );

  const card = elem(
    'section',
    { class: 'lms-auth__card' },
    title,
    explanation,
    modeNote,
    form,
  );

  shell.append(card);
  outlet.append(shell);
}
`,
);

/* ----------------------------------------------------------------------- */
/* Teacher dashboard                                                       */
/* ----------------------------------------------------------------------- */

write(
  'src/views/lmsAdmin.ts',
  String.raw`
import { elem } from '../lib/dom';
import { currentSession } from '../lms/auth';
import { firebaseConfigured } from '../lms/firebase';
import { loadDashboard } from '../lms/repository';
import type {
  DashboardSnapshot,
  DashboardStudent,
} from '../lms/types';
import { navigate } from '../router';
import type { ViewContext } from './context';

function formatDate(value: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    String(minutes) +
    ':' +
    String(remainingSeconds).padStart(2, '0')
  );
}

function averageScore(student: DashboardStudent): number {
  if (student.results.length === 0) return 0;

  return Math.round(
    student.results.reduce(
      (sum, result) => sum + result.score,
      0,
    ) / student.results.length,
  );
}

function totalActiveSeconds(
  student: DashboardStudent,
): number {
  return student.results.reduce(
    (sum, result) => sum + result.activeSeconds,
    0,
  );
}

function exportCsv(snapshot: DashboardSnapshot): void {
  const rows = [
    [
      'שם מלא',
      'שם משתמש',
      'אימייל',
      'כיתה',
      'בית ספר',
      'כניסה אחרונה',
      'מספר עמודים',
      'ממוצע',
      'זמן פעיל בשניות',
      'ציונים',
    ],
  ];

  for (const student of snapshot.students) {
    rows.push([
      student.profile.fullName,
      student.profile.username,
      student.profile.email,
      student.profile.className || '',
      student.profile.school || '',
      formatDate(student.profile.lastSeenAt),
      String(student.results.length),
      String(averageScore(student)),
      String(totalActiveSeconds(student)),
      student.results
        .map(
          (result) =>
            'עמוד ' +
            String(result.pageNumber) +
            ': ' +
            String(result.score),
        )
        .join(' | '),
    ]);
  }

  const csv =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map(
            (cell) =>
              '"' + cell.replace(/"/g, '""') + '"',
          )
          .join(','),
      )
      .join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'coordinate-lms-students.csv';
  anchor.click();

  URL.revokeObjectURL(url);
}

export function lmsAdmin({
  outlet,
  setTitle,
}: ViewContext): void {
  setTitle('דשבורד מורה');

  const session = currentSession();
  const shell = elem('div', {
    class: 'container lms-admin',
  });

  if (!session || session.role !== 'admin') {
    const gate = elem(
      'section',
      { class: 'lms-gate' },
      elem('h1', {
        text: 'הגישה לדשבורד מיועדת למנהל',
      }),
      elem('p', {
        text:
          'יש להתחבר באמצעות כתובת האימייל שהוגדרה כמנהל המערכת.',
      }),
    );

    const loginButton = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'מעבר להתחברות',
    });

    loginButton.addEventListener('click', () => {
      navigate('#/login');
    });

    gate.append(loginButton);
    shell.append(gate);
    outlet.append(shell);
    return;
  }

  const header = elem('header', {
    class: 'lms-admin__header',
  });

  header.append(
    elem('div', {}, 
      elem('h1', { text: 'דשבורד מורה' }),
      elem('p', {
        text:
          'תלמידים, ציונים, עמודים וזמן עבודה פעיל.',
      }),
    ),
  );

  const controls = elem('div', {
    class: 'lms-admin__controls',
  });

  const refreshButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'רענון נתונים',
  });

  const exportButton = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'ייצוא CSV',
    disabled: 'true',
  }) as HTMLButtonElement;

  const workbookButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'פתיחת החוברת',
  });

  workbookButton.addEventListener('click', () => {
    navigate('#/workbook/1');
  });

  controls.append(
    refreshButton,
    exportButton,
    workbookButton,
  );

  header.append(controls);

  const connection = elem('div', {
    class: firebaseConfigured
      ? 'lms-mode lms-mode--online'
      : 'lms-mode lms-mode--local',
    text: firebaseConfigured
      ? 'מקור הנתונים המרכזי: Firebase'
      : 'Firebase אינו מוגדר — מוצגים נתונים מקומיים בלבד',
  });

  const content = elem('div', {
    class: 'lms-admin__content',
  });

  let currentSnapshot: DashboardSnapshot | null = null;

  async function renderDashboard(): Promise<void> {
    content.replaceChildren(
      elem('div', {
        class: 'lms-loading',
        text: 'טוען נתוני תלמידים…',
      }),
    );

    const snapshot = await loadDashboard();
    currentSnapshot = snapshot;
    exportButton.disabled = false;

    const resultCount = snapshot.students.reduce(
      (sum, student) => sum + student.results.length,
      0,
    );

    const summary = elem('div', {
      class: 'lms-summary',
    });

    summary.append(
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(snapshot.students.length),
        }),
        elem('span', { text: 'תלמידים' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text: String(resultCount),
        }),
        elem('span', { text: 'עמודים שהוגשו' }),
      ),
      elem(
        'div',
        { class: 'lms-summary__card' },
        elem('strong', {
          text:
            snapshot.source === 'firebase'
              ? 'מרכזי'
              : 'מקומי',
        }),
        elem('span', { text: 'מקור נתונים' }),
      ),
    );

    const tableWrap = elem('div', {
      class: 'lms-tablewrap',
    });

    const table = elem('table', {
      class: 'lms-table',
    });

    const head = elem('thead');
    const headRow = elem('tr');

    for (const label of [
      'שם',
      'כיתה',
      'פעילות אחרונה',
      'עמודים',
      'ממוצע',
      'זמן פעיל',
      'פירוט',
    ]) {
      headRow.append(elem('th', { text: label }));
    }

    head.append(headRow);
    table.append(head);

    const body = elem('tbody');

    if (snapshot.students.length === 0) {
      const emptyRow = elem('tr');
      emptyRow.append(
        elem('td', {
          colspan: '7',
          text: 'עדיין אין תלמידים רשומים.',
        }),
      );
      body.append(emptyRow);
    }

    for (const student of snapshot.students) {
      const row = elem('tr');

      const identity = elem('td');
      identity.append(
        elem('strong', {
          text: student.profile.fullName,
        }),
        elem('small', {
          text: student.profile.email,
        }),
      );

      const details = student.results
        .map(
          (result) =>
            'עמוד ' +
            String(result.pageNumber) +
            ': ' +
            String(result.score),
        )
        .join(', ');

      row.append(
        identity,
        elem('td', {
          text: student.profile.className || '—',
        }),
        elem('td', {
          text: formatDate(student.profile.lastSeenAt),
        }),
        elem('td', {
          text: String(student.results.length),
        }),
        elem('td', {
          text: String(averageScore(student)),
        }),
        elem('td', {
          text: formatDuration(
            totalActiveSeconds(student),
          ),
        }),
        elem('td', {
          class: 'lms-table__details',
          text: details || 'טרם הוגש עמוד',
        }),
      );

      body.append(row);
    }

    table.append(body);
    tableWrap.append(table);

    content.replaceChildren(
      summary,
      tableWrap,
      elem('p', {
        class: 'lms-admin__generated',
        text:
          'עודכן: ' +
          formatDate(snapshot.generatedAt),
      }),
    );
  }

  refreshButton.addEventListener('click', () => {
    void renderDashboard();
  });

  exportButton.addEventListener('click', () => {
    if (currentSnapshot) {
      exportCsv(currentSnapshot);
    }
  });

  shell.append(header, connection, content);
  outlet.append(shell);

  void renderDashboard();
}
`,
);

/* ----------------------------------------------------------------------- */
/* LMS design — outside the printed A4 sheet                              */
/* ----------------------------------------------------------------------- */

write(
  'src/styles/lms.css',
  String.raw`
.lms-panel,
.lms-auth__card,
.lms-gate,
.lms-admin__header,
.lms-admin__content {
  border: 1px solid rgba(20, 40, 85, 0.15);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 14px 36px rgba(20, 40, 85, 0.1);
}

.lms-panel {
  margin: 18px 0;
  padding: 18px;
  direction: rtl;
}

.lms-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.lms-panel__title {
  color: #16376a;
  font-size: 1.12rem;
  font-weight: 900;
}

.lms-panel__identity {
  color: #5b677d;
  font-size: 0.9rem;
}

.lms-panel__status {
  margin: 14px 0;
  padding: 11px 13px;
  border-radius: 11px;
  background: #eef4ff;
  color: #23395d;
  line-height: 1.5;
}

.lms-panel__status[data-kind="success"],
.lms-auth__status[data-kind="success"] {
  background: #e8f8ee;
  color: #176b38;
}

.lms-panel__status[data-kind="error"],
.lms-auth__status[data-kind="error"] {
  background: #fff0f0;
  color: #a41f2b;
}

.lms-panel__buttons,
.lms-auth__actions,
.lms-gate__actions,
.lms-admin__controls,
.lms-menu-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.lms-panel__buttons .btn,
.lms-auth__actions .btn,
.lms-gate__actions .btn,
.lms-admin__controls .btn,
.lms-menu-actions .btn {
  width: auto;
}

.btn--teacher {
  background: #6b3fa0;
  color: #fff;
}

.lms-score {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 14px 0;
}

.lms-score__circle {
  display: grid;
  place-items: center;
  width: 94px;
  height: 94px;
  border: 7px solid #c72637;
  border-radius: 50%;
  color: #c72637;
  background: #fff;
  font-size: 2.2rem;
  font-weight: 950;
}

.lms-score__label {
  font-size: 1.05rem;
  font-weight: 800;
  color: #30394b;
}

.sheet [data-lms-editable="true"] {
  cursor: text;
  outline: none;
  user-select: text;
  transition:
    background-color 120ms ease,
    box-shadow 120ms ease;
}

.sheet [data-lms-editable="true"]:focus {
  background: rgba(255, 245, 170, 0.5);
  box-shadow: 0 0 0 2px rgba(224, 172, 31, 0.35);
}

.sheet [data-lms-state="correct"] {
  background: rgba(200, 244, 214, 0.8);
  box-shadow: inset 0 -3px #25944a;
}

.sheet [data-lms-state="wrong"],
.sheet [data-lms-state="missing"] {
  background: rgba(255, 224, 224, 0.75);
  box-shadow: inset 0 -3px #cf3645;
}

.sheet [data-lms-state="locked"] {
  background: rgba(235, 235, 235, 0.9);
  box-shadow: inset 0 -3px #6f7783;
  cursor: not-allowed;
}

.sheet [data-lms-state="pending"] {
  background: rgba(230, 238, 255, 0.8);
  box-shadow: inset 0 -3px #557bb8;
}

.lms-auth,
.lms-admin {
  max-width: 1120px;
  margin: 24px auto;
}

.lms-auth__card,
.lms-gate {
  max-width: 620px;
  margin: 40px auto;
  padding: 28px;
}

.lms-auth__form {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.lms-auth__form input {
  width: 100%;
  min-height: 48px;
  border: 1px solid #bdc7d8;
  border-radius: 10px;
  padding: 10px 13px;
  font: inherit;
}

.lms-auth__status {
  min-height: 22px;
  padding: 8px;
  border-radius: 8px;
}

.lms-mode {
  margin: 14px 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.lms-mode--online {
  background: #e8f8ee;
  color: #176b38;
}

.lms-mode--local {
  background: #fff4da;
  color: #785400;
}

.lms-gate {
  text-align: center;
}

.lms-gate__icon {
  font-size: 3rem;
}

.lms-gate__actions {
  justify-content: center;
  margin-top: 20px;
}

.lms-admin__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px;
}

.lms-admin__content {
  margin-top: 16px;
  padding: 20px;
}

.lms-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.lms-summary__card {
  display: grid;
  gap: 4px;
  padding: 16px;
  border-radius: 13px;
  background: #eef4ff;
  text-align: center;
}

.lms-summary__card strong {
  color: #16376a;
  font-size: 1.8rem;
}

.lms-tablewrap {
  overflow-x: auto;
}

.lms-table {
  width: 100%;
  border-collapse: collapse;
}

.lms-table th,
.lms-table td {
  padding: 10px;
  border: 1px solid #d9e0eb;
  vertical-align: top;
  text-align: right;
}

.lms-table th {
  background: #eef4ff;
  color: #16376a;
}

.lms-table td small {
  display: block;
  color: #68758b;
}

.lms-table__details {
  min-width: 260px;
  font-size: 0.86rem;
}

.lms-menu-actions {
  justify-content: center;
  margin: 18px 0;
}

@media (max-width: 720px) {
  .lms-panel {
    padding: 13px;
  }

  .lms-score {
    flex-direction: column;
    text-align: center;
  }

  .lms-summary {
    grid-template-columns: 1fr;
  }

  .lms-panel__buttons .btn,
  .lms-auth__actions .btn,
  .lms-gate__actions .btn,
  .lms-admin__controls .btn,
  .lms-menu-actions .btn {
    width: 100%;
  }
}

@media print {
  .lms-panel,
  .lms-auth,
  .lms-admin,
  .lms-gate,
  [data-lms-editable="true"]::after {
    display: none !important;
  }

  .sheet [data-lms-editable="true"] {
    background: transparent !important;
    box-shadow: none !important;
  }
}
`,
);

/* ----------------------------------------------------------------------- */
/* Firestore protection                                                    */
/* ----------------------------------------------------------------------- */

write(
  'firestore.rules',
  String.raw`
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function owner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function admin() {
      return signedIn()
        && request.auth.token.email != null
        && request.auth.token.email
          == 'yanivmiz77@gmail.com';
    }

    match /students/{uid} {
      allow create: if owner(uid);
      allow read, update: if owner(uid) || admin();
      allow delete: if admin();

      match /drafts/{document=**} {
        allow read, write: if owner(uid) || admin();
      }

      match /results/{document=**} {
        allow read, write: if owner(uid) || admin();
      }

      match /activity/{document=**} {
        allow create: if owner(uid);
        allow read: if owner(uid) || admin();
        allow update, delete: if admin();
      }
    }

    match /answerKeys/{document=**} {
      allow read: if signedIn();
      allow write: if admin();
    }
  }
}
`,
);

write(
  'firestore.indexes.json',
  String.raw`
{
  "indexes": [],
  "fieldOverrides": []
}
`,
);

write(
  'firebase.json',
  String.raw`
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
`,
);

/* ----------------------------------------------------------------------- */
/* Firebase setup documentation                                            */
/* ----------------------------------------------------------------------- */

write(
  'FIREBASE_SETUP.md',
  String.raw`
# חיבור Firebase ל־Coordinate LMS

האפליקציה עובדת גם ללא Firebase, אבל במצב זה הנתונים נשמרים רק בדפדפן.

כדי לקבל דשבורד מרכזי מכל המכשירים:

1. יוצרים פרויקט Firebase.
2. מפעילים Authentication מסוג Email/Password.
3. יוצרים מסד Cloud Firestore.
4. מעתיקים את פרטי Web App לקובץ `.env.local`.
5. מגדירים את אותם משתנים גם ב־Vercel.
6. מריצים:

   npx firebase-tools deploy --only firestore:rules,firestore:indexes

משתני הסביבה:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_ADMIN_EMAILS

כתובת המנהל שהוגדרה כברירת מחדל:

- yanivmiz77@gmail.com

אין לשמור סיסמאות או service-account keys בתוך GitHub.
`,
);

write(
  '.env.example',
  String.raw`
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAILS=yanivmiz77@gmail.com
`,
);

/* ----------------------------------------------------------------------- */
/* Source audit                                                            */
/* ----------------------------------------------------------------------- */

write(
  'scripts/lms-audit.mjs',
  String.raw`
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pagesDirectory = join(
  root,
  'src',
  'data',
  'workbook',
  'pages',
);

const files = readdirSync(pagesDirectory)
  .filter((file) => file.endsWith('.ts'))
  .filter((file) => file !== 'index.ts')
  .sort();

const pages = files.map((file) => {
  const content = readFileSync(
    join(pagesDirectory, file),
    'utf8',
  );

  const count = (pattern) =>
    (content.match(pattern) || []).length;

  return {
    file,
    blank: count(/\$\{blank\(/g),
    wordBlank: count(/\$\{wordBlank\(/g),
    pair: count(/\$\{pair\(/g),
    calcBox: count(/\$\{calcBox\(/g),
    exercise: count(/\$\{exercise\(/g),
    exerciseGiven: count(/\$\{exerciseGiven\(/g),
    gameHost: count(/gameId:/g),
  };
});

const totals = pages.reduce(
  (result, page) => {
    for (const key of [
      'blank',
      'wordBlank',
      'pair',
      'calcBox',
      'exercise',
      'exerciseGiven',
      'gameHost',
    ]) {
      result[key] += page[key];
    }

    return result;
  },
  {
    blank: 0,
    wordBlank: 0,
    pair: 0,
    calcBox: 0,
    exercise: 0,
    exerciseGiven: 0,
    gameHost: 0,
  },
);

const report = {
  generatedAt: new Date().toISOString(),
  pageSourceFiles: files.length,
  totals,
  pages,
};

const reportsDirectory = join(root, 'reports');
mkdirSync(reportsDirectory, { recursive: true });

writeFileSync(
  join(reportsDirectory, 'lms-audit.json'),
  JSON.stringify(report, null, 2) + '\n',
  'utf8',
);

const markdown = [
  '# LMS Source Audit',
  '',
  '- Generated: ' + report.generatedAt,
  '- Page source files: ' + String(report.pageSourceFiles),
  '- Blank targets: ' + String(totals.blank),
  '- Word blank targets: ' + String(totals.wordBlank),
  '- Ordered-pair targets: ' + String(totals.pair),
  '- Calculation boxes: ' + String(totals.calcBox),
  '- Exercises: ' + String(totals.exercise),
  '- Given exercises: ' + String(totals.exerciseGiven),
  '',
  'This audit counts authoring helpers in the source files.',
  'It does not change the printable workbook.',
  '',
].join('\n');

writeFileSync(
  join(reportsDirectory, 'lms-audit.md'),
  markdown,
  'utf8',
);

console.log(JSON.stringify(report.totals, null, 2));
`,
);

/* ----------------------------------------------------------------------- */
/* Tests                                                                   */
/* ----------------------------------------------------------------------- */

write(
  'tests/lmsScoring.test.ts',
  String.raw`
import { describe, expect, it } from 'vitest';
import { calculatePageScore } from '../src/lms/scoring';

describe('LMS score 1-100', () => {
  it('returns 100 for all first-attempt correct answers', () => {
    expect(
      calculatePageScore([
        { attempts: 1, correct: true },
        { attempts: 1, correct: true },
      ]),
    ).toBe(100);
  });

  it('reduces credit after additional attempts', () => {
    expect(
      calculatePageScore([
        { attempts: 2, correct: true },
      ]),
    ).toBe(75);

    expect(
      calculatePageScore([
        { attempts: 3, correct: true },
      ]),
    ).toBe(50);
  });

  it('never returns less than 1 for a submitted page', () => {
    expect(
      calculatePageScore([
        { attempts: 3, correct: false, locked: true },
      ]),
    ).toBe(1);
  });

  it('returns 0 before submission', () => {
    expect(
      calculatePageScore(
        [{ attempts: 1, correct: true }],
        false,
      ),
    ).toBe(0);
  });
});
`,
);

/* ----------------------------------------------------------------------- */
/* Patch router                                                            */
/* ----------------------------------------------------------------------- */

let router = read('src/router.ts');

router = replaceOnce(
  router,
  "name: 'home' | 'menu' | 'page' | 'book' | 'print';",
  "name: 'home' | 'menu' | 'page' | 'book' | 'print' | 'login' | 'admin';",
  'src/router.ts',
);

router = replaceOnce(
  router,
  "  if (head === 'menu') return { name: 'menu', params: {} };",
  [
    "  if (head === 'menu') return { name: 'menu', params: {} };",
    "  if (head === 'login') return { name: 'login', params: {} };",
    "  if (head === 'admin') return { name: 'admin', params: {} };",
  ].join('\n'),
  'src/router.ts',
);

write('src/router.ts', router);

/* ----------------------------------------------------------------------- */
/* Patch main                                                              */
/* ----------------------------------------------------------------------- */

let main = read('src/main.ts');

main = replaceOnce(
  main,
  "import './styles/grayscale.css';",
  [
    "import './styles/grayscale.css';",
    "import './styles/lms.css';",
  ].join('\n'),
  'src/main.ts',
);

main = replaceOnce(
  main,
  "import { ensureFreshBuild } from './lib/freshBuild';",
  [
    "import { ensureFreshBuild } from './lib/freshBuild';",
    "import { lmsLogin } from './views/lmsLogin';",
    "import { lmsAdmin } from './views/lmsAdmin';",
  ].join('\n'),
  'src/main.ts',
);

main = replaceOnce(
  main,
  "    case 'print': return book;",
  [
    "    case 'print': return book;",
    "    case 'login': return lmsLogin;",
    "    case 'admin': return lmsAdmin;",
  ].join('\n'),
  'src/main.ts',
);

write('src/main.ts', main);

/* ----------------------------------------------------------------------- */
/* Patch page viewer                                                       */
/* ----------------------------------------------------------------------- */

let pageViewer = read('src/views/pageViewer.ts');

pageViewer = replaceOnce(
  pageViewer,
  "import { goToContents } from './tocSheet';",
  [
    "import { goToContents } from './tocSheet';",
    "import {",
    "  attachLmsToPage,",
    "  canAccessPage,",
    "  renderAccessGate,",
    "} from '../lms/engine';",
  ].join('\n'),
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  "    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);\n    lastPage.set(page);",
  [
    "    setTitle(`עמוד ${page}${topic ? ' · ' + topic.title : ''}`);",
    "    if (!canAccessPage(page)) {",
    "      renderAccessGate(outlet, page);",
    "      return;",
    "    }",
    "    lastPage.set(page);",
  ].join('\n'),
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  "    let cleanup: (() => void) | undefined;",
  "    let gameCleanup: (() => void) | undefined;",
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  "        if (host && g) cleanup = g.mount(host);",
  "        if (host && g) gameCleanup = g.mount(host);",
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  [
    "    } else {",
    "      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));",
    "    }",
    "",
    "    /* The bottom row:",
  ].join('\n'),
  [
    "    } else {",
    "      sheetWrap.append(elem('div', { class: 'empty-note', text: 'העמוד לא נמצא.' }));",
    "    }",
    "",
    "    const lms = data",
    "      ? attachLmsToPage(sheetWrap, page)",
    "      : undefined;",
    "",
    "    /* The bottom row:",
  ].join('\n'),
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  "    viewer.append(readerBar(page), sheetWrap, nav);",
  [
    "    viewer.append(readerBar(page), sheetWrap);",
    "    if (lms) viewer.append(lms.panel);",
    "    viewer.append(nav);",
  ].join('\n'),
  'src/views/pageViewer.ts',
);

pageViewer = replaceOnce(
  pageViewer,
  "      cleanup?.();",
  [
    "      gameCleanup?.();",
    "      lms?.cleanup();",
  ].join('\n'),
  'src/views/pageViewer.ts',
);

write('src/views/pageViewer.ts', pageViewer);

/* ----------------------------------------------------------------------- */
/* Patch menu                                                              */
/* ----------------------------------------------------------------------- */

let menu = read('src/views/menu.ts');

menu = replaceOnce(
  menu,
  "  c.append(actions);\n\n  /* ---- paging: jump straight to any page ---- */",
  [
    "  c.append(actions);",
    "",
    "  const lmsActions = elem('div', { class: 'lms-menu-actions no-print' });",
    "  const practiceButton = elem('button', {",
    "    class: 'btn btn--gold',",
    "    type: 'button',",
    "    text: '✍️ התחלת תרגול מתוקשב',",
    "  });",
    "  practiceButton.addEventListener('click', () => navigate('#/workbook/1'));",
    "",
    "  const accountButton = elem('button', {",
    "    class: 'btn btn--ghost',",
    "    type: 'button',",
    "    text: '👤 הרשמה, התחברות וניהול',",
    "  });",
    "  accountButton.addEventListener('click', () => navigate('#/login'));",
    "",
    "  lmsActions.append(practiceButton, accountButton);",
    "  c.append(lmsActions);",
    "",
    "  /* ---- paging: jump straight to any page ---- */",
  ].join('\n'),
  'src/views/menu.ts',
);

write('src/views/menu.ts', menu);

/* ----------------------------------------------------------------------- */
/* Package scripts and description                                         */
/* ----------------------------------------------------------------------- */

const packagePath = join(root, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

packageJson.description =
  'מערכת צירים — הרביע הראשון: 77 עמודים בעיצוב הדפסה מקורי עם תרגול מתוקשב, ציונים, תלמידים ודשבורד מורה.';

packageJson.scripts['lms:audit'] =
  'node scripts/lms-audit.mjs';

write(
  'package.json',
  JSON.stringify(packageJson, null, 2),
);

/* ----------------------------------------------------------------------- */
/* Migration record                                                        */
/* ----------------------------------------------------------------------- */

const statusPath = 'MIGRATION_STATUS.md';
const previousStatus = existsSync(join(root, statusPath))
  ? read(statusPath)
  : '# Coordinate LMS — Migration Status\n';

write(
  statusPath,
  previousStatus +
    String.raw`

## LMS Phase 2

- Added a non-destructive interactive layer over the exact printable HTML.
- Added editable answer targets while retaining the existing worksheet design.
- Added three attempts per keyed answer.
- Added page scores from 1 to 100.
- Added a working guest score flow on page 1.
- Added registration gate from page 2.
- Added Firebase-ready authentication and Firestore persistence.
- Added local fallback when Firebase is not configured.
- Added teacher answer-key mode.
- Added activity-time tracking.
- Added teacher dashboard and CSV export.
- Added Firestore security rules.
- Added scoring tests and an LMS source audit.
`,
);

console.log('LMS Phase 2 source generation completed.');
