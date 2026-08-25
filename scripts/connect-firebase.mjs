#!/usr/bin/env node
/* One-command path from "no central save" to a real, registered classroom
   backend. Runs ON THE MAINTAINER'S MACHINE under the maintainer's own
   Firebase + GitHub logins; nothing here is invented, echoed or committed.

   What it does, in order:
     1. verifies the gh CLI is authenticated for this repository;
     2. logs in to Firebase (browser window) if needed;
     3. lets the maintainer pick an existing Firebase project or create one;
     4. ensures the project has a Web app and fetches its SDK config;
     5. writes the project id into .firebaserc (replacing the placeholder);
     6. stores the six VITE_FIREBASE_* values as GitHub Actions secrets;
     7. explains the one remaining manual secret (FIREBASE_SERVICE_ACCOUNT)
        and offers to store it from a downloaded key file;
     8. offers to trigger the Firestore-rules deploy and a FULL Pages deploy.

   Fail-closed stays intact: until this has run and the site is redeployed,
   registration keeps refusing honestly. */

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q) => (await rl.question(q)).trim();

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], shell: process.platform === 'win32', ...opts });
const runLive = (cmd, args) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });

const SECRET_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const fatal = (msg) => {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
};

console.log('\n=== חיבור Firebase אמיתי למערכת הצירים ===\n');

/* 1 — GitHub CLI must be signed in so secrets can be stored. */
try {
  run('gh', ['auth', 'status']);
} catch {
  fatal('gh אינו מחובר. הריצו: gh auth login');
}

/* 2 — Firebase login (interactive; opens a browser the first time). */
const fbAuthed = () => {
  const r = spawnSync('npx', ['firebase-tools', 'projects:list', '--json'], {
    encoding: 'utf8', shell: process.platform === 'win32',
  });
  return r.status === 0 ? r.stdout : null;
};
let projectsJson = fbAuthed();
if (!projectsJson) {
  console.log('נדרש חיבור לחשבון Firebase — ייפתח דפדפן.');
  if (runLive('npx', ['firebase-tools', 'login']).status !== 0) fatal('ההתחברות ל-Firebase נכשלה.');
  projectsJson = fbAuthed();
  if (!projectsJson) fatal('גם אחרי ההתחברות אין גישה לפרויקטים.');
}

/* 3 — pick or create the project. */
let projects = [];
try {
  const parsed = JSON.parse(projectsJson);
  projects = (parsed.result ?? parsed ?? []).map((p) => p.projectId).filter(Boolean);
} catch { /* older CLI prints a table; fall through to manual entry */ }

let projectId = '';
if (projects.length) {
  console.log('פרויקטים קיימים בחשבון:');
  projects.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  const pick = await ask('מספר פרויקט לבחירה, או Enter ליצירת פרויקט חדש: ');
  if (pick && projects[Number(pick) - 1]) projectId = projects[Number(pick) - 1];
}
if (!projectId) {
  const wanted = await ask('מזהה לפרויקט חדש (למשל coordinate-lms-live): ');
  if (!wanted) fatal('לא נבחר ולא נוצר פרויקט.');
  console.log('יוצר פרויקט…');
  if (runLive('npx', ['firebase-tools', 'projects:create', wanted, '--display-name', 'Coordinate LMS']).status !== 0) {
    fatal('יצירת הפרויקט נכשלה (ייתכן שהמזהה תפוס).');
  }
  projectId = wanted;
}
console.log(`\n→ פרויקט: ${projectId}`);

/* 4 — ensure a Web app exists, then fetch its SDK config. */
let appId = '';
try {
  const apps = JSON.parse(run('npx', ['firebase-tools', 'apps:list', 'WEB', '--project', projectId, '--json']));
  appId = (apps.result ?? [])[0]?.appId ?? '';
} catch { /* none yet */ }
if (!appId) {
  console.log('יוצר Web app…');
  if (runLive('npx', ['firebase-tools', 'apps:create', 'WEB', 'coordinate-lms', '--project', projectId]).status !== 0) {
    fatal('יצירת ה-Web app נכשלה.');
  }
}
console.log('מושך את הגדרות ה-SDK…');
const cfgOut = run('npx', ['firebase-tools', 'apps:sdkconfig', 'WEB', '--project', projectId, '--json']);
const sdk = JSON.parse(cfgOut).result?.sdkConfig ?? JSON.parse(cfgOut).sdkConfig;
if (!sdk?.apiKey) fatal('לא התקבלה תצורת SDK מלאה.');

const values = {
  VITE_FIREBASE_API_KEY: sdk.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: sdk.authDomain,
  VITE_FIREBASE_PROJECT_ID: sdk.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: sdk.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: sdk.messagingSenderId,
  VITE_FIREBASE_APP_ID: sdk.appId,
};
for (const k of SECRET_KEYS) if (!values[k]) fatal(`חסר ערך עבור ${k}.`);

/* 5 — point .firebaserc at the real project. */
const rcPath = '.firebaserc';
const rc = existsSync(rcPath) ? JSON.parse(readFileSync(rcPath, 'utf8')) : { projects: {} };
rc.projects = { ...rc.projects, default: projectId };
writeFileSync(rcPath, JSON.stringify(rc, null, 2) + '\n');
console.log(`→ ‎.firebaserc עודכן אל ${projectId} (זכרו לבצע commit).`);

/* 6 — store the six values as GitHub Actions secrets. */
console.log('שומר את שש ההגדרות כ-GitHub Actions secrets…');
for (const k of SECRET_KEYS) {
  run('gh', ['secret', 'set', k, '--body', values[k]]);
  console.log(`  ✓ ${k}`);
}

/* 7 — the rules-deploy workflow needs a service-account key; that key is a
       real secret and must be produced by the maintainer in the console. */
console.log(`\nנשאר סוד ידני אחד: FIREBASE_SERVICE_ACCOUNT (לפריסת חוקי Firestore).
צרו מפתח ב-console: IAM & Admin → Service accounts → מפתח JSON עם הרשאת
Firebase Rules Admin, והורידו קובץ.`);
const keyPath = await ask('נתיב לקובץ ה-JSON (או Enter לדלג בשלב זה): ');
if (keyPath) {
  if (!existsSync(keyPath)) fatal('הקובץ לא נמצא.');
  run('gh', ['secret', 'set', 'FIREBASE_SERVICE_ACCOUNT', '--body', readFileSync(keyPath, 'utf8')]);
  console.log('  ✓ FIREBASE_SERVICE_ACCOUNT');
}

/* 8 — offer the deploys. */
console.log('\nאל תשכחו להפעיל ב-console: Authentication → Email/Password, ו-Firestore Database.');
if ((await ask('לפרוס עכשיו חוקי Firestore + אתר מלא (הרשמה פעילה)? [y/N] ')).toLowerCase() === 'y') {
  if (keyPath) runLive('gh', ['workflow', 'run', 'deploy-firestore.yml', '--ref', 'main']);
  else console.log('(מדלג על חוקי Firestore — אין FIREBASE_SERVICE_ACCOUNT עדיין)');
  runLive('gh', ['workflow', 'run', 'deploy-pages.yml', '--ref', 'main']);
  console.log('הפריסות הופעלו — עקבו ב-Actions. בסיום ההרשמה באתר תהיה אמיתית.');
} else {
  console.log('לפריסה מאוחר יותר: gh workflow run deploy-pages.yml --ref main');
}

rl.close();
