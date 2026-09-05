import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import {
  currentSession,
  isAdminSession,
  listLocalProfiles,
} from './auth';
import { safeParse } from '../lib/json';
import { DEFAULT_ANSWER_KEYS } from './answerKey';
import { LMS_CONFIG } from './config';
import { currentGuestPracticeSession } from './guestPracticeSession';
import { scorePolicyOf } from './scoring';
import { db } from './firebase';
import { TOTAL_PAGES } from '../data/workbook';
import { implicitAnswerKey } from './implicitAnswers';
import { provenAnswerKey } from './provenAnswerKey';
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

const CENTRAL_SAVE_ERROR =
  'השמירה במכשיר הצליחה, אבל הסנכרון המרכזי נכשל. בדקו את החיבור ונסו שוב.';

function loadMap<T>(key: string): Record<string, T> {
  return safeParse<Record<string, T>>(localStorage.getItem(key), {});
}

function saveMap<T>(key: string, value: Record<string, T>): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function compoundKey(uid: string, pageNumber: number): string {
  return uid + ':' + String(pageNumber);
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
  if (!Number.isInteger(value) || value < 0 || value > LMS_CONFIG.maxAttempts) {
    throw new Error(
      'מספר הניסיונות חייב להיות מספר שלם בין 0 ל־' +
        String(LMS_CONFIG.maxAttempts) +
        '.',
    );
  }
}

function validateDraft(draft: PageDraft): PageDraft {
  if (!Number.isInteger(draft.pageNumber) || draft.pageNumber < 1 || draft.pageNumber > TOTAL_PAGES) {
    throw new Error('מספר עמוד לא תקין.');
  }
  for (const progress of Object.values(draft.questions)) {
    assertAttemptCount(progress.attempts);
  }
  return { ...draft, maxAttemptCount: maxAttemptCount(draft.questions) };
}

function guestDraftForStorage(draft: PageDraft): PageDraft {
  const { score: _score, ...withoutScore } = draft;
  return validateDraft({ ...withoutScore, submitted: false });
}

function belongsToCurrentGuestSession(draft: PageDraft): boolean {
  const sessionId = currentGuestPracticeSession().id;
  if (sessionId === null) return draft.guestSessionId === undefined;
  return draft.guestSessionId === sessionId;
}

function guestDraftForCurrentSession(draft: PageDraft): PageDraft {
  const sanitized = guestDraftForStorage(draft);
  const sessionId = currentGuestPracticeSession().id;
  if (sessionId === null) {
    const { guestSessionId: _guestSessionId, ...legacyCompatible } = sanitized;
    return validateDraft(legacyCompatible);
  }
  return validateDraft({ ...sanitized, guestSessionId: sessionId });
}

function sanitizeGuestActivity(event: ActivityEvent): ActivityEvent {
  if (event.uid !== 'guest' || !event.metadata) return event;
  const metadata = { ...event.metadata };
  delete metadata['score'];
  delete metadata['bestScore'];
  delete metadata['latestScore'];
  return { ...event, metadata };
}

function purgeLegacyGuestResults(): void {
  const results = loadMap<PageResult>(RESULTS_KEY);
  let changed = false;
  for (const key of Object.keys(results)) {
    if (key.startsWith('guest:') || results[key]?.uid === 'guest') {
      delete results[key];
      changed = true;
    }
  }
  if (changed) saveMap(RESULTS_KEY, results);
}

