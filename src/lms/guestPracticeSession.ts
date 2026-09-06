export interface GuestPracticeSession {
  id: string | null;
  day: string;
  startedAt: number;
}

const SESSION_KEY = 'coordinate_lms_guest_practice_session_v1';
const DRAFTS_KEY = 'coordinate_lms_drafts_v2';
let memorySession: GuestPracticeSession | null = null;

function localDay(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return [year, month, day].join('-');
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return [Date.now(), Math.random().toString(36).slice(2)].join('-');
}

function parseStoredSession(raw: string | null, today: string): GuestPracticeSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<GuestPracticeSession>;
    if (
      typeof value.id === 'string' &&
      value.id.length > 0 &&
      value.day === today &&
      typeof value.startedAt === 'number' &&
      Number.isFinite(value.startedAt)
    ) {
      return { id: value.id, day: value.day, startedAt: value.startedAt };
    }
  } catch {
    // A malformed session marker must never resurrect an old guest draft.
  }
  return null;
}

function clearStoredGuestDrafts(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return;
    const drafts = JSON.parse(raw) as Record<string, { uid?: unknown }>;
    let changed = false;
    for (const [key, value] of Object.entries(drafts)) {
      if (key.startsWith('guest:') || value?.uid === 'guest') {
        delete drafts[key];
        changed = true;
      }
    }
    if (changed) localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    /* An unreadable draft map is already unusable by the LMS. Leave it alone;
       repository parsing will fail closed instead of risking registered data. */
  }
}

function storeBrowserSession(session: GuestPracticeSession): GuestPracticeSession {
  memorySession = session;
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // The in-memory marker still isolates this page session.
    }
  }
  return session;
}

export function beginGuestPracticeSession(): GuestPracticeSession {
  /* This action means "a new unregistered learner starts now". Old guest
     drafts have no account owner and must never cross that boundary. Remove
     only guest records; registered learners' local drafts remain untouched.
     Reloading an existing guest session does NOT call this function, so normal
     refresh continuity and attempt history are preserved.

     The explicit start time is also a write barrier for an untagged draft that
     still belongs to the previous practice view. If that old view finishes an
     async save after this new learner starts, repository.ts rejects it because
     its startedAt predates this boundary. Once a draft is stamped, the session
     id is the stronger identity check. */
  clearStoredGuestDrafts();

  const startedAt = Date.now();
  return storeBrowserSession({
    id: newId(),
    day: localDay(startedAt),
    startedAt,
  });
}

function beginDirectGuestPracticeSession(): GuestPracticeSession {
  /* A learner may enter a numbered practice URL directly instead of pressing
     the welcome button. In that path the LMS can create its first in-memory
     draft just before repository access creates the session marker, so there
     is no safe earlier timestamp boundary to impose. Clear historical guest
     drafts, accept that first untagged draft, then let the session id become
     authoritative on its first stored copy. */
  clearStoredGuestDrafts();
  return storeBrowserSession({
    id: newId(),
    day: localDay(),
    startedAt: 0,
  });
}

export function currentGuestPracticeSession(): GuestPracticeSession {
  const today = localDay();

  /* Node/unit-test environments do not have sessionStorage. Keep legacy test
     fixtures usable there; browser sessions always receive a real id. */
  if (typeof sessionStorage === 'undefined') {
    if (memorySession?.day === today) return memorySession;
    memorySession = { id: null, day: today, startedAt: 0 };
    return memorySession;
  }

  /* sessionStorage is the browser-session authority. Read it on every call
     instead of trusting a module-local cache: code-split chunks may retain
     separate module memory, while the storage marker is shared by the page.
     This prevents an old chunk from re-attaching a previous learner's draft
     after the welcome screen deliberately starts a fresh guest session. */
  try {
    const stored = parseStoredSession(sessionStorage.getItem(SESSION_KEY), today);
    if (stored) {
      memorySession = stored;
      return stored;
    }
    return beginDirectGuestPracticeSession();
  } catch {
    // Storage can be blocked. Fall back to this module instance's memory only.
    if (memorySession?.day === today) return memorySession;
    memorySession = { id: newId(), day: today, startedAt: 0 };
    return memorySession;
  }
}
