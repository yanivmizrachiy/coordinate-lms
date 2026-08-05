import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const rules = readFileSync('firestore.rules', 'utf8');

describe('Firestore production rules contract', () => {
  it('keeps every student subtree owner-scoped with explicit admin access', () => {
    expect(rules).toContain('function owner(uid)');
    expect(rules).toContain("request.auth.uid == uid");
    expect(rules).toContain("request.auth.token.email == 'yanivmiz77@gmail.com'");
    expect(rules).toContain('match /students/{uid}');
    expect(rules).toContain('allow read: if owner(uid) || admin();');
  });

  it('uses allowlists for every client-writable document', () => {
    expect(rules.match(/keys\(\)\.hasOnly/g)).toHaveLength(5);
    expect(rules).toContain("'maxAttemptCount', 'submissionId'");
    expect(rules).toContain("'page_open', 'answer_change', 'answer_check', 'page_submit'");
  });

  it('bounds page, score, and persisted attempt summary values', () => {
    expect(rules).toContain('value >= 1 && value <= 78');
    expect(rules).toContain('value >= 1 && value <= 100');
    expect(rules).toContain('value >= 0 && value <= 3');
    expect(rules).toContain('validAttemptCount(request.resource.data.maxAttemptCount)');
  });

  it('rejects progress regression while permitting an exact activity retry', () => {
    expect(rules).toContain('request.resource.data.updatedAt >= resource.data.updatedAt');
    expect(rules).toContain('request.resource.data.submittedAt > resource.data.submittedAt');
    expect(rules).toContain('request.resource.data.bestScore >= resource.data.bestScore');
    expect(rules).toContain('request.resource.data == resource.data');
  });

  it('limits answer-key writes to the administrator and validates the schema', () => {
    expect(rules).toContain('match /answerKeys/{document}');
    expect(rules).toContain(
      'allow create, update: if admin() && validAnswerKey(document);',
    );
    expect(rules).toContain('allow delete: if admin();');
  });
});