function validateResult(result: PageResult): PageResult {
  if (!Number.isInteger(result.pageNumber) || result.pageNumber < 1 || result.pageNumber > TOTAL_PAGES) {
    throw new Error('מספר עמוד לא תקין.');
  }
  if (
    !Number.isInteger(result.score) ||
    result.score < LMS_CONFIG.minScore ||
    result.score > LMS_CONFIG.maxScore
  ) {
    throw new Error(
      'הציון חייב להיות מספר שלם בין ' +
        String(LMS_CONFIG.minScore) +
        ' ל־' +
        String(LMS_CONFIG.maxScore) +
        '.',
    );
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

/* The stored score travels with its policy version and computation time as one
   unit, so a merge can never pair one policy's number with another's label.
   Undefined members are omitted entirely — Firestore rejects undefined field
   values, and a legacy record simply has no policy fields. */
function scoredState(
  record: Pick<PageDraft, 'score' | 'scorePolicyVersion' | 'scoreComputedAt'>,
): Partial<PageDraft> {
  return {
    ...(record.score === undefined ? {} : { score: record.score }),
    ...(record.scorePolicyVersion === undefined
      ? {}
      : { scorePolicyVersion: record.scorePolicyVersion }),
    ...(record.scoreComputedAt === undefined
      ? {}
      : { scoreComputedAt: record.scoreComputedAt }),
  };
}

/* Choose which side's final score a merged submitted draft keeps.
   Scores from different policies are on incompatible scales, so the current
   policy wins outright — a higher legacy number must not survive via max().
   Inside one policy a fresher regrade of the same submission wins; only two
   equally fresh copies fall back to the historical stale-write max(). */
function mergeDraftScore(a: PageDraft, b: PageDraft): Partial<PageDraft> {
  if (a.score === undefined) return scoredState(b);
  if (b.score === undefined) return scoredState(a);
  if (scorePolicyOf(a) !== scorePolicyOf(b)) {
    return scoredState(scorePolicyOf(a) > scorePolicyOf(b) ? a : b);
  }
  const computedA = a.scoreComputedAt ?? 0;
  const computedB = b.scoreComputedAt ?? 0;
  if (computedA !== computedB) {
    return scoredState(computedA > computedB ? a : b);
  }
  return scoredState(a.score >= b.score ? a : b);
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
    const merged = mergeQuestionProgress(existing.questions[qid], validated.questions[qid]);
    if (merged) questions[qid] = merged;
  }
  const {
    score: _newestScore,
    scorePolicyVersion: _newestPolicy,
    scoreComputedAt: _newestComputedAt,
    ...newestWithoutScore
  } = newest;
  return validateDraft({
    ...newestWithoutScore,
    /* The EXISTING document owns its startedAt. Firestore's draft rule pins
       startedAt as immutable on update, and taking min() here produced a
       merged draft whose startedAt no longer matched the cloud copy whenever
       local work began before registration finished — after which every
       central draft update was rejected forever and sync silently froze.
       The authoritative side (cloud on load/sync, the older local copy on
       device) simply keeps the start it already recorded. */
    startedAt: existing.startedAt,
    updatedAt: Math.max(existing.updatedAt, validated.updatedAt),
    activeSeconds: Math.max(existing.activeSeconds, validated.activeSeconds),
    questions,
    submitted: existing.submitted || validated.submitted,
    ...mergeDraftScore(existing, validated),
  });
}

export function mergePageResults(
  existing: PageResult | null | undefined,
  incoming: PageResult,
): PageResult {
  const validated = validateResult(incoming);
  if (!existing) return validated;
  const normalizedExisting = validateResult(existing);

  /* Two records of the SAME submission are one grade in two copies, not two
     achievements: a regrade under a newer policy replaces its legacy twin
     wholesale, and within one policy the freshest recomputation wins. Neither
     may leak the other's score through max() — legacy and current policies
     score on incompatible scales. */
  if (normalizedExisting.submissionId === validated.submissionId) {
    if (scorePolicyOf(normalizedExisting) !== scorePolicyOf(validated)) {
      return scorePolicyOf(normalizedExisting) > scorePolicyOf(validated)
        ? normalizedExisting
        : validated;
    }
    const computedExisting = normalizedExisting.scoreComputedAt ?? 0;
    const computedIncoming = validated.scoreComputedAt ?? 0;
    if (computedExisting !== computedIncoming) {
      return computedExisting > computedIncoming
        ? normalizedExisting
        : validated;
    }
  }

  const latest = validated.submittedAt >= normalizedExisting.submittedAt
    ? validated
    : normalizedExisting;
  /* bestScore compares only submissions graded under the winner's policy. */
  const bestScore = Math.max(
    ...[normalizedExisting, validated]
      .filter((record) => scorePolicyOf(record) === scorePolicyOf(latest))
      .map((record) => record.bestScore ?? record.score),
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
  const errors = loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY);
  errors[syncErrorKey(record)] = record;
  saveMap(SYNC_ERRORS_KEY, errors);
}

function clearSyncError(
  uid: string,
  pageNumber: number,
  operation: SyncErrorRecord['operation'],
): void {
  const errors = loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY);
  delete errors[syncErrorKey({ uid, pageNumber, operation })];
  saveMap(SYNC_ERRORS_KEY, errors);
}

