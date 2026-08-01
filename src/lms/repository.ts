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
import { implicitAnswerKey } from './implicitAnswers';
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
  const implicit = implicitAnswerKey(pageNumber);
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
    ...implicit,
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
  const localDrafts = Object.values(
    loadMap<PageDraft>(DRAFTS_KEY),
  );
  const localActivity = safeParse<ActivityEvent[]>(
    localStorage.getItem(ACTIVITY_KEY),
    [],
  );

  const students: DashboardStudent[] = profiles.map((profile) => ({
    profile,
    results: localResults
      .filter((result) => result.uid === profile.uid)
      .sort((a, b) => a.pageNumber - b.pageNumber),
    drafts: localDrafts
      .filter((draft) => draft.uid === profile.uid)
      .sort((a, b) => a.pageNumber - b.pageNumber),
    activity: localActivity
      .filter((event) => event.uid === profile.uid)
      .sort((a, b) => b.createdAt - a.createdAt),
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

      const [resultsSnapshot, draftsSnapshot, activitySnapshot] =
        await Promise.all([
          getDocs(
            collection(
              db,
              'students',
              studentDocument.id,
              'results',
            ),
          ),
          getDocs(
            collection(
              db,
              'students',
              studentDocument.id,
              'drafts',
            ),
          ),
          getDocs(
            collection(
              db,
              'students',
              studentDocument.id,
              'activity',
            ),
          ),
        ]);

      const results = resultsSnapshot.docs
        .map((document) => document.data() as PageResult)
        .sort((a, b) => a.pageNumber - b.pageNumber);

      const drafts = draftsSnapshot.docs
        .map((document) => document.data() as PageDraft)
        .sort((a, b) => a.pageNumber - b.pageNumber);

      const activity = activitySnapshot.docs
        .map((document) => document.data() as ActivityEvent)
        .sort((a, b) => b.createdAt - a.createdAt);

      students.push({
        profile,
        results,
        drafts,
        activity,
      });
    }

    students.sort((a, b) => {
      const aLatest = a.activity[0]?.createdAt || a.profile.lastSeenAt;
      const bLatest = b.activity[0]?.createdAt || b.profile.lastSeenAt;
      return bLatest - aLatest;
    });

    return {
      students,
      generatedAt: Date.now(),
      source: 'firebase',
    };
  } catch {
    return localDashboard();
  }
}

export async function loadUserResults(
  uid: string,
): Promise<PageResult[]> {
  const localResults = Object.values(
    loadMap<PageResult>(RESULTS_KEY),
  ).filter((result) => result.uid === uid);

  if (!db || uid === 'guest') {
    return localResults.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }

  try {
    const snapshot = await getDocs(
      collection(db, 'students', uid, 'results'),
    );

    const merged = new Map<number, PageResult>();

    for (const result of localResults) {
      merged.set(result.pageNumber, result);
    }

    for (const document of snapshot.docs) {
      const result = document.data() as PageResult;
      merged.set(result.pageNumber, result);
    }

    return [...merged.values()].sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  } catch {
    return localResults.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }
}

export async function loadUserDrafts(
  uid: string,
): Promise<PageDraft[]> {
  const localDrafts = Object.values(
    loadMap<PageDraft>(DRAFTS_KEY),
  ).filter((draft) => draft.uid === uid);

  if (!db || uid === 'guest') {
    return localDrafts.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }

  try {
    const snapshot = await getDocs(
      collection(db, 'students', uid, 'drafts'),
    );

    const merged = new Map<number, PageDraft>();

    for (const draft of localDrafts) {
      merged.set(draft.pageNumber, draft);
    }

    for (const document of snapshot.docs) {
      const draft = document.data() as PageDraft;
      merged.set(draft.pageNumber, draft);
    }

    return [...merged.values()].sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  } catch {
    return localDrafts.sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );
  }
}
