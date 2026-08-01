import { isAllowedExpectedAnswer } from './answerValidation';

export const REVIEW_DECISIONS = [
  'unreviewed',
  'answers-approved',
  'open-ended',
  'intentionally-ungraded',
] as const;

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export interface ReviewManifestTarget {
  pageNumber: number;
  targetId: string;
  signature: string;
  automaticCheckingSafe: boolean;
  answers: string[];
}

export interface AnswerReviewEntry {
  pageNumber: number;
  targetId: string;
  signature: string;
  decision: ReviewDecision;
  answers: string[];
  note?: string;
}

export interface AnswerReviewBundle {
  schemaVersion: 2;
  kind: 'coordinate-lms-answer-review';
  manifestGeneratedAt: string;
  targetCount: number;
  exportedAt: string;
  entries: AnswerReviewEntry[];
}

export interface AnswerReviewManifest {
  schemaVersion: 2;
  generatedAt: string;
  pageCount: number;
  targetCount: number;
  pages: Array<{
    pageNumber: number;
    title: string;
    targets: Array<ReviewManifestTarget & {
      inputType: string;
      classification: string;
      sourceEvidence: string;
      context: string;
    }>;
  }>;
}

export interface ReviewImportResult {
  valid: boolean;
  errors: string[];
  bundle?: AnswerReviewBundle;
}

export type ReviewProgressState = Record<
  string,
  Pick<AnswerReviewEntry, 'signature' | 'decision' | 'answers' | 'note'>
>;

const REVIEW_STATE_KEY = 'coordinate_lms_answer_review_v2';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sameAnswers(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((answer, index) => answer === right[index])
  );
}

export function manifestTargets(
  manifest: AnswerReviewManifest,
): ReviewManifestTarget[] {
  return manifest.pages.flatMap((page) => page.targets);
}

