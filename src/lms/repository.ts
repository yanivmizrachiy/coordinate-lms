import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { TOTAL_PAGES } from '../data/workbook';
import {
  currentSession,
  isAdminSession,
  listLocalProfiles,
} from './auth';
import { canonicalAnswerKeyForCurrentPage } from './currentAnswerKey';
import { db } from './firebase';
import { implicitAnswerKey } from './implicitAnswers';
import type {
  ActivityEvent,
  AnswerKey,
  DashboardSnapshot,
  DashboardStudent,
  PageDraft,
  PageResult,
  PersistenceOutcome,
  QuestionProgress,
  SyncErrorRecord,
} from './types';

const DRAFTS_KEY = 'coordinate_lms_drafts_v2';
const RESULTS_KEY = 'coordinate_lms_results_v2';
const ACTIVITY_KEY = 'coordinate_lms_activity_v2';
const ANSWER_KEYS_KEY = 'coordinate_lms_answer_keys_v2';
const SYNC_ERRORS_KEY = 'coordinate_lms_sync_errors_v2';
const LEGACY_GUEST_UID = 'guest';

const CENTRAL_SAVE_ERROR =
  'השמירה במכשיר הצליחה, אבל הסנכרון המרכזי נכשל. בדקו את החיבור ונסו שוב.';

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

function activeSessionOwns(uid: string): boolean {
  const session = currentSession();
  return Boolean(session && session.uid === uid && uid !== LEGACY_GUEST_UID);
}

function noSaveOutcome(): PersistenceOutcome {
  return {
    localSaved: false,
    central: 'not-required',
  };
}

function purgeLegacyGuestData(): void {
  const drafts = loadMap<PageDraft>(DRAFTS_KEY);
  const results = loadMap<PageResult>(RESULTS_KEY);
  const errors = loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY);

  let draftsChanged = false;
  for (const key of Object.keys(drafts)) {
    if (key.startsWith(LEGACY_GUEST_UID + ':')) {
      delete drafts[key];
      draftsChanged = true;
    }
  }
  if (draftsChanged) saveMap(DRAFTS_KEY, drafts);

  let resultsChanged = false;
  for (const key of Object.keys(results)) {
    if (key.startsWith(LEGACY_GUEST_UID + ':')) {
      delete results[key];
      resultsChanged = true;
    }
  }
  if (resultsChanged) saveMap(RESULTS_KEY, results);

  let errorsChanged = false;
  for (const [key, error] of Object.entries(errors)) {
    if (error.uid === LEGACY_GUEST_UID || key.startsWith(LEGACY_GUEST_UID + ':')) {
      delete errors[key];
      errorsChanged = true;
    }
  }
  if (errorsChanged) saveMap(SYNC_ERRORS_KEY, errors);

  const activity = safeParse<ActivityEvent[]>(
    localStorage.getItem(ACTIVITY_KEY),
    [],
  );
  const registeredOnly = activity.filter(
    (event) => event.uid !== LEGACY_GUEST_UID,
  );
  if (registeredOnly.length !== activity.length) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(registeredOnly));
  }
}

if (typeof localStorage !== 'undefined') {
  purgeLegacyGuestData();
}

function maxAttemptCount(
  questions: Record<string, QuestionProgress> | Record<string, number>,
): number {
  return Math.max(
    0,
    ...Object.values(questions).map((value) =>
      typeof value === 'number' ? value : value.attempts,
    ),
  );
}

function assertAttemptCount(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 3) {
    throw new Error('מספר הניסיונות חייב להיות מספר שלם בין 0 ל־3.');
  }
}

function assertPageNumber(pageNumber: number): void {
  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > TOTAL_PAGES
  ) {
    throw new Error('מספר עמוד לא תקין.');
  }
}

function validateDraft(draft: PageDraft): PageDraft {
  assertPageNumber(draft.pageNumber);
  for (const progress of Object.values(draft.questions)) {
    assertAttemptCount(progress.attempts);
  }
  return {
    ...draft,
    maxAttemptCount: maxAttemptCount(draft.questions),
  };
}

function validateResult(result: PageResult): PageResult {
  assertPageNumber(result.pageNumber);
  if (!Number.isInteger(result.score) || result.score < 1 || result.score > 100) {
    throw new Error('הציון חייב להיות מספר שלם בין 1 ל־100.');
  }
  for (const attempts of Object.values(result.attempts)) {
    assertAttemptCount(attempts);
  }
  return {
    ...result,
    bestScore: result.bestScore ?? result.score,
    latestScore: result.score,
    maxAttemptCount: maxAttemptCount(result.attempts),
    submissionId:
      result.submissionId ||
      [result.uid, result.pageNumber, result.startedAt, result.submittedAt].join(':'),
  };
}

