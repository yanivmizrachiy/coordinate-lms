import { parseHTML } from 'linkedom';
import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';
import { hydrateGrids } from '../lib/coordinateGrid';
import { DEFAULT_ANSWER_KEYS } from './answerKey';
import { hydrateChoiceAnswerInputs } from './choiceInputs';
import { hydrateGridAnswerInputs } from './gridInputs';
import {
  hydrateExplicitAuthoringAnswers,
  implicitAnswerKey,
} from './implicitAnswers';
import { isAllowedExpectedAnswer } from './answerValidation';
import type { AnswerKey } from './types';

export const ANSWER_CLASSIFICATIONS = [
  'reviewed-explicit',
  'canonical-metadata-derived',
  'deterministic-mathematical',
  'valid-range',
  'open-ended',
  'ambiguous',
  'unsupported',
  'missing',
] as const;

export type AnswerClassification =
  (typeof ANSWER_CLASSIFICATIONS)[number];

export interface AnswerCoverageTarget {
  targetId: string;
  order: number;
  inputType: string;
  classification: AnswerClassification;
  currentAnswerSource: string;
  sourceEvidence: string;
  automaticCheckingSafe: boolean;
  answers: string[];
  context: string;
  signature: string;
}

export interface AnswerCoveragePage {
  pageNumber: number;
  title: string;
  interactiveTargetCount: number;
  targetIds: string[];
  targets: AnswerCoverageTarget[];
  missingOrAmbiguousTargetIds: string[];
  automaticallyCheckableTargets: number;
  coveragePercentage: number;
}

export interface AnswerCoverageReport {
  version: 1;
  generatedAt: string;
  pageCount: number;
  targetCount: number;
  automaticallyCheckableTargets: number;
  coveragePercentage: number;
  classifications: Record<AnswerClassification, number>;
  pages: AnswerCoveragePage[];
}

export interface AnswerTargetOrderSnapshot {
  version: 1;
  pages: Array<{
    pageNumber: number;
    targets: Array<{
      targetId: string;
      inputType: string;
      signature: string;
    }>;
  }>;
}

const TARGET_SELECTOR = '.blank, .word-blank, .pair-blank';
const VALID_RANGE_TARGETS = new Set([
  'p3-q10',
  'p3-q11',
  'p3-q12',
  'p3-q13',
  'p3-q14',
  'p3-q15',
]);

function hash(value: string): string {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }
  return (result >>> 0).toString(16).padStart(8, '0');
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function contextFor(target: HTMLElement): string {
  const source = target.closest(
    'li, tr, .completion-sentence, .calc-ltr, .calc-final, h3, p',
  ) || target.parentElement;

  if (!source) return '';
  const clone = source.cloneNode(true) as HTMLElement;
  for (const blank of clone.querySelectorAll<HTMLElement>(TARGET_SELECTOR)) {
    blank.textContent = '[…]';
  }
  return cleanText(clone.textContent || '');
}

function inputTypeFor(target: HTMLElement): string {
  if (target.classList.contains('lms-choice-proxy')) return 'true-false';
  if (target.classList.contains('lms-grid-answer')) {
    return 'coordinate-grid:' + (target.dataset['gridAnswer'] || 'unknown');
  }
  if (target.classList.contains('pair-blank')) {
    return 'ordered-pair-coordinate';
  }
  if (target.classList.contains('word-blank')) {
    return 'word:' + (target.dataset['missing'] || 'text');
  }
  if (target.classList.contains('blank')) {
    return 'text:' + (target.dataset['missing'] || 'text');
  }
  return 'unsupported';
}

function isOpenEnded(context: string): boolean {
  return /משלכם|שסימנתם|שבחרתם|הנתונים שלכם|הסבירו|ההסבר|נמקו|דוגמה משלכם/.test(
    context,
  );
}

function classify(
  target: HTMLElement,
  targetId: string,
  context: string,
  defaults: AnswerKey,
  implicit: AnswerKey,
): Pick<
  AnswerCoverageTarget,
  | 'classification'
  | 'currentAnswerSource'
  | 'sourceEvidence'
  | 'automaticCheckingSafe'
  | 'answers'
> {
  const defaultAnswers = (defaults[targetId] || []).filter(
    isAllowedExpectedAnswer,
  );
  const implicitAnswers = (implicit[targetId] || []).filter(
    isAllowedExpectedAnswer,
  );

  if (defaultAnswers.length > 0) {
    const classification: AnswerClassification = VALID_RANGE_TARGETS.has(targetId)
      ? 'valid-range'
      : 'reviewed-explicit';
    return {
      classification,
      currentAnswerSource: 'built-in reviewed answer key',
      sourceEvidence: 'src/lms/answerKey.ts',
      automaticCheckingSafe: true,
      answers: defaultAnswers,
    };
  }

  if (implicitAnswers.length > 0) {
    const gridKind = target.dataset['gridAnswer'];
    const classification: AnswerClassification = gridKind
      ? 'deterministic-mathematical'
      : 'canonical-metadata-derived';
    return {
      classification,
      currentAnswerSource: gridKind
        ? 'coordinate-grid mathematical metadata'
        : target.classList.contains('lms-choice-proxy')
          ? 'canonical true/false row metadata'
          : 'explicit canonical authoring label',
      sourceEvidence: gridKind
        ? 'data-grid-answer=' + gridKind
        : target.classList.contains('lms-choice-proxy')
          ? 'tr[data-answer]'
          : 'aria-label/data-lms-answers',
      automaticCheckingSafe: true,
      answers: implicitAnswers,
    };
  }

  if (inputTypeFor(target) === 'unsupported') {
    return {
      classification: 'unsupported',
      currentAnswerSource: 'none',
      sourceEvidence: 'unrecognized interactive control',
      automaticCheckingSafe: false,
      answers: [],
    };
  }

  if (isOpenEnded(context)) {
    return {
      classification: 'open-ended',
      currentAnswerSource: 'teacher judgment required',
      sourceEvidence: 'learner-created or explanatory response',
      automaticCheckingSafe: false,
      answers: [],
    };
  }

  return {
    classification: 'ambiguous',
    currentAnswerSource: 'none',
    sourceEvidence:
      'no explicit canonical metadata or reviewed mathematical proof',
    automaticCheckingSafe: false,
    answers: [],
  };
}

