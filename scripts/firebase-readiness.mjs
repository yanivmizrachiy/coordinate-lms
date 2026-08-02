import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const staticOnly = process.argv.includes('--static');
const REQUIRED_FIREBASE_SETTINGS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
const checks = [];

function add(id, status, message, critical = false) {
  checks.push({ id, status, critical, message });
}

function parseEnv(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2] || '';
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value.trim();
  }
  return values;
}

async function localEnvironment() {
  const values = { ...process.env };
  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    Object.assign(values, parseEnv(await readFile(path, 'utf8')));
  }
  return values;
}

function placeholder(value) {
  return /^(?:your[-_]|example|changeme|replace[-_]|x{4,}|<.+>)|placeholder/i.test(
    value,
  );
}

function githubNames(kind) {
  const result = spawnSync(
    process.platform === 'win32' ? 'gh.exe' : 'gh',
    [kind, 'list', '--repo', 'yanivmizrachiy/coordinate-lms', '--json', 'name'],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status !== 0) return null;
  try {
    return new Set(JSON.parse(result.stdout).map((item) => item.name));
  } catch {
    return null;
  }
}

function balancedBraces(value) {
  let depth = 0;
  for (const char of value) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

const environment = await localEnvironment();
const secretNames = githubNames('secret');
const variableNames = githubNames('variable');

for (const name of REQUIRED_FIREBASE_SETTINGS) {
  const value = String(environment[name] || '').trim();
  const availableInActions = secretNames?.has(name) === true;
  if (value && !placeholder(value)) {
    add('runtime:' + name, 'pass', name + ' is present and non-placeholder.');
  } else if (availableInActions) {
    add('runtime:' + name, 'pass', name + ' exists in GitHub Actions secrets.');
  } else if (value && placeholder(value)) {
    add('runtime:' + name, 'fail', name + ' contains a placeholder value.', true);
  } else {
    add(
      'runtime:' + name,
      staticOnly ? 'warn' : 'fail',
      name + ' is missing locally and was not found in GitHub Actions secrets.',
      !staticOnly,
    );
  }
}

const firebaseSource = await readFile(resolve(root, 'src/lms/firebase.ts'), 'utf8');
for (const name of REQUIRED_FIREBASE_SETTINGS) {
  add(
    'initialization:' + name,
    firebaseSource.includes('import.meta.env.' + name) ? 'pass' : 'fail',
    firebaseSource.includes('import.meta.env.' + name)
      ? 'Firebase initialization references ' + name + '.'
      : 'Firebase initialization does not reference ' + name + '.',
    true,
  );
}
add(
  'initialization:guard',
  firebaseSource.includes('firebaseConfigured') &&
    firebaseSource.includes('initializeApp(firebaseConfig)')
    ? 'pass'
    : 'fail',
  'Firebase initialization is guarded by complete configuration.',
  true,
);
add(
  'production:local-fallback',
  firebaseSource.includes('import.meta.env.DEV ||') &&
    firebaseSource.includes("VITE_ALLOW_LOCAL_LMS === 'true'")
    ? 'pass'
    : 'fail',
  'Local LMS fallback is limited to development or explicit opt-in.',
  true,
);

const deployPagesPath = resolve(root, '.github/workflows/deploy-pages.yml');
const deployFirestorePath = resolve(root, '.github/workflows/deploy-firestore.yml');
for (const [id, path] of [
  ['workflow:pages', deployPagesPath],
  ['workflow:firestore', deployFirestorePath],
]) {
  add(id, existsSync(path) ? 'pass' : 'fail', path.slice(root.length + 1) + ' exists.', true);
}
const deployPages = existsSync(deployPagesPath)
  ? await readFile(deployPagesPath, 'utf8')
  : '';
add(
  'production:fallback-env',
  /VITE_ALLOW_LOCAL_LMS:\s*['"]false['"]/.test(deployPages) ? 'pass' : 'fail',
  'Production deployment explicitly disables local fallback.',
  true,
);

const adminConfigured =
  Boolean(String(environment.VITE_ADMIN_EMAILS || '').trim()) ||
  variableNames?.has('VITE_ADMIN_EMAILS') === true ||
  /VITE_ADMIN_EMAILS:.*yanivmiz77@gmail\.com/.test(deployPages);
add(
  'admin:emails',
  adminConfigured ? 'pass' : 'warn',
  adminConfigured
    ? 'Admin-email configuration is present without exposing its value.'
    : 'VITE_ADMIN_EMAILS is not configured; teacher access must be configured before launch.',
);

const serviceAccountPresent = secretNames?.has('FIREBASE_SERVICE_ACCOUNT') === true;
add(
  'actions:service-account',
  serviceAccountPresent ? 'pass' : staticOnly ? 'warn' : 'fail',
  serviceAccountPresent
    ? 'FIREBASE_SERVICE_ACCOUNT exists in GitHub Actions secrets.'
    : 'FIREBASE_SERVICE_ACCOUNT was not found in GitHub Actions secrets.',
  !staticOnly && !serviceAccountPresent,
);

try {
  const indexes = JSON.parse(
    await readFile(resolve(root, 'firestore.indexes.json'), 'utf8'),
  );
  add(
    'firestore:indexes',
    Array.isArray(indexes.indexes) && Array.isArray(indexes.fieldOverrides)
      ? 'pass'
      : 'fail',
    'firestore.indexes.json is valid JSON with deployable top-level arrays.',
    true,
  );
} catch {
  add('firestore:indexes', 'fail', 'firestore.indexes.json is invalid JSON.', true);
}

const rules = await readFile(resolve(root, 'firestore.rules'), 'utf8');
const rulesStructurallyValid =
  balancedBraces(rules) &&
  /rules_version\s*=\s*'2'/.test(rules) &&
  rules.includes('service cloud.firestore') &&
  rules.includes('match /databases/{database}/documents');
add(
  'firestore:rules',
  rulesStructurallyValid ? 'pass' : 'fail',
  rulesStructurallyValid
    ? 'firestore.rules passes structural validation.'
    : 'firestore.rules failed structural validation.',
  true,
);

const firebaseCli = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['--no-install', 'firebase', '--version'],
  { cwd: root, encoding: 'utf8' },
);
add(
  'firestore:cli',
  firebaseCli.status === 0 ? 'pass' : 'warn',
  firebaseCli.status === 0
    ? 'Firebase CLI is installed; deployment syntax can be validated by the manual workflow.'
    : 'Firebase CLI is not a local package; this check is structural. Emulator evidence is reported separately.',
);

const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  mode: staticOnly ? 'static' : 'release',
  summary: {
    pass: checks.filter((check) => check.status === 'pass').length,
    warn: checks.filter((check) => check.status === 'warn').length,
    fail: checks.filter((check) => check.status === 'fail').length,
    criticalFailures: checks.filter(
      (check) => check.status === 'fail' && check.critical,
    ).length,
  },
  checks,
};

