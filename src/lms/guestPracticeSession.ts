export interface GuestPracticeSession {
  id: string | null;
  day: string;
  startedAt: number;
}

const SESSION_KEY = 'coordinate_lms_guest_practice_session_v1';
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

export function beginGuestPracticeSession(): GuestPracticeSession {
  const startedAt = Date.now();
  const session: GuestPracticeSession = {
    id: newId(),
    day: localDay(startedAt),
    startedAt,
  };
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

export function currentGuestPracticeSession(): GuestPracticeSession {
  const today = localDay();
  if (memorySession?.day === today) return memorySession;

  /* Node/unit-test environments do not have sessionStorage. Keep legacy test
     fixtures usable there; browser sessions always receive a real id. */
  if (typeof sessionStorage === 'undefined') {
    memorySession = { id: null, day: today, startedAt: 0 };
    return memorySession;
  }

  try {
    const stored = parseStoredSession(sessionStorage.getItem(SESSION_KEY), today);
    if (stored) {
      memorySession = stored;
      return stored;
    }
  } catch {
    // Fall through to a fresh browser session.
  }

  return beginGuestPracticeSession();
}