function mergeQuestionProgress(
  older: QuestionProgress | undefined,
  newer: QuestionProgress | undefined,
): QuestionProgress | undefined {
  if (!older) return newer;
  if (!newer) return older;
  const newest = newer.attempts >= older.attempts ? newer : older;
  return {
    ...newest,
    attempts: Math.max(older.attempts, newer.attempts),
    correct: older.correct || newer.correct,
    locked: older.locked || newer.locked,
  };
}

export function mergePageDrafts(
  existing: PageDraft | null | undefined,
  incoming: PageDraft,
): PageDraft {
  const validated = validateDraft(incoming);
  if (!existing) return validated;
  const newest = validated.updatedAt >= existing.updatedAt ? validated : existing;
  const questions: Record<string, QuestionProgress> = {};
  for (const qid of new Set([
    ...Object.keys(existing.questions),
    ...Object.keys(validated.questions),
  ])) {
    const merged = mergeQuestionProgress(
      existing.questions[qid],
      validated.questions[qid],
    );
    if (merged) questions[qid] = merged;
  }
  return validateDraft({
    ...newest,
    startedAt: Math.min(existing.startedAt, validated.startedAt),
    updatedAt: Math.max(existing.updatedAt, validated.updatedAt),
    activeSeconds: Math.max(existing.activeSeconds, validated.activeSeconds),
    questions,
    submitted: existing.submitted || validated.submitted,
    score:
      existing.score === undefined
        ? validated.score
        : validated.score === undefined
          ? existing.score
          : Math.max(existing.score, validated.score),
  });
}

export function mergePageResults(
  existing: PageResult | null | undefined,
  incoming: PageResult,
): PageResult {
  const validated = validateResult(incoming);
  if (!existing) return validated;
  const normalizedExisting = validateResult(existing);
  const latest =
    validated.submittedAt >= normalizedExisting.submittedAt
      ? validated
      : normalizedExisting;
  const bestScore = Math.max(
    normalizedExisting.bestScore ?? normalizedExisting.score,
    validated.bestScore ?? validated.score,
  );
  return {
    ...latest,
    score: latest.score,
    latestScore: latest.score,
    bestScore,
    maxAttemptCount: maxAttemptCount(latest.attempts),
  };
}

function syncErrorKey(record: Pick<SyncErrorRecord, 'uid' | 'pageNumber' | 'operation'>): string {
  return [record.uid, record.pageNumber, record.operation].join(':');
}

function recordSyncError(record: SyncErrorRecord): void {
  if (record.uid === LEGACY_GUEST_UID) return;
  const errors = loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY);
  errors[syncErrorKey(record)] = record;
  saveMap(SYNC_ERRORS_KEY, errors);
}

function clearSyncError(
  uid: string,
  pageNumber: number,
  operation: SyncErrorRecord['operation'],
): void {
  if (uid === LEGACY_GUEST_UID) return;
  const errors = loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY);
  delete errors[syncErrorKey({ uid, pageNumber, operation })];
  saveMap(SYNC_ERRORS_KEY, errors);
}

export function loadSyncErrors(uid?: string): SyncErrorRecord[] {
  return Object.values(loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY))
    .filter((record) => record.uid !== LEGACY_GUEST_UID)
    .filter((record) => !uid || record.uid === uid)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function failedOutcome(
  uid: string,
  pageNumber: number,
  operation: SyncErrorRecord['operation'],
): PersistenceOutcome {
  recordSyncError({
    uid,
    pageNumber,
    operation,
    createdAt: Date.now(),
    message: CENTRAL_SAVE_ERROR,
  });
  return { localSaved: true, central: 'failed', error: CENTRAL_SAVE_ERROR };
}

function savedOutcome(
  uid: string,
  pageNumber: number,
  operation: SyncErrorRecord['operation'],
  central: PersistenceOutcome['central'],
): PersistenceOutcome {
  if (central === 'saved') clearSyncError(uid, pageNumber, operation);
  return { localSaved: true, central };
}

export async function loadDraft(
  uid: string,
  pageNumber: number,
): Promise<PageDraft | null> {
  if (!activeSessionOwns(uid)) return null;
  assertPageNumber(pageNumber);

  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  const local = localDrafts[compoundKey(uid, pageNumber)];
  const session = currentSession();

  if (db && session && session.uid === uid) {
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
        const merged = local
          ? mergePageDrafts(remote, local)
          : validateDraft(remote);
        localDrafts[compoundKey(uid, pageNumber)] = merged;
        saveMap(DRAFTS_KEY, localDrafts);
        return merged;
      }
    } catch {
      return local || null;
    }
  }

  return local || null;
}