export function loadSyncErrors(uid?: string): SyncErrorRecord[] {
  return Object.values(loadMap<SyncErrorRecord>(SYNC_ERRORS_KEY))
    .filter((record) => !uid || record.uid === uid)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function failedOutcome(
  uid: string,
  pageNumber: number,
  operation: SyncErrorRecord['operation'],
): PersistenceOutcome {
  recordSyncError({ uid, pageNumber, operation, createdAt: Date.now(), message: CENTRAL_SAVE_ERROR });
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

export async function loadDraft(uid: string, pageNumber: number): Promise<PageDraft | null> {
  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  const key = compoundKey(uid, pageNumber);
  const local = localDrafts[key];

  if (uid === 'guest') {
    if (!local || !belongsToCurrentGuestSession(local)) return null;
    const sanitized = guestDraftForStorage(local);
    localDrafts[key] = sanitized;
    saveMap(DRAFTS_KEY, localDrafts);
    return sanitized;
  }

  const session = currentSession();
  if (db && session && session.uid === uid) {
    try {
      const snapshot = await getDoc(doc(db, 'students', uid, 'drafts', 'page-' + String(pageNumber)));
      if (snapshot.exists()) {
        const remote = snapshot.data() as PageDraft;
        const merged = local ? mergePageDrafts(remote, local) : validateDraft(remote);
        localDrafts[key] = merged;
        saveMap(DRAFTS_KEY, localDrafts);
        return merged;
      }
    } catch {
      return local || null;
    }
  }
  return local || null;
}

export async function saveDraft(draft: PageDraft): Promise<PersistenceOutcome> {
  const validated = validateDraft(draft);
  const localDrafts = loadMap<PageDraft>(DRAFTS_KEY);
  const key = compoundKey(validated.uid, validated.pageNumber);
  const incoming = validated.uid === 'guest' ? guestDraftForCurrentSession(validated) : validated;
  const stored = localDrafts[key];
  const existing = validated.uid === 'guest'
    ? stored && belongsToCurrentGuestSession(stored)
      ? guestDraftForStorage(stored)
      : undefined
    : stored;
  const mergedLocal = mergePageDrafts(existing, incoming);
  localDrafts[key] = validated.uid === 'guest' ? guestDraftForCurrentSession(mergedLocal) : mergedLocal;
  saveMap(DRAFTS_KEY, localDrafts);

  const session = currentSession();
  if (db && session && session.uid === draft.uid && draft.uid !== 'guest') {
    try {
      const reference = doc(db, 'students', validated.uid, 'drafts', 'page-' + String(validated.pageNumber));
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const remote = snapshot.exists() ? (snapshot.data() as PageDraft) : null;
        transaction.set(reference, mergePageDrafts(remote, mergedLocal));
      });
      return savedOutcome(validated.uid, validated.pageNumber, 'draft', 'saved');
    } catch {
      return failedOutcome(validated.uid, validated.pageNumber, 'draft');
    }
  }
  return savedOutcome(validated.uid, validated.pageNumber, 'draft', 'not-required');
}

export async function savePageResult(result: PageResult): Promise<PersistenceOutcome> {
  const validated = validateResult(result);
  const localResults = loadMap<PageResult>(RESULTS_KEY);
  const key = compoundKey(validated.uid, validated.pageNumber);

  if (validated.uid === 'guest') {
    delete localResults[key];
    saveMap(RESULTS_KEY, localResults);
    return { localSaved: false, central: 'not-required' };
  }

  const mergedLocal = mergePageResults(localResults[key], validated);
  localResults[key] = mergedLocal;
  saveMap(RESULTS_KEY, localResults);

  const session = currentSession();
  if (db && session && session.uid === result.uid) {
    try {
      const reference = doc(db, 'students', validated.uid, 'results', 'page-' + String(validated.pageNumber));
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const remote = snapshot.exists() ? (snapshot.data() as PageResult) : null;
        transaction.set(reference, mergePageResults(remote, mergedLocal));
      });
      return savedOutcome(validated.uid, validated.pageNumber, 'result', 'saved');
    } catch {
      return failedOutcome(validated.uid, validated.pageNumber, 'result');
    }
  }
  return savedOutcome(validated.uid, validated.pageNumber, 'result', 'not-required');
}

export async function logActivity(event: ActivityEvent): Promise<PersistenceOutcome> {
  const eventId = event.id || [event.createdAt, event.type, event.pageNumber, crypto.randomUUID()].join('-');
  const eventWithId = sanitizeGuestActivity({ ...event, id: eventId });
  const events = safeParse<ActivityEvent[]>(localStorage.getItem(ACTIVITY_KEY), []).map(sanitizeGuestActivity);

  if (!events.some((item) => item.id === eventWithId.id)) events.push(eventWithId);
  if (events.length > 5000) events.splice(0, events.length - 5000);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events));

  const session = currentSession();
  if (db && session && session.uid === event.uid && event.uid !== 'guest') {
    try {
      await setDoc(doc(db, 'students', event.uid, 'activity', eventId), eventWithId);
      return savedOutcome(event.uid, event.pageNumber, 'activity', 'saved');
    } catch {
      return failedOutcome(event.uid, event.pageNumber, 'activity');
    }
  }
  return savedOutcome(event.uid, event.pageNumber, 'activity', 'not-required');
}

