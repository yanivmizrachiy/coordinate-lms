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
  it('keeps GitHub Pages manual-only and gated by full release readiness before upload', () => {
    expect(pagesWorkflow).toMatch(/\bworkflow_dispatch\s*:/);
    expect(pagesWorkflow).not.toMatch(/^\s*(push|pull_request)\s*:/m);
    expect(pagesWorkflow).toContain('VITE_ALLOW_LOCAL_LMS: \'false\'');

    const releaseGateIndex = pagesWorkflow.indexOf('npm run release:report');
    const uploadIndex = pagesWorkflow.indexOf('actions/upload-pages-artifact@v5');
    const deployIndex = pagesWorkflow.indexOf('actions/deploy-pages@v5');

    expect(releaseGateIndex).toBeGreaterThanOrEqual(0);
    expect(uploadIndex).toBeGreaterThan(releaseGateIndex);
    expect(deployIndex).toBeGreaterThan(uploadIndex);
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
    const deployIndex = firestoreWorkflow.indexOf('Deploy rules and indexes');
    const verifyIndex = firestoreWorkflow.indexOf(
      'node scripts/verify-production-firebase.mjs',
    );
    const persistIndex = firestoreWorkflow.indexOf(
      'Persist verified non-secret evidence to the triggering branch',
    );

    expect(deployIndex).toBeGreaterThanOrEqual(0);
    expect(verifyIndex).toBeGreaterThan(deployIndex);
    expect(persistIndex).toBeGreaterThan(verifyIndex);
    expect(firestoreWorkflow).toContain('git add reports/firebase-production-evidence.json');
    expect(firestoreWorkflow).toContain('permissions:\n  contents: write');
    expect(releaseReadiness).toContain("reports, 'firebase-production-evidence.json'");
    expect(releaseReadiness).toContain('productionFirebasePass');
  });

  it('keeps the local Firebase default on an emulator/demo namespace', () => {
    expect(firebaseRc.projects?.default).toBe('demo-coordinate-lms');
  });
});