export async function saveDraft(
  draft: PageDraft,
): Promise<PersistenceOutcome> {
  if (!activeSessionOwns(draft.uid)) return noSaveOutcome();

  const validated = validateDraft(draft);
  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  const key = compoundKey(validated.uid, validated.pageNumber);
  const mergedLocal = mergePageDrafts(localDrafts[key], validated);
  localDrafts[key] = mergedLocal;
  saveMap(DRAFTS_KEY, localDrafts);

  const session = currentSession();

  if (db && session && session.uid === draft.uid) {
    try {
      const reference = doc(
        db,
        'students',
        validated.uid,
        'drafts',
        'page-' + String(validated.pageNumber),
      );
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const remote = snapshot.exists()
          ? (snapshot.data() as PageDraft)
          : null;
        transaction.set(reference, mergePageDrafts(remote, mergedLocal));
      });
      return savedOutcome(validated.uid, validated.pageNumber, 'draft', 'saved');
    } catch {
      return failedOutcome(validated.uid, validated.pageNumber, 'draft');
    }
  }

  return savedOutcome(validated.uid, validated.pageNumber, 'draft', 'not-required');
}

export async function savePageResult(
  result: PageResult,
): Promise<PersistenceOutcome> {
  if (!activeSessionOwns(result.uid)) return noSaveOutcome();

  const validated = validateResult(result);
  const localResults = loadMap<PageResult>(RESULTS_KEY);
  const key = compoundKey(validated.uid, validated.pageNumber);
  const mergedLocal = mergePageResults(localResults[key], validated);
  localResults[key] = mergedLocal;
  saveMap(RESULTS_KEY, localResults);

  const session = currentSession();

  if (db && session && session.uid === result.uid) {
    try {
      const reference = doc(
        db,
        'students',
        validated.uid,
        'results',
        'page-' + String(validated.pageNumber),
      );
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const remote = snapshot.exists()
          ? (snapshot.data() as PageResult)
          : null;
        transaction.set(reference, mergePageResults(remote, mergedLocal));
      });
      return savedOutcome(validated.uid, validated.pageNumber, 'result', 'saved');
    } catch {
      return failedOutcome(validated.uid, validated.pageNumber, 'result');
    }
  }

  return savedOutcome(validated.uid, validated.pageNumber, 'result', 'not-required');
}

export async function logActivity(
  event: ActivityEvent,
): Promise<PersistenceOutcome> {
  if (!activeSessionOwns(event.uid)) return noSaveOutcome();

  assertPageNumber(event.pageNumber);
  const eventId =
    event.id ||
    [
      event.createdAt,
      event.type,
      event.pageNumber,
      crypto.randomUUID(),
    ].join('-');
  const eventWithId: ActivityEvent = {
    ...event,
    id: eventId,
  };
  const events = safeParse<ActivityEvent[]>(
    localStorage.getItem(ACTIVITY_KEY),
    [],
  );

  if (!events.some((item) => item.id === eventWithId.id)) {
    events.push(eventWithId);
  }

  if (events.length > 5000) {
    events.splice(0, events.length - 5000);
  }

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events));

  const session = currentSession();

  if (db && session && session.uid === event.uid) {
    try {
      await setDoc(
        doc(db, 'students', event.uid, 'activity', eventId),
        eventWithId,
      );
      return savedOutcome(event.uid, event.pageNumber, 'activity', 'saved');
    } catch {
      return failedOutcome(event.uid, event.pageNumber, 'activity');
    }
  }

  return savedOutcome(event.uid, event.pageNumber, 'activity', 'not-required');
}

