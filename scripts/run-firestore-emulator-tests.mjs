import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const firebaseCli = '15.25.1';
const projectId = 'demo-coordinate-lms';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const testCommand = 'vitest run --config vitest.emulator.config.ts';
const startedAt = new Date();
const contractFiles = [
  'firestore.rules',
  'firebase.json',
  'vitest.emulator.config.ts',
  'tests/firestore-emulator.test.ts',
  'tests/firestore-reset-retry-emulator.test.ts',
];
const contractHash = createHash('sha256');
for (const path of contractFiles) {
  contractHash.update(path);
  contractHash.update('\0');
  contractHash.update(readFileSync(resolve(path)));
  contractHash.update('\0');
}
const result = spawnSync(
  npx,
  [
    '--yes',
    `firebase-tools@${firebaseCli}`,
    'emulators:exec',
    '--only',
    'firestore',
    '--project',
    projectId,
    process.platform === 'win32' ? `\"${testCommand}\"` : testCommand,
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);
const passed = result.status === 0;
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  startedAt: startedAt.toISOString(),
  projectId,
  firebaseCli,
  status: passed ? 'pass' : 'failure',
  suite: 'tests/firestore-emulator.test.ts + tests/firestore-reset-retry-emulator.test.ts',
  contractFiles,
  contractSha256: contractHash.digest('hex'),
  exitCode: result.status,
};

writeFileSync(
  resolve('reports', 'firestore-emulator.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