export function validateReviewImport(
  value: unknown,
  manifest: AnswerReviewManifest,
): ReviewImportResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, errors: ['קובץ הייבוא חייב להיות אובייקט JSON.'] };
  }
  if (value['schemaVersion'] !== 2) {
    errors.push('גרסת הסכימה חייבת להיות 2.');
  }
  if (value['kind'] !== 'coordinate-lms-answer-review') {
    errors.push('סוג הקובץ אינו קובץ סקירת תשובות של Coordinate LMS.');
  }
  if (value['manifestGeneratedAt'] !== manifest.generatedAt) {
    errors.push('הקובץ נוצר מול גרסת יעדים אחרת; יש לייצא תבנית חדשה.');
  }
  if (value['targetCount'] !== manifest.targetCount) {
    errors.push('מספר היעדים בקובץ אינו תואם למניפסט הנוכחי.');
  }
  if (!Array.isArray(value['entries'])) {
    errors.push('entries חייב להיות מערך מלא של כל יעדי התשובה.');
    return { valid: false, errors };
  }

  const expectedTargets = manifestTargets(manifest);
  const expected = new Map(expectedTargets.map((target) => [target.targetId, target]));
  const seen = new Set<string>();
  const parsed: AnswerReviewEntry[] = [];
  if (value['entries'].length !== expectedTargets.length) {
    errors.push(
      `הקובץ חלקי: נמצאו ${String(value['entries'].length)} מתוך ${String(expectedTargets.length)} יעדים.`,
    );
  }

  value['entries'].forEach((entry, index) => {
    const label = `רשומה ${String(index + 1)}`;
    if (!isRecord(entry)) {
      errors.push(`${label} אינה אובייקט.`);
      return;
    }
    const targetId = entry['targetId'];
    const pageNumber = entry['pageNumber'];
    const signature = entry['signature'];
    const decision = entry['decision'];
    const answers = entry['answers'];
    const note = entry['note'];
    if (typeof targetId !== 'string') {
      errors.push(`${label}: targetId חסר או לא תקין.`);
      return;
    }
    if (seen.has(targetId)) {
      errors.push(`${label}: היעד ${targetId} מופיע יותר מפעם אחת.`);
      return;
    }
    seen.add(targetId);
    const target = expected.get(targetId);
    if (!target) {
      errors.push(`${label}: היעד ${targetId} אינו קיים במניפסט.`);
      return;
    }
    if (pageNumber !== target.pageNumber) {
      errors.push(`${label}: מספר העמוד של ${targetId} אינו תואם.`);
    }
    if (signature !== target.signature) {
      errors.push(`${label}: חתימת התוכן של ${targetId} השתנתה.`);
    }
    if (
      typeof decision !== 'string' ||
      !REVIEW_DECISIONS.includes(decision as ReviewDecision)
    ) {
      errors.push(`${label}: החלטת הסקירה אינה תקינה.`);
      return;
    }
    if (!Array.isArray(answers) || !answers.every(isAllowedExpectedAnswer)) {
      errors.push(`${label}: answers חייב להיות מערך של תשובות בטוחות ולא ריקות.`);
      return;
    }
    const cleanedAnswers = answers.map((answer) => answer.trim());
    if (new Set(cleanedAnswers).size !== cleanedAnswers.length) {
      errors.push(`${label}: מערך התשובות מכיל כפילויות.`);
    }
    if (decision === 'answers-approved' && cleanedAnswers.length === 0) {
      errors.push(`${label}: אישור תשובות מחייב לפחות תשובה אחת.`);
    }
    if (decision !== 'answers-approved' && cleanedAnswers.length > 0) {
      errors.push(`${label}: רק answers-approved רשאי להכיל תשובות.`);
    }
    if (target.automaticCheckingSafe) {
      if (decision !== 'answers-approved') {
        errors.push(`${label}: אי אפשר להסיר אישור מיעד שכבר הוכח כבטוח.`);
      } else if (!sameAnswers(cleanedAnswers, target.answers)) {
        errors.push(`${label}: אי אפשר לשנות תשובה קנונית דרך ייבוא סקירה.`);
      }
    }
    if (note !== undefined && (typeof note !== 'string' || note.length > 500)) {
      errors.push(`${label}: note חייב להיות טקסט באורך עד 500 תווים.`);
    }
    parsed.push({
      pageNumber: target.pageNumber,
      targetId,
      signature: target.signature,
      decision: decision as ReviewDecision,
      answers: cleanedAnswers,
      ...(typeof note === 'string' && note ? { note } : {}),
    });
  });

  for (const target of expectedTargets) {
    if (!seen.has(target.targetId)) {
      errors.push(`היעד ${target.targetId} חסר מן הקובץ.`);
    }
  }

  if (errors.length > 0) return { valid: false, errors };
  return {
    valid: true,
    errors: [],
    bundle: {
      schemaVersion: 2,
      kind: 'coordinate-lms-answer-review',
      manifestGeneratedAt: manifest.generatedAt,
      targetCount: manifest.targetCount,
      exportedAt:
        typeof value['exportedAt'] === 'string'
          ? value['exportedAt']
          : new Date().toISOString(),
      entries: parsed,
    },
  };
}

export function loadReviewProgress(
  storage: Pick<Storage, 'getItem'> = localStorage,
): ReviewProgressState {
  try {
    const parsed = JSON.parse(storage.getItem(REVIEW_STATE_KEY) || '{}');
    if (!isRecord(parsed)) return {};
    const state: ReviewProgressState = {};
    for (const [targetId, value] of Object.entries(parsed)) {
      if (
        !isRecord(value) ||
        typeof value['signature'] !== 'string' ||
        typeof value['decision'] !== 'string' ||
        !REVIEW_DECISIONS.includes(value['decision'] as ReviewDecision) ||
        !Array.isArray(value['answers']) ||
        !value['answers'].every(isAllowedExpectedAnswer) ||
        (value['note'] !== undefined && typeof value['note'] !== 'string')
      ) {
        continue;
      }
      state[targetId] = {
        signature: value['signature'],
        decision: value['decision'] as ReviewDecision,
        answers: value['answers'],
        ...(typeof value['note'] === 'string' ? { note: value['note'] } : {}),
      };
    }
    return state;
  } catch {
    return {};
  }
}

export function saveReviewProgress(
  entries: readonly AnswerReviewEntry[],
  storage: Pick<Storage, 'setItem'> = localStorage,
): ReviewProgressState {
  const state: ReviewProgressState = {};
  for (const entry of entries) {
    if (entry.decision === 'unreviewed') continue;
    state[entry.targetId] = {
      signature: entry.signature,
      decision: entry.decision,
      answers: entry.answers,
      ...(entry.note ? { note: entry.note } : {}),
    };
  }
  storage.setItem(REVIEW_STATE_KEY, JSON.stringify(state));
  return state;
}