function renderMarkdown(value) {
  const lines = [
    '# Firebase readiness report',
    '',
    `Generated: ${value.generatedAt}`,
    '',
    `Mode: ${value.mode}`,
    '',
    `Summary: ${value.summary.pass} pass, ${value.summary.warn} warning, ${value.summary.fail} failure.`,
    '',
    '| Status | Check | Critical | Message |',
    '|---|---|:---:|---|',
  ];
  for (const check of value.checks) {
    lines.push(
      `| ${check.status} | ${check.id} | ${check.critical ? 'yes' : 'no'} | ${check.message.replace(/\|/g, '\\|')} |`,
    );
  }
  return lines.join('\n') + '\n';
}

await mkdir(resolve(root, 'reports'), { recursive: true });
await writeFile(
  resolve(root, 'reports/firebase-readiness.json'),
  JSON.stringify(report, null, 2) + '\n',
  'utf8',
);
await writeFile(
  resolve(root, 'reports/firebase-readiness.md'),
  renderMarkdown(report),
  'utf8',
);

for (const check of checks) {
  const marker = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
  console.log(`[${marker}] ${check.message}`);
}
console.log(
  `Firebase readiness: ${report.summary.pass} passed, ${report.summary.warn} warnings, ${report.summary.fail} failed.`,
);

if (report.summary.criticalFailures > 0) process.exitCode = 1;