export async function loadAnswerKey(pageNumber: number): Promise<AnswerKey> {
  const defaults = DEFAULT_ANSWER_KEYS[pageNumber] || {};
  const proven = provenAnswerKey(pageNumber);
  const implicit = implicitAnswerKey(pageNumber);
  const customKeys = loadMap<AnswerKey>(ANSWER_KEYS_KEY);
  const local = customKeys[String(pageNumber)] || {};
  let remote: AnswerKey = {};

  if (db && currentSession()) {
    try {
      const snapshot = await getDoc(doc(db, 'answerKeys', 'page-' + String(pageNumber)));
      if (snapshot.exists()) {
        const data = snapshot.data() as { answers?: AnswerKey };
        remote = data.answers || {};
      }
    } catch {
      remote = {};
    }
  }

  return {
    ...proven,
    ...defaults,
    ...local,
    ...remote,
    ...implicit,
  };
}

export async function saveAnswerKey(pageNumber: number, key: AnswerKey): Promise<void> {
  if (!isAdminSession()) throw new Error('רק מנהל יכול לשמור מפתח תשובות.');
  const customKeys = loadMap<AnswerKey>(ANSWER_KEYS_KEY);
  customKeys[String(pageNumber)] = key;
  saveMap(ANSWER_KEYS_KEY, customKeys);

  const session = currentSession();
  if (db && session) {
    await setDoc(
      doc(db, 'answerKeys', 'page-' + String(pageNumber)),
      { pageNumber, answers: key, updatedAt: Date.now(), updatedBy: session.uid },
      { merge: true },
    );
  }
}

export interface GuestProgressClaim {
  complete: boolean;
  outcomes: PersistenceOutcome[];
}

export function canFinalizeGuestTransfer(outcomes: PersistenceOutcome[]): boolean {
  return outcomes.every((outcome) => outcome.central !== 'failed');
}

export async function claimGuestProgress(uid: string): Promise<GuestProgressClaim> {
  const drafts = loadMap<PageDraft>(DRAFTS_KEY);
  const outcomes: PersistenceOutcome[] = [];
  const isCurrentGuestDraft = (key: string): boolean => {
    const draft = drafts[key];
    return Boolean(
      key.startsWith('guest:') &&
      draft?.uid === 'guest' &&
      belongsToCurrentGuestSession(draft),
    );
  };
  const guestDraftKeys = Object.keys(drafts).filter(isCurrentGuestDraft);

  /* Guest results are deliberately ephemeral. Purge legacy records from older
     builds rather than importing a previously displayed guest score. */
  purgeLegacyGuestResults();

  for (const key of guestDraftKeys) {
    const guestDraft = drafts[key];
    if (guestDraft) {
      outcomes.push(await saveDraft({
        ...guestDraftForStorage(guestDraft),
        uid,
        updatedAt: Date.now(),
      }));
    }
  }

  const complete = canFinalizeGuestTransfer(outcomes);
  if (complete) {
    const latestDrafts = loadMap<PageDraft>(DRAFTS_KEY);
    for (const key of guestDraftKeys) delete latestDrafts[key];
    saveMap(DRAFTS_KEY, latestDrafts);
    clearSyncError(uid, 1, 'guest-transfer');
  } else {
    recordSyncError({
      uid,
      pageNumber: 1,
      operation: 'guest-transfer',
      createdAt: Date.now(),
      message: 'טיוטת התרגול של האורח נשמרה במכשיר אך טרם הועברה למערכת המרכזית. נסו שוב לפני המשך העבודה.',
    });
  }
  return { complete, outcomes };
}