export async function loadAnswerKey(
  pageNumber: number,
): Promise<AnswerKey> {
  assertPageNumber(pageNumber);
  const canonical = canonicalAnswerKeyForCurrentPage(pageNumber);
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
    ...canonical,
    ...implicit,
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
  assertPageNumber(pageNumber);

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

function localDashboard(): DashboardSnapshot {
  purgeLegacyGuestData();
  const profiles = listLocalProfiles().filter(
    (profile) => profile.role !== 'admin',
  );
  const localResults = Object.values(
    loadMap<PageResult>(RESULTS_KEY),
  ).filter((result) => result.uid !== LEGACY_GUEST_UID);
  const localDrafts = Object.values(
    loadMap<PageDraft>(DRAFTS_KEY),
  ).filter((draft) => draft.uid !== LEGACY_GUEST_UID);
  const localActivity = safeParse<ActivityEvent[]>(
    localStorage.getItem(ACTIVITY_KEY),
    [],
  ).filter((event) => event.uid !== LEGACY_GUEST_UID);
  const syncErrors = loadSyncErrors();

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
    syncErrors: syncErrors.filter((error) => error.uid === profile.uid),
  }));

  return {
    students,
    generatedAt: Date.now(),
    source: 'local',
    syncErrors,
  };
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  if (!db || !isAdminSession()) {
    return localDashboard();
  }
  const firestore = db;

  try {
    const studentsSnapshot = await getDocs(
      collection(firestore, 'students'),
    );

    const studentDocuments = studentsSnapshot.docs.filter(
      (studentDocument) => {
        const profile = studentDocument.data() as DashboardStudent['profile'];
        return profile.role !== 'admin' && studentDocument.id !== LEGACY_GUEST_UID;
      },
    );
    const students = await Promise.all(studentDocuments.map(async (studentDocument) => {
      const profile = studentDocument.data() as DashboardStudent['profile'];

      const [resultsSnapshot, draftsSnapshot, activitySnapshot] =
        await Promise.all([
          getDocs(
            collection(
              firestore,
              'students',
              studentDocument.id,
              'results',
            ),
          ),
          getDocs(
            collection(
              firestore,
              'students',
              studentDocument.id,
              'drafts',
            ),
          ),
          getDocs(
            collection(
              firestore,
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

      return {
        profile,
        results,
        drafts,
        activity,
        syncErrors: [],
      } satisfies DashboardStudent;
    }));

    students.sort((a, b) => {
      const aLatest = a.activity[0]?.createdAt || a.profile.lastSeenAt;
      const bLatest = b.activity[0]?.createdAt || b.profile.lastSeenAt;
      return bLatest - aLatest;
    });

    return {
      students,
      generatedAt: Date.now(),
      source: 'firebase',
      syncErrors: [],
    };
  } catch {
    const fallback = localDashboard();
    const dashboardError: SyncErrorRecord = {
      uid: currentSession()?.uid || 'admin',
      pageNumber: 1,
      operation: 'dashboard',
      createdAt: Date.now(),
      message:
        'טעינת הנתונים המרכזיים נכשלה. הנתונים המקומיים אינם תמונת מצב של הכיתה.',
    };
    return {
      ...fallback,
      syncErrors: [dashboardError, ...fallback.syncErrors],
    };
  }
}

export async function loadPageResult(
  uid: string,
  pageNumber: number,
): Promise<PageResult | null> {
  if (!activeSessionOwns(uid)) return null;
  assertPageNumber(pageNumber);

  const localResults = loadMap<PageResult>(RESULTS_KEY);
  const key = compoundKey(uid, pageNumber);
  const local = localResults[key];
  const session = currentSession();

  if (db && session?.uid === uid) {
    try {
      const snapshot = await getDoc(
        doc(db, 'students', uid, 'results', 'page-' + String(pageNumber)),
      );
      if (snapshot.exists()) {
        const remote = snapshot.data() as PageResult;
        const merged = local
          ? mergePageResults(remote, local)
          : validateResult(remote);
        localResults[key] = merged;
        saveMap(RESULTS_KEY, localResults);
        return merged;
      }
    } catch {
      return local ? validateResult(local) : null;
    }
  }

  return local ? validateResult(local) : null;
}

export async function loadUserResults(
  uid: string,
): Promise<PageResult[]> {
  if (!activeSessionOwns(uid) && !isAdminSession()) return [];

  const localResults = Object.values(
    loadMap<PageResult>(RESULTS_KEY),
  ).filter((result) => result.uid === uid && result.uid !== LEGACY_GUEST_UID);

  if (!db) {
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
      const current = merged.get(result.pageNumber);
      merged.set(result.pageNumber, mergePageResults(current, result));
    }

    for (const document of snapshot.docs) {
      const result = document.data() as PageResult;
      const current = merged.get(result.pageNumber);
      merged.set(result.pageNumber, mergePageResults(current, result));
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
  if (!activeSessionOwns(uid) && !isAdminSession()) return [];

  const localDrafts = Object.values(
    loadMap<PageDraft>(DRAFTS_KEY),
  ).filter((draft) => draft.uid === uid && draft.uid !== LEGACY_GUEST_UID);

  if (!db) {
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
      const current = merged.get(draft.pageNumber);
      merged.set(draft.pageNumber, mergePageDrafts(current, draft));
    }

    for (const document of snapshot.docs) {
      const draft = document.data() as PageDraft;
      const current = merged.get(draft.pageNumber);
      merged.set(draft.pageNumber, mergePageDrafts(current, draft));
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
