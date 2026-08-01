import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from './config';
import {
  auth,
  db,
  firebaseConfigured,
  localLmsFallbackEnabled,
} from './firebase';
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

function requireAvailableBackend(): void {
  if (firebaseConfigured || localLmsFallbackEnabled) return;

  throw new Error(
    'מערכת ההרשמה המרכזית עדיין אינה מחוברת. לא נשמור חשבון תלמיד מקומי שאינו מופיע בדשבורד המורה.',
  );
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

  requireAvailableBackend();

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

  requireAvailableBackend();

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