function localDashboard(): DashboardSnapshot {
  purgeLegacyGuestResults();
  const profiles = listLocalProfiles().filter((profile) => profile.role !== 'admin');
  const localResults = Object.values(loadMap<PageResult>(RESULTS_KEY));
  const localDrafts = Object.values(loadMap<PageDraft>(DRAFTS_KEY));
  const localActivity = safeParse<ActivityEvent[]>(localStorage.getItem(ACTIVITY_KEY), []).map(sanitizeGuestActivity);
  const syncErrors = loadSyncErrors();

  const students: DashboardStudent[] = profiles.map((profile) => ({
    profile,
    results: localResults.filter((result) => result.uid === profile.uid).sort((a, b) => a.pageNumber - b.pageNumber),
    drafts: localDrafts.filter((draft) => draft.uid === profile.uid).sort((a, b) => a.pageNumber - b.pageNumber),
    activity: localActivity.filter((event) => event.uid === profile.uid).sort((a, b) => b.createdAt - a.createdAt),
    syncErrors: syncErrors.filter((error) => error.uid === profile.uid),
  }));

  return { students, generatedAt: Date.now(), source: 'local', syncErrors };
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  if (!db || !isAdminSession()) return localDashboard();
  const firestore = db;

  try {
    const studentsSnapshot = await getDocs(collection(firestore, 'students'));
    const studentDocuments = studentsSnapshot.docs.filter(
      (studentDocument) => (studentDocument.data() as DashboardStudent['profile']).role !== 'admin',
    );
    const students = await Promise.all(studentDocuments.map(async (studentDocument) => {
      const profile = studentDocument.data() as DashboardStudent['profile'];
      const [resultsSnapshot, draftsSnapshot, activitySnapshot] = await Promise.all([
        getDocs(collection(firestore, 'students', studentDocument.id, 'results')),
        getDocs(collection(firestore, 'students', studentDocument.id, 'drafts')),
        getDocs(collection(firestore, 'students', studentDocument.id, 'activity')),
      ]);
      const results = resultsSnapshot.docs.map((document) => document.data() as PageResult).sort((a, b) => a.pageNumber - b.pageNumber);
      const drafts = draftsSnapshot.docs.map((document) => document.data() as PageDraft).sort((a, b) => a.pageNumber - b.pageNumber);
      const activity = activitySnapshot.docs.map((document) => document.data() as ActivityEvent).sort((a, b) => b.createdAt - a.createdAt);
      return { profile, results, drafts, activity, syncErrors: [] } satisfies DashboardStudent;
    }));

    students.sort((a, b) => {
      const aLatest = a.activity[0]?.createdAt || a.profile.lastSeenAt;
      const bLatest = b.activity[0]?.createdAt || b.profile.lastSeenAt;
      return bLatest - aLatest;
    });
    return { students, generatedAt: Date.now(), source: 'firebase', syncErrors: [] };
  } catch {
    const fallback = localDashboard();
    const dashboardError: SyncErrorRecord = {
      uid: currentSession()?.uid || 'admin',
      pageNumber: 1,
      operation: 'dashboard',
      createdAt: Date.now(),
      message: 'טעינת הנתונים המרכזיים נכשלה. הנתונים המקומיים אינם תמונת מצב של הכיתה.',
    };
    return { ...fallback, syncErrors: [dashboardError, ...fallback.syncErrors] };
  }
}

export async function loadPageResult(uid: string, pageNumber: number): Promise<PageResult | null> {
  if (uid === 'guest') {
    purgeLegacyGuestResults();
    return null;
  }

  const localResults = loadMap<PageResult>(RESULTS_KEY);
  const key = compoundKey(uid, pageNumber);
  const local = localResults[key];
  const session = currentSession();

  if (db && session?.uid === uid) {
    try {
      const snapshot = await getDoc(doc(db, 'students', uid, 'results', 'page-' + String(pageNumber)));
      if (snapshot.exists()) {
        const remote = snapshot.data() as PageResult;
        const merged = local ? mergePageResults(remote, local) : validateResult(remote);
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

export async function loadUserResults(uid: string): Promise<PageResult[]> {
  if (uid === 'guest') {
    purgeLegacyGuestResults();
    return [];
  }

  const localResults = Object.values(loadMap<PageResult>(RESULTS_KEY)).filter((result) => result.uid === uid);
  if (!db) return localResults.sort((a, b) => a.pageNumber - b.pageNumber);

  try {
    const snapshot = await getDocs(collection(db, 'students', uid, 'results'));
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
    return [...merged.values()].sort((a, b) => a.pageNumber - b.pageNumber);
  } catch {
    return localResults.sort((a, b) => a.pageNumber - b.pageNumber);
  }
}

export async function loadUserDrafts(uid: string): Promise<PageDraft[]> {
  const localDrafts = Object.values(loadMap<PageDraft>(DRAFTS_KEY)).filter(
    (draft) => draft.uid === uid && (uid !== 'guest' || belongsToCurrentGuestSession(draft)),
  );
  if (!db || uid === 'guest') {
    return localDrafts
      .map((draft) => uid === 'guest' ? guestDraftForStorage(draft) : draft)
      .sort((a, b) => a.pageNumber - b.pageNumber);
  }

  try {
    const snapshot = await getDocs(collection(db, 'students', uid, 'drafts'));
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
    return [...merged.values()].sort((a, b) => a.pageNumber - b.pageNumber);
  } catch {
    return localDrafts.sort((a, b) => a.pageNumber - b.pageNumber);
  }
}
