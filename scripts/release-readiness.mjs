import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const reports = resolve(root, 'reports');
const staticOnly = process.argv.includes('--static');
const allowedStatuses = new Set(['pass', 'warning', 'failure', 'blocked']);

async function json(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

function domain(id, label, status, summary, evidence = [], blockers = []) {
  if (!allowedStatuses.has(status)) throw new Error(`Invalid status: ${status}`);
  return { id, label, status, summary, evidence, blockers };
}

const firebaseRun = spawnSync(
  process.execPath,
  [resolve(root, 'scripts', 'firebase-readiness.mjs'), ...(staticOnly ? ['--static'] : [])],
  { cwd: root, encoding: 'utf8' },
);
if (firebaseRun.stdout) process.stdout.write(firebaseRun.stdout);
if (firebaseRun.stderr) process.stderr.write(firebaseRun.stderr);

const answerCoverage = await json(resolve(reports, 'answer-coverage.json'));
const reviewManifest = await json(
  resolve(root, 'public', 'answer-review-manifest.json'),
);
const firebaseReadiness = await json(resolve(reports, 'firebase-readiness.json'));
const emulator = await json(resolve(reports, 'firestore-emulator.json'));
const physical = await json(resolve(reports, 'two-device-acceptance.json'));
const packageJson = await json(resolve(root, 'package.json'));
const ci = existsSync(resolve(root, '.github', 'workflows', 'ci.yml'))
  ? await readFile(resolve(root, '.github', 'workflows', 'ci.yml'), 'utf8')
  : '';
const diffCheck = spawnSync('git', ['diff', '--check'], {
  cwd: root,
  encoding: 'utf8',
});

const repositoryChecks = [
  existsSync(resolve(root, 'RULES.md')),
  answerCoverage?.pageCount === 78,
  answerCoverage?.targetCount === reviewManifest?.targetCount,
  answerCoverage?.generatedAt === reviewManifest?.generatedAt,
  packageJson?.scripts?.['test:firestore'] ===
    'node scripts/run-firestore-emulator-tests.mjs',
  ci.includes('actions/setup-java@v5'),
  ci.includes('npm run test:firestore'),
  diffCheck.status === 0,
];
const repositoryPass = repositoryChecks.every(Boolean);
const domains = [
  domain(
    'repository-engineering',
    'Repository engineering gates',
    repositoryPass ? 'pass' : 'failure',
    repositoryPass
      ? 'The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent.'
      : 'One or more repository contracts or generated artifacts are missing or inconsistent.',
    [
      'RULES.md',
      'reports/answer-coverage.json',
      'public/answer-review-manifest.json',
      '.github/workflows/ci.yml',
      'git diff --check',
    ],
    repositoryPass ? [] : ['Repair repository contract failures before review.'],
  ),
];

const emulatorContractFiles = [
  'firestore.rules',
  'firebase.json',
  'vitest.emulator.config.ts',
  'tests/firestore-emulator.test.ts',
];
const emulatorContractHash = createHash('sha256');
for (const path of emulatorContractFiles) {
  emulatorContractHash.update(path);
  emulatorContractHash.update('\0');
  emulatorContractHash.update(await readFile(resolve(root, path)));
  emulatorContractHash.update('\0');
}
const currentEmulatorContract = emulatorContractHash.digest('hex');
const emulatorPass =
  emulator?.status === 'pass' &&
  emulator?.projectId === 'demo-coordinate-lms' &&
  emulator?.firebaseCli === '15.25.1' &&
  emulator?.contractSha256 === currentEmulatorContract;
domains.push(
  domain(
    'emulator-validation',
    'Firestore emulator-backed validation',
    emulatorPass ? 'pass' : 'failure',
    emulatorPass
      ? 'Real Firestore operations passed against the demo project with the pinned Firebase CLI.'
      : 'No current passing Firestore emulator result is available.',
    emulatorPass
      ? [
          `suite: ${emulator.suite}`,
          `generatedAt: ${emulator.generatedAt}`,
          `Firebase CLI: ${emulator.firebaseCli}`,
          `contract SHA-256: ${emulator.contractSha256}`,
        ]
      : ['reports/firestore-emulator.json'],
    emulatorPass ? [] : ['Run npm run test:firestore with Java 21.'],
  ),
);

const firebaseChecks = Array.isArray(firebaseReadiness?.checks)
  ? firebaseReadiness.checks
  : [];
const firebaseEvidenceMissing = !firebaseReadiness || firebaseChecks.length === 0;
const firebaseStructuralFailure = firebaseEvidenceMissing || firebaseChecks.some(
  (check) =>
    check.status === 'fail' &&
    !String(check.id).startsWith('runtime:') &&
    check.id !== 'actions:service-account',
);
const firebaseMissing = firebaseChecks.filter(
  (check) => check.status !== 'pass' && check.id !== 'firestore:cli',
);
const firebaseStatus = firebaseStructuralFailure
  ? 'failure'
  : firebaseMissing.length > 0
    ? 'blocked'
    : firebaseChecks.some((check) => check.status === 'warn')
      ? 'warning'
      : 'pass';
domains.push(
  domain(
    'external-firebase',
    'External Firebase configuration and deployment',
    firebaseStatus,
    firebaseStatus === 'pass'
      ? 'Required runtime settings, GitHub configuration, and repository Firebase checks are present.'
      : firebaseStatus === 'failure'
        ? 'Firebase readiness evidence is missing or a repository-side contract failed.'
        : 'Repository validation cannot supply console settings, service-account configuration, or deployment evidence.',
    [`reports/firebase-readiness.json (${firebaseReadiness?.mode || 'missing'})`],
    firebaseMissing.map((check) => check.message),
  ),
);

const safelyCheckable = Number(answerCoverage?.automaticallyCheckableTargets || 0);
const targetCount = Number(answerCoverage?.targetCount || 0);
const answerTargets = Array.isArray(answerCoverage?.pages)
  ? answerCoverage.pages.flatMap((page) =>
      Array.isArray(page?.targets) ? page.targets : [],
    )
  : [];
const reviewedOpenEnded = answerTargets.filter(
  (target) =>
    target?.classification === 'open-ended' &&
    String(target?.sourceEvidence || '').startsWith('signature-bound'),
).length;
const unresolvedReview = Math.max(
  0,
  targetCount - safelyCheckable - reviewedOpenEnded,
);
const pedagogicalPass = targetCount > 0 && unresolvedReview === 0;
domains.push(
  domain(
    'pedagogical-review',
    'Pedagogical answer-key review',
    pedagogicalPass ? 'pass' : targetCount > 0 ? 'blocked' : 'failure',
    targetCount > 0
      ? `${String(safelyCheckable)}/${String(targetCount)} targets are safely auto-checkable; ${String(reviewedOpenEnded)} are signature-bound open-ended tasks; ${String(unresolvedReview)} remain unresolved.`
      : 'Answer coverage evidence is missing or invalid.',
    ['reports/answer-coverage.json', 'public/answer-review-manifest.json'],
    pedagogicalPass
      ? []
      : [
          `Resolve ${String(unresolvedReview)} targets in the answer-review studio without guessing.`,
        ],
  ),
);

const physicalPass =
  physical?.schemaVersion === 1 &&
  physical?.status === 'pass' &&
  typeof physical?.testedAt === 'string' &&
  physical?.testedAt.length > 0 &&
  typeof physical?.commit === 'string' &&
  physical?.commit.length >= 7 &&
  Array.isArray(physical?.devices) &&
  physical.devices.length >= 2 &&
  Array.isArray(physical?.checks) &&
  physical.checks.length > 0 &&
  physical.checks.every((check) => check.status === 'pass');
const physicalFailure = physical?.status === 'failure';
domains.push(
  domain(
    'physical-acceptance',
    'Physical two-device classroom acceptance',
    physicalPass ? 'pass' : physicalFailure ? 'failure' : 'blocked',
    physicalPass
      ? 'Recorded student-device and teacher-device acceptance evidence passes.'
      : physicalFailure
        ? 'A recorded physical acceptance run failed.'
        : 'No passing real student-phone and separate teacher-computer acceptance record exists.',
    physical ? ['reports/two-device-acceptance.json'] : [],
    physicalPass
      ? []
      : ['Run docs/CLASSROOM_LAUNCH_CHECKLIST.md and record the result.'],
  ),
);

const overallStatus = domains.some((item) => item.status === 'failure')
  ? 'failure'
  : domains.some((item) => item.status === 'blocked')
    ? 'blocked'
    : domains.some((item) => item.status === 'warning')
      ? 'warning'
      : 'pass';
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: staticOnly ? 'static' : 'release',
  status: overallStatus,
  releaseReady: overallStatus === 'pass',
  domains,
};

