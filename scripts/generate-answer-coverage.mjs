import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const jsonPath = resolve(root, 'reports', 'answer-coverage.json');
const markdownPath = resolve(root, 'reports', 'answer-coverage.md');
const orderPath = resolve(root, 'reports', 'answer-target-order.json');
const check = process.argv.includes('--check');

async function existingGeneratedAt() {
  if (!check) return new Date().toISOString();
  try {
    const current = JSON.parse(await readFile(jsonPath, 'utf8'));
    return typeof current.generatedAt === 'string'
      ? current.generatedAt
      : '1970-01-01T00:00:00.000Z';
  } catch {
    return '1970-01-01T00:00:00.000Z';
  }
}

const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const coverage = await server.ssrLoadModule('/src/lms/answerCoverage.ts');
  const report = coverage.buildAnswerCoverageReport(
    await existingGeneratedAt(),
  );
  const order = coverage.answerTargetOrderSnapshot(report);
  const outputs = [
    [jsonPath, JSON.stringify(report, null, 2) + '\n'],
    [markdownPath, coverage.renderAnswerCoverageMarkdown(report)],
    [orderPath, JSON.stringify(order, null, 2) + '\n'],
  ];

  if (check) {
    const changed = [];
    for (const [path, expected] of outputs) {
      let actual = '';
      try {
        actual = await readFile(path, 'utf8');
      } catch {
        // Missing reports are drift too.
      }
      if (actual !== expected) changed.push(path);
    }
    if (changed.length > 0) {
      console.error('Answer coverage is stale. Run npm run answers:coverage.');
      for (const path of changed) console.error('- ' + path);
      process.exitCode = 1;
    }
  } else {
    for (const [path, value] of outputs) await writeFile(path, value, 'utf8');
    console.log(
      `Answer coverage: ${report.automaticallyCheckableTargets}/${report.targetCount} (${report.coveragePercentage}%) across ${report.pageCount} pages.`,
    );
  }
} finally {
  await server.close();
}
