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

  it('deploys Firestore only to an explicitly supplied project', () => {
    expect(firestoreWorkflow).toContain(
      'FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}',
    );
    expect(firestoreWorkflow).toContain(
      'FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}',
    );
    expect(firestoreWorkflow).toContain('--project "$FIREBASE_PROJECT_ID"');
  });

  it('keeps the local Firebase default on an emulator/demo namespace', () => {
    expect(firebaseRc.projects?.default).toBe('demo-coordinate-lms');
  });
});
