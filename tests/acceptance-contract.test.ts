import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const template = JSON.parse(
  readFileSync('docs/two-device-acceptance.template.json', 'utf8'),
) as {
  status?: string;
  devices?: Array<{ role?: string; details?: string }>;
  checks?: Array<{ id?: string; status?: string; notes?: string }>;
};
const validator = readFileSync(
  'scripts/validate-two-device-acceptance.mjs',
  'utf8',
);
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};

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

describe('strict physical acceptance contract', () => {
  it('keeps all ten classroom acceptance checks in the evidence template', () => {
    expect(template.checks?.map((check) => check.id)).toEqual(REQUIRED_CHECK_IDS);
    expect(template.checks?.every((check) => check.status === 'blocked')).toBe(true);
  });

  it('requires distinct student-phone and teacher-computer evidence roles', () => {
    expect(template.devices?.map((device) => device.role)).toEqual([
      'student-phone',
      'teacher-computer',
    ]);
  });

  it('keeps strict validation in front of both release report modes', () => {
    expect(packageJson.scripts?.['acceptance:check']).toBe(
      'node scripts/validate-two-device-acceptance.mjs',
    );
    expect(packageJson.scripts?.['release:report']).toBe(
      'npm run acceptance:check && node scripts/release-readiness.mjs',
    );
    expect(packageJson.scripts?.['release:report:static']).toBe(
      'npm run acceptance:check && node scripts/release-readiness.mjs --static',
    );
  });

  it('validator requires every check id and non-empty evidence notes for pass', () => {
    for (const id of REQUIRED_CHECK_IDS) {
      expect(validator).toContain(`'${id}'`);
    }
    expect(validator).toContain("check.status !== 'pass'");
    expect(validator).toContain('check.notes');
    expect(validator).toContain('student-phone');
    expect(validator).toContain('teacher-computer');
    expect(validator).toContain('firebaseProjectId');
    expect(validator).toContain('40-character deployed commit SHA');
  });
});
