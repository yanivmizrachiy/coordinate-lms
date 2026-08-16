import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const reportPath = resolve(root, 'reports', 'two-device-acceptance.json');

const REQUIRED_CHECK_IDS = [
  'guest-open-practice',
  'guest-no-persistence',
  'guest-transfer',
  'attempts-survive-reload',
  'offline-reconnect-truth',
  'teacher-central-snapshot',
  'registered-data-attribution',
  'utf8-csv',
  'duplicate-submit-idempotency',
  'canonical-parity',
];

function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

if (!existsSync(reportPath)) {
  console.log('[BLOCKED] No physical two-device acceptance report exists yet.');
  process.exit(0);
}

let report;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch {
  fail('reports/two-device-acceptance.json is not valid JSON.');
  process.exit(1);
}

if (report?.status !== 'pass') {
  console.log(`[${String(report?.status || 'blocked').toUpperCase()}] Physical acceptance is not claiming pass; strict pass evidence is not evaluated yet.`);
  process.exit(0);
}

if (report?.schemaVersion !== 1) {
  fail('Physical acceptance pass evidence must use schemaVersion 1.');
}

if (!nonEmptyString(report?.testedAt) || Number.isNaN(Date.parse(report.testedAt))) {
  fail('Physical acceptance pass evidence requires a valid testedAt timestamp.');
}

if (
  !nonEmptyString(report?.firebaseProjectId) ||
  /^demo(?:-|$)/i.test(report.firebaseProjectId.trim())
) {
  fail('Physical acceptance pass evidence requires a real non-demo Firebase project ID.');
}

if (!nonEmptyString(report?.commit) || !/^[0-9a-f]{40}$/i.test(report.commit.trim())) {
  fail('Physical acceptance pass evidence requires the full 40-character deployed commit SHA.');
}

if (
  !Array.isArray(report?.testers) ||
  report.testers.length === 0 ||
  report.testers.some((tester) => !nonEmptyString(tester))
) {
  fail('Physical acceptance pass evidence requires at least one named tester.');
}

if (!Array.isArray(report?.devices) || report.devices.length < 2) {
  fail('Physical acceptance pass evidence requires at least two separate devices.');
} else {
  const roles = new Set(
    report.devices
      .map((device) =>
        typeof device === 'object' && device !== null
          ? String(device.role || '').trim()
          : '',
      )
      .filter(Boolean),
  );
  if (!roles.has('student-phone')) {
    fail('Physical acceptance pass evidence requires a device with role student-phone.');
  }
  if (!roles.has('teacher-computer')) {
    fail('Physical acceptance pass evidence requires a separate device with role teacher-computer.');
  }
  for (const device of report.devices) {
    if (
      typeof device !== 'object' ||
      device === null ||
      !nonEmptyString(device.role) ||
      !nonEmptyString(device.details)
    ) {
      fail('Every physical acceptance device entry requires non-empty role and details.');
      break;
    }
  }
}

if (!Array.isArray(report?.checks)) {
  fail('Physical acceptance pass evidence requires a checks array.');
} else {
  const byId = new Map();
  for (const check of report.checks) {
    if (!nonEmptyString(check?.id)) {
      fail('Every physical acceptance check requires an id.');
      continue;
    }
    if (byId.has(check.id)) {
      fail(`Physical acceptance check ${check.id} is duplicated.`);
    }
    byId.set(check.id, check);
  }

  for (const id of REQUIRED_CHECK_IDS) {
    const check = byId.get(id);
    if (!check) {
      fail(`Required physical acceptance check ${id} is missing.`);
      continue;
    }
    if (check.status !== 'pass') {
      fail(`Required physical acceptance check ${id} is not pass.`);
    }
    if (!nonEmptyString(check.notes)) {
      fail(`Required physical acceptance check ${id} needs non-empty evidence notes.`);
    }
  }
}

if (!process.exitCode) {
  console.log('[PASS] Physical two-device acceptance contains complete strict pass evidence.');
}
