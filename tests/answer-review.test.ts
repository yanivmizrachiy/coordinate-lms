import { describe, expect, it } from 'vitest';
import {
  saveReviewProgress,
  validateReviewImport,
  type AnswerReviewBundle,
  type AnswerReviewManifest,
} from '../src/lms/answerReview';

const manifest: AnswerReviewManifest = {
  schemaVersion: 2,
  generatedAt: '2026-08-02T00:00:00.000Z',
  pageCount: 1,
  targetCount: 2,
  pages: [
    {
      pageNumber: 6,
      title: 'Review page',
      targets: [
        {
          pageNumber: 6,
          targetId: 'p6-q1',
          signature: 'safe-signature',
          inputType: 'text',
          classification: 'reviewed-explicit',
          sourceEvidence: 'answerKey.ts',
          automaticCheckingSafe: true,
          answers: ['4'],
          context: 'safe',
        },
        {
          pageNumber: 6,
          targetId: 'p6-q2',
          signature: 'open-signature',
          inputType: 'text',
          classification: 'ambiguous',
          sourceEvidence: 'none',
          automaticCheckingSafe: false,
          answers: [],
          context: 'needs review',
        },
      ],
    },
  ],
};

function bundle(): AnswerReviewBundle {
  return {
    schemaVersion: 2,
    kind: 'coordinate-lms-answer-review',
    manifestGeneratedAt: manifest.generatedAt,
    targetCount: 2,
    exportedAt: '2026-08-02T00:01:00.000Z',
    entries: [
      {
        pageNumber: 6,
        targetId: 'p6-q1',
        signature: 'safe-signature',
        decision: 'answers-approved',
        answers: ['4'],
      },
      {
        pageNumber: 6,
        targetId: 'p6-q2',
        signature: 'open-signature',
        decision: 'open-ended',
        answers: [],
      },
    ],
  };
}

describe('answer-review import safety', () => {
  it('accepts a complete, signature-aligned review bundle', () => {
    const result = validateReviewImport(bundle(), manifest);
    expect(result.valid).toBe(true);
    expect(result.bundle?.entries).toHaveLength(2);
  });

  it.each([
    ['partial', (value: AnswerReviewBundle) => value.entries.pop()],
    ['duplicate', (value: AnswerReviewBundle) => {
      value.entries[1] = { ...value.entries[0]! };
    }],
    ['unknown', (value: AnswerReviewBundle) => {
      value.entries[1]!.targetId = 'p6-q999';
    }],
    ['drifted', (value: AnswerReviewBundle) => {
      value.entries[1]!.signature = 'changed';
    }],
  ])('rejects a %s target set', (_name, mutate) => {
    const value = bundle();
    mutate(value);
    expect(validateReviewImport(value, manifest).valid).toBe(false);
  });

  it('rejects malformed decisions, answers, and canonical-answer changes', () => {
    const wrongDecision = bundle() as unknown as Record<string, unknown>;
    (wrongDecision['entries'] as Array<Record<string, unknown>>)[1]![
      'decision'
    ] = 'guess';
    expect(validateReviewImport(wrongDecision, manifest).valid).toBe(false);

    const answerOnOpenEnded = bundle();
    answerOnOpenEnded.entries[1]!.answers = ['guess'];
    expect(validateReviewImport(answerOnOpenEnded, manifest).valid).toBe(false);

    const changedCanonical = bundle();
    changedCanonical.entries[0]!.answers = ['5'];
    expect(validateReviewImport(changedCanonical, manifest).valid).toBe(false);
  });

  it('persists reviewed progress while omitting unreviewed targets', () => {
    let raw = '';
    const state = saveReviewProgress(
      [
        ...bundle().entries,
        {
          pageNumber: 6,
          targetId: 'p6-q3',
          signature: 'new',
          decision: 'unreviewed',
          answers: [],
        },
      ],
      { setItem: (_key, value) => { raw = value; } },
    );
    expect(Object.keys(state)).toEqual(['p6-q1', 'p6-q2']);
    expect(JSON.parse(raw)).toEqual(state);
  });
});
