import { doc, runTransaction } from 'firebase/firestore';
import { safeParse } from '../lib/json';
import { currentSession } from './auth';
import { db } from './firebase';
import { freshPageRun } from './pageRun';
import type { PageDraft, PersistenceOutcome } from './types';

const DRAFTS_KEY = 'coordinate_lms_drafts_v2';
const RESTART_ERROR = 'פתיחת ניסיון חדש לא הסתנכרנה. הנתונים הקיימים נשארו ללא שינוי.';

function compoundKey(uid: string, pageNumber: number): string {
  return uid + ':' + String(pageNumber);
}

function storeLocalDraft(draft: PageDraft): void {
  const drafts = safeParse<Record<string, PageDraft>>(localStorage.getItem(DRAFTS_KEY), {});
  drafts[compoundKey(draft.uid, draft.pageNumber)] = draft;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/**
 * Replace only a submitted draft with a genuinely fresh run. The result record
 * is deliberately untouched, so the already submitted score remains history.
 * Registered users update Firestore first; local state changes only after the
 * central reset succeeds, avoiding a split-brain reload that would resurrect
 * the old submitted draft.
 */
export async function restartSubmittedPage(draft: PageDraft): Promise<PersistenceOutcome> {
  if (!draft.submitted) {
    return { localSaved: false, central: 'not-required' };
  }

  const fresh = freshPageRun(draft);

  if (draft.uid === 'guest') {
    storeLocalDraft(fresh);
    return { localSaved: true, central: 'not-required' };
  }

  /* A registered retry changes the authoritative draft boundary. If Firebase
     or the authenticated owner session is unavailable, do NOT manufacture a
     local-only fresh run: the next cloud load could resurrect the submitted
     draft or, worse, let the learner work in a run the teacher never sees.
     Registered retry is therefore fail-closed until the central state can be
     changed atomically. */
  const session = currentSession();
  if (!db || !session || session.uid !== draft.uid) {
    return { localSaved: false, central: 'failed', error: RESTART_ERROR };
  }

  try {
    const reference = doc(db, 'students', draft.uid, 'drafts', 'page-' + String(draft.pageNumber));
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('missing submitted draft');
      const remote = snapshot.data() as PageDraft;
      if (!remote.submitted) throw new Error('draft is not submitted');
      transaction.set(reference, fresh);
    });
    storeLocalDraft(fresh);
    return { localSaved: true, central: 'saved' };
  } catch {
    return { localSaved: false, central: 'failed', error: RESTART_ERROR };
  }
}
