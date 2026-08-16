import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, relative, join } from 'node:path';

const sourceRoot = resolve(process.argv[2] || '.canonical-print-source');
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const lock = JSON.parse(
  readFileSync(join(repoRoot, 'canonical-print-source.lock.json'), 'utf8'),
);

function git(args) {
  return execFileSync('git', ['-C', sourceRoot, ...args], { encoding: 'utf8' }).trim();
}

function normalize(value) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function filesRecursively(root) {
  const out = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) out.push(...filesRecursively(full));
    else out.push(full);
  }
  return out;
}

const actualHead = git(['rev-parse', 'HEAD']);
const verifiedCommit = String(lock.verifiedCommit || '');
if (!/^[0-9a-f]{40}$/.test(verifiedCommit)) {
  throw new Error('canonical-print-source.lock.json has no valid verifiedCommit');
}

if (actualHead !== verifiedCommit) {
  const relevant = git([
    'diff', '--name-only', `${verifiedCommit}..${actualHead}`, '--',
    'src/data/workbook',
    'src/styles/workbook.css',
    'src/styles/grayscale.css',
    'src/lib/coordinateGrid.ts',
    'src/lib/coordinateMath.ts',
    'public/assets',
  ]).split('\n').filter(Boolean);

  if (relevant.length > 0) {
    throw new Error(
      `Canonical printable source changed since ${verifiedCommit}. ` +
      `Synchronize the LMS digital twin before updating the lock. Changed canonical files: ${relevant.join(', ')}`,
    );
  }
}

const canonicalPages = join(sourceRoot, 'src/data/workbook/pages');
const lmsPages = join(repoRoot, 'src/data/workbook/pages');
const canonicalFiles = filesRecursively(canonicalPages)
  .map((file) => relative(canonicalPages, file))
  .sort();
const lmsFiles = filesRecursively(lmsPages)
  .map((file) => relative(lmsPages, file))
  .sort();

if (JSON.stringify(canonicalFiles) !== JSON.stringify(lmsFiles)) {
  const canonicalSet = new Set(canonicalFiles);
  const lmsSet = new Set(lmsFiles);
  const missing = canonicalFiles.filter((file) => !lmsSet.has(file));
  const extra = lmsFiles.filter((file) => !canonicalSet.has(file));
  throw new Error(
    `Printable/LMS page-file set drift. Missing in LMS: ${missing.join(', ') || 'none'}; ` +
    `LMS-only: ${extra.join(', ') || 'none'}`,
  );
}

const mismatched = [];
for (const file of canonicalFiles) {
  const canonical = normalize(readFileSync(join(canonicalPages, file), 'utf8'));
  const lms = normalize(readFileSync(join(lmsPages, file), 'utf8'));
  if (canonical !== lms) mismatched.push(file);
}

if (mismatched.length > 0) {
  throw new Error(
    `Printable/LMS page content or layout markup drift detected: ${mismatched.join(', ')}`,
  );
}

console.log(
  `Canonical printable synchronization passed: ${canonicalFiles.length} page-source files are identical at ${actualHead}.`,
);
