import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const jsonPath = resolve(root, 'reports', 'answer-coverage.json');
const markdownPath = resolve(root, 'reports', 'answer-coverage.md');
const orderPath = resolve(root, 'reports', 'answer-target-order.json');
const reviewManifestPath = resolve(root, 'public', 'answer-review-manifest.json');
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

function isHiddenRuntimeGroupProxy(target) {
  return target.inputType === 'text:text' &&
    target.currentAnswerSource === 'explicit canonical authoring label' &&
    target.sourceEvidence === 'aria-label/data-lms-answers' &&
    target.answers.some((answer) => answer.startsWith('predicate:'));
}

function recalculateCoverage(report) {
  for (const page of report.pages) {
    page.targetIds = page.targets.map((target) => target.targetId);
    page.interactiveTargetCount = page.targets.length;
    const safe = page.targets.filter((target) => target.automaticCheckingSafe).length;
    page.automaticallyCheckableTargets = safe;
    page.missingOrAmbiguousTargetIds = page.targets
      .filter((target) => !target.automaticCheckingSafe)
      .map((target) => target.targetId);
    page.coveragePercentage = page.targets.length === 0
      ? 100
      : Math.round((safe / page.targets.length) * 1000) / 10;
  }

  const allTargets = report.pages.flatMap((page) => page.targets);
  const safe = allTargets.filter((target) => target.automaticCheckingSafe).length;
  report.targetCount = allTargets.length;
  report.automaticallyCheckableTargets = safe;
  report.coveragePercentage = allTargets.length === 0
    ? 100
    : Math.round((safe / allTargets.length) * 1000) / 10;
  report.classifications = Object.fromEntries(
    Object.keys(report.classifications).map((classification) => [
      classification,
      allTargets.filter((target) => target.classification === classification).length,
    ]),
  );
  return report;
}

function applyRuntimePredicateCoverage(report, resolveRule) {
  for (const page of report.pages) {
    for (const target of page.targets) {
      if (target.automaticCheckingSafe) continue;
      const resolved = resolveRule(
        target.context,
        target.inputType,
        page.pageNumber,
        target.targetId,
      );
      if (!resolved) continue;
      target.classification = 'deterministic-mathematical';
      target.currentAnswerSource = 'runtime mathematical predicate';
      target.sourceEvidence = `${resolved.source}:${resolved.rule}`;
      target.automaticCheckingSafe = true;
      target.answers = [`predicate:${resolved.rule}`];
    }

    page.targets = page.targets.filter((target) => !isHiddenRuntimeGroupProxy(target));
  }

  return recalculateCoverage(report);
}

const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const coverage = await server.ssrLoadModule('/src/lms/answerCoverage.ts');
  const predicates = await server.ssrLoadModule('/src/lms/digitalPredicates.ts');
  const segments = await server.ssrLoadModule('/src/lms/digitalSegmentPredicates.ts');
  const grouped = await server.ssrLoadModule('/src/lms/groupCoverageBindings.ts');
  const report = applyRuntimePredicateCoverage(
    coverage.buildAnswerCoverageReport(await existingGeneratedAt()),
    (context, inputType, pageNumber, targetId) => {
      const generalRule = predicates.predicateRuleForCoverage(context, inputType);
      if (generalRule) {
        return {
          rule: generalRule,
          source: 'src/lms/digitalPredicates.ts',
        };
      }
      const segmentRule = segments.segmentPredicateRuleForCoverage(
        context,
        inputType,
        pageNumber,
        targetId,
      );
      if (segmentRule) {
        return {
          rule: segmentRule,
          source: 'src/lms/digitalSegmentPredicates.ts',
        };
      }
      const groupedRule = grouped.canonicalGroupRuleForCoverage(pageNumber, targetId);
      return groupedRule
        ? {
            rule: groupedRule,
            source: 'src/lms/digitalPredicates.ts',
          }
        : null;
    },
  );
  const order = coverage.answerTargetOrderSnapshot(report);
  const reviewManifest = {
    schemaVersion: 2,
    generatedAt: report.generatedAt,
    pageCount: report.pageCount,
    targetCount: report.targetCount,
    pages: report.pages.map((page) => ({
      pageNumber: page.pageNumber,
      title: page.title,
      targets: page.targets.map((target) => ({
        pageNumber: page.pageNumber,
        targetId: target.targetId,
        signature: target.signature,
        inputType: target.inputType,
        classification: target.classification,
        sourceEvidence: target.sourceEvidence,
        automaticCheckingSafe: target.automaticCheckingSafe,
        answers: target.answers,
        context: target.context,
      })),
    })),
  };
  const outputs = [
    [jsonPath, JSON.stringify(report, null, 2) + '\n'],
    [markdownPath, coverage.renderAnswerCoverageMarkdown(report)],
    [orderPath, JSON.stringify(order, null, 2) + '\n'],
    [reviewManifestPath, JSON.stringify(reviewManifest, null, 2) + '\n'],
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
