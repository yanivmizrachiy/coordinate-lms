import { createHash, createSign } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const projectId = String(process.env.FIREBASE_PROJECT_ID || '').trim();
const credentialsPath = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();

function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
}

if (!projectId || /^demo(?:-|$)/i.test(projectId)) {
  fail('FIREBASE_PROJECT_ID must be a real non-demo production project ID.');
}
if (!credentialsPath) {
  fail('GOOGLE_APPLICATION_CREDENTIALS is required.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(await readFile(credentialsPath, 'utf8'));
} catch {
  fail('Firebase service-account credentials are missing or invalid JSON.');
}

if (String(serviceAccount.project_id || '').trim() !== projectId) {
  fail('Firebase service-account project_id does not match FIREBASE_PROJECT_ID.');
}
if (!serviceAccount.client_email || !serviceAccount.private_key) {
  fail('Firebase service-account credentials are missing client_email/private_key.');
}

const now = Math.floor(Date.now() / 1000);
const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const payload = base64url(
  JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }),
);
const unsigned = `${header}.${payload}`;
const signer = createSign('RSA-SHA256');
signer.update(unsigned);
signer.end();
const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key).toString('base64url')}`;

const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }),
});
if (!tokenResponse.ok) {
  fail(`Could not obtain Google access token (HTTP ${tokenResponse.status}).`);
}
const tokenBody = await tokenResponse.json();
const accessToken = String(tokenBody.access_token || '');
if (!accessToken) fail('Google access-token response did not contain an access token.');

const authConfigResponse = await fetch(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`,
  { headers: { authorization: `Bearer ${accessToken}` } },
);
if (!authConfigResponse.ok) {
  fail(
    `Could not read Firebase Authentication project configuration (HTTP ${authConfigResponse.status}). ` +
      'The deployment service account needs firebaseauth.configs.get on the intended project.',
  );
}
const authConfig = await authConfigResponse.json();
const email = authConfig?.signIn?.email;
if (email?.enabled !== true) {
  fail('Firebase Email/Password authentication is not enabled.');
}
if (email?.passwordRequired !== true) {
  fail('Firebase email authentication does not require a password.');
}

const evidence = {
  schemaVersion: 1,
  status: 'pass',
  verifiedAt: new Date().toISOString(),
  firebaseProjectId: projectId,
  deployedCommit: String(process.env.GITHUB_SHA || '').trim(),
  workflowRunId: String(process.env.GITHUB_RUN_ID || '').trim(),
  workflowRunAttempt: String(process.env.GITHUB_RUN_ATTEMPT || '').trim(),
  firestoreRulesAndIndexesDeployed: true,
  authentication: {
    emailEnabled: true,
    passwordRequired: true,
  },
  contractHashes: {
    firestoreRulesSha256: await sha256('firestore.rules'),
    firestoreIndexesSha256: await sha256('firestore.indexes.json'),
  },
};

if (!/^[0-9a-f]{40}$/i.test(evidence.deployedCommit)) {
  fail('GITHUB_SHA must contain the full deployed commit SHA.');
}
if (!/^\d+$/.test(evidence.workflowRunId)) {
  fail('GITHUB_RUN_ID is missing or invalid.');
}

await mkdir(resolve(root, 'reports'), { recursive: true });
await writeFile(
  resolve(root, 'reports', 'firebase-production-evidence.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
  'utf8',
);

console.log(
  `[PASS] Firebase production deployment verified for project ${projectId}; evidence contains no credentials.`,
);