function installDom(html: string): Document {
  const parsed = parseHTML('<!doctype html><html><body>' + html + '</body></html>');
  const domWindow = parsed.window as unknown as Window & typeof globalThis;
  Object.assign(globalThis, {
    document: parsed.document,
    window: domWindow,
    MutationObserver: domWindow.MutationObserver,
    HTMLElement: domWindow.HTMLElement,
    SVGElement: domWindow.SVGElement,
    requestAnimationFrame: () => 0,
  });
  return parsed.document;
}

export function buildAnswerCoverageReport(
  generatedAt = new Date().toISOString(),
): AnswerCoverageReport {
  const pages: AnswerCoveragePage[] = [];

  for (const page of WORKBOOK) {
    const document = installDom(page.html);
    hydrateGrids(document);
    hydrateGridAnswerInputs(document);
    const cleanupChoices = hydrateChoiceAnswerInputs(document);
    hydrateExplicitAuthoringAnswers(document);

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
    );
    elements.forEach((target, index) => {
      target.dataset['lmsQid'] =
        'p' + String(page.n) + '-q' + String(index + 1);
    });

    const implicit = implicitAnswerKey(page.n);
    const defaults = DEFAULT_ANSWER_KEYS[page.n] || {};
    const targets = elements.map((target, index): AnswerCoverageTarget => {
      const targetId = target.dataset['lmsQid'] || '';
      const context = contextFor(target);
      const inputType = inputTypeFor(target);
      const details = classify(
        target,
        targetId,
        context,
        defaults,
        implicit,
      );
      return {
        targetId,
        order: index + 1,
        inputType,
        context,
        signature: hash(inputType + '\n' + context),
        ...details,
      };
    });
    cleanupChoices();

    const safe = targets.filter((target) => target.automaticCheckingSafe).length;
    pages.push({
      pageNumber: page.n,
      title: page.title,
      interactiveTargetCount: targets.length,
      targetIds: targets.map((target) => target.targetId),
      targets,
      missingOrAmbiguousTargetIds: targets
        .filter((target) => !target.automaticCheckingSafe)
        .map((target) => target.targetId),
      automaticallyCheckableTargets: safe,
      coveragePercentage:
        targets.length === 0 ? 100 : Math.round((safe / targets.length) * 1000) / 10,
    });
  }

  const allTargets = pages.flatMap((page) => page.targets);
  const safe = allTargets.filter((target) => target.automaticCheckingSafe).length;
  const classifications = Object.fromEntries(
    ANSWER_CLASSIFICATIONS.map((classification) => [
      classification,
      allTargets.filter((target) => target.classification === classification).length,
    ]),
  ) as Record<AnswerClassification, number>;

  return {
    version: 1,
    generatedAt,
    pageCount: TOTAL_PAGES,
    targetCount: allTargets.length,
    automaticallyCheckableTargets: safe,
    coveragePercentage:
      allTargets.length === 0 ? 100 : Math.round((safe / allTargets.length) * 1000) / 10,
    classifications,
    pages,
  };
}

export function answerTargetOrderSnapshot(
  report: AnswerCoverageReport,
): AnswerTargetOrderSnapshot {
  return {
    version: 1,
    pages: report.pages.map((page) => ({
      pageNumber: page.pageNumber,
      targets: page.targets.map((target) => ({
        targetId: target.targetId,
        inputType: target.inputType,
        signature: target.signature,
      })),
    })),
  };
}

export function renderAnswerCoverageMarkdown(
  report: AnswerCoverageReport,
): string {
  const lines = [
    '# Answer-key coverage report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Overall: ${report.automaticallyCheckableTargets}/${report.targetCount} safely checkable targets (${report.coveragePercentage}%).`,
    '',
    '## Classification totals',
    '',
    '| Classification | Targets |',
    '|---|---:|',
    ...ANSWER_CLASSIFICATIONS.map(
      (classification) => `| ${classification} | ${report.classifications[classification]} |`,
    ),
    '',
    '## Pages',
    '',
  ];

  for (const page of report.pages) {
    lines.push(
      `### Page ${page.pageNumber} — ${page.title}`,
      '',
      `${page.automaticallyCheckableTargets}/${page.interactiveTargetCount} safely checkable (${page.coveragePercentage}%).`,
      '',
    );
    if (page.targets.length === 0) {
      lines.push('No detected interactive response targets.', '');
      continue;
    }
    lines.push(
      '| Target | Input | Classification | Safe | Source | Context |',
      '|---|---|---|:---:|---|---|',
    );
    for (const target of page.targets) {
      const context = target.context.replace(/\|/g, '\\|');
      lines.push(
        `| ${target.targetId} | ${target.inputType} | ${target.classification} | ${target.automaticCheckingSafe ? 'yes' : 'no'} | ${target.currentAnswerSource} | ${context} |`,
      );
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}
