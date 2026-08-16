import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagesWorkflow = readFileSync(
  '.github/workflows/deploy-pages.yml',
  'utf8',
);
const firestoreWorkflow = readFileSync(
  '.github/workflows/deploy-firestore.yml',
  'utf8',
);
const releaseReadiness = readFileSync(
  'scripts/release-readiness.mjs',
  'utf8',
);
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  git?: { deploymentEnabled?: boolean };
};
const firebaseRc = JSON.parse(readFileSync('.firebaserc', 'utf8')) as {
  projects?: { default?: string };
};

describe('production deployment safety contract', () => {
  it('keeps GitHub Pages manual-only', () => {
    expect(pagesWorkflow).toMatch(/\bworkflow_dispatch\s*:/);
    expect(pagesWorkflow).not.toMatch(/^\s*(push|pull_request)\s*:/m);
    expect(pagesWorkflow).toContain('VITE_ALLOW_LOCAL_LMS: \'false\'');
  });

  it('keeps automatic Vercel Git deployments disabled', () => {
    expect(vercel.git?.deploymentEnabled).toBe(false);
  });

  it('deploys Firestore only to an explicitly supplied real project', () => {
    expect(firestoreWorkflow).toContain(
      'FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}',
    );
    expect(firestoreWorkflow).toContain(
      'FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}',
    );
    expect(firestoreWorkflow).toContain('--project "$FIREBASE_PROJECT_ID"');
    expect(firestoreWorkflow).toContain('if [[ "$FIREBASE_PROJECT_ID" == demo-* ]]');
  });

  it('requires verified Firebase production evidence and persists it only after verification', () => {
    const verifyIndex = firestoreWorkflow.indexOf(
      'node scripts/verify-production-firebase.mjs',
    );
    const persistIndex = firestoreWorkflow.indexOf(
      'Persist verified non-secret evidence to the triggering branch',
    );

    expect(verifyIndex).toBeGreaterThanOrEqual(0);
    expect(persistIndex).toBeGreaterThan(verifyIndex);
    expect(firestoreWorkflow).toContain('git add reports/firebase-production-evidence.json');
    expect(firestoreWorkflow).toContain('permissions:\n  contents: write');
    expect(releaseReadiness).toContain("reports', 'firebase-production-evidence.json");
    expect(releaseReadiness).toContain('productionFirebasePass');
  });

  it('keeps the local Firebase default on an emulator/demo namespace', () => {
    expect(firebaseRc.projects?.default).toBe('demo-coordinate-lms');
  });
});
