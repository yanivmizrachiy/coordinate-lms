import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const verifier = readFileSync(
  'scripts/verify-production-firebase.mjs',
  'utf8',
);
const deployWorkflow = readFileSync(
  '.github/workflows/deploy-firestore.yml',
  'utf8',
);
const readiness = readFileSync(
  'scripts/release-readiness.mjs',
  'utf8',
);

describe('Firebase production evidence contract', () => {
  it('rejects demo projects and mismatched service-account project identity', () => {
    expect(verifier).toContain("/^demo(?:-|$)/i.test(projectId)");
    expect(verifier).toContain("serviceAccount.project_id");
    expect(verifier).toContain("does not match FIREBASE_PROJECT_ID");
  });

  it('verifies Email/Password authentication against the real project', () => {
    expect(verifier).toContain('identitytoolkit.googleapis.com/admin/v2/projects/');
    expect(verifier).toContain('email?.enabled !== true');
    expect(verifier).toContain('email?.passwordRequired !== true');
  });

  it('deploys Firestore before verification and keeps only non-secret evidence', () => {
    const deployIndex = deployWorkflow.indexOf('Deploy rules and indexes');
    const verifyIndex = deployWorkflow.indexOf(
      'Verify Firebase Authentication and deployment evidence',
    );
    const artifactIndex = deployWorkflow.indexOf(
      'firebase-production-evidence',
    );

    expect(deployIndex).toBeGreaterThanOrEqual(0);
    expect(verifyIndex).toBeGreaterThan(deployIndex);
    expect(artifactIndex).toBeGreaterThan(verifyIndex);
    expect(deployWorkflow).toContain('node scripts/verify-production-firebase.mjs');
  });

  it('requires current production evidence and matching Firestore contract hashes for release', () => {
    expect(readiness).toContain("reports, 'firebase-production-evidence.json'");
    expect(readiness).toContain('productionFirebasePass');
    expect(readiness).toContain('firestoreRulesSha256');
    expect(readiness).toContain('firestoreIndexesSha256');
    expect(readiness).toContain('authentication?.emailEnabled === true');
    expect(readiness).toContain('authentication?.passwordRequired === true');
    expect(readiness).toContain("!/^demo(?:-|$)/i.test");
  });
});