const lines = [
  '# Classroom release-readiness contract',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  `Mode: ${report.mode}`,
  '',
  `Overall status: **${report.status}**`,
  '',
  '| Domain | Status | Summary |',
  '|---|---|---|',
  ...domains.map(
    (item) =>
      `| ${item.label} | ${item.status} | ${item.summary.replace(/\|/g, '\\|')} |`,
  ),
  '',
];
for (const item of domains) {
  lines.push(`## ${item.label}`, '', `Status: **${item.status}**`, '', item.summary, '');
  if (item.evidence.length > 0) {
    lines.push('Evidence:', '', ...item.evidence.map((value) => `- ${value}`), '');
  }
  if (item.blockers.length > 0) {
    lines.push('Blockers:', '', ...item.blockers.map((value) => `- ${value}`), '');
  }
}

await writeFile(
  resolve(reports, 'release-readiness.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
await writeFile(
  resolve(reports, 'release-readiness.md'),
  `${lines.join('\n').trimEnd()}\n`,
  'utf8',
);

for (const item of domains) {
  console.log(`[${item.status.toUpperCase()}] ${item.label}: ${item.summary}`);
}
console.log(`Release readiness: ${overallStatus}.`);

if (staticOnly) {
  if (domains.some((item) => item.status === 'failure')) process.exitCode = 1;
} else if (!report.releaseReady) {
  process.exitCode = 1;
}
