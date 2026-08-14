import { parseHTML } from 'linkedom';
import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';
import { legacyPageNumberForCurrent, legacyTargetIdForCurrent } from './legacyWorkbookMap';
import { hydrateGrids } from '../lib/coordinateGrid';
import { DEFAULT_ANSWER_KEYS } from './answerKey';
import { hydrateChoiceAnswerInputs } from './choiceInputs';
import { hydrateGridAnswerInputs } from './gridInputs';
import {
  hydrateExplicitAuthoringAnswers,
  implicitAnswerKey,
} from './implicitAnswers';
import { isAllowedExpectedAnswer } from './answerValidation';
import { PROVEN_ANSWER_PROOFS } from './provenAnswerKey';
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

/**
 * Targets reviewed against the canonical workbook that intentionally ask the
 * learner to choose, create, explain, or reuse their own prior result. The
 * signature binding prevents a later prompt edit from silently inheriting the
 * reviewed classification.
 */
export const REVIEWED_OPEN_ENDED_TARGET_SIGNATURES: Readonly<
  Record<string, string>
> = {
  'p7-q12': 'e4f4cc55',
  'p7-q13': 'e4f4cc55',
  'p7-q14': 'f952afbf',
  'p11-q20': 'bd0fcb5c',
  'p11-q21': 'bd0fcb5c',
  'p12-q7': '13c747ef',
  'p12-q8': '13c747ef',
  'p12-q9': '13c747ef',
  'p12-q10': '13c747ef',
  'p12-q12': '049b2a05',
  'p12-q13': '049b2a05',
  'p12-q14': '049b2a05',
  'p12-q15': '049b2a05',
  'p12-q16': '9edf80ab',
  'p13-q17': 'bd0fcb5c',
  'p13-q18': 'bd0fcb5c',
  'p15-q3': 'e05dfa65',
  'p15-q4': '714d467f',
  'p15-q9': 'bd0fcb5c',
  'p18-q12': '64aa47f4',
  'p26-q1': 'aad9137b',
  'p26-q2': 'aad9137b',
  'p26-q3': 'aad9137b',
  'p26-q4': 'aad9137b',
  'p26-q5': 'aad9137b',
  'p26-q6': 'aad9137b',
  'p26-q7': 'aad9137b',
  'p26-q8': 'aad9137b',
  'p26-q9': 'aad9137b',
  'p26-q10': 'aad9137b',
  'p26-q11': '39217632',
  'p26-q13': 'dc459768',
  'p26-q17': '36d8976b',
  'p26-q19': '69a80635',
  'p27-q9': 'e6d5c219',
  'p27-q10': 'e6d5c219',
  'p29-q12': '3c53a6a0',
  'p29-q13': '3c53a6a0',
  'p29-q14': '3c53a6a0',
  'p29-q15': '3c53a6a0',
  'p29-q5': '7415af8e',
  'p29-q6': '7415af8e',
  'p29-q7': '7415af8e',
  'p29-q8': '7415af8e',
  'p29-q16': 'bd0fcb5c',
  'p30-q16': 'f406b8ba',
  'p30-q17': 'f406b8ba',
  'p30-q18': 'f406b8ba',
  'p30-q19': 'f406b8ba',
  'p30-q20': '6dd587bb',
  'p30-q21': '6dd587bb',
  'p30-q22': 'ea262254',
  'p33-q5': 'bd0fcb5c',
  'p38-q5': '2dc8e219',
  'p38-q6': '2dc8e219',
  'p38-q7': '2dc8e219',
  'p38-q8': '2dc8e219',
  'p38-q11': '7415af8e',
  'p38-q12': '7415af8e',
  'p38-q13': '7415af8e',
  'p38-q14': '7415af8e',
  'p38-q17': 'bd0fcb5c',
  'p38-q18': 'bd0fcb5c',
  'p39-q14': 'bd0fcb5c',
  'p44-q19': 'bd0fcb5c',
  'p44-q23': '08b44ca7',
  'p44-q24': '08b44ca7',
  'p44-q25': '08b44ca7',
  'p44-q26': '08b44ca7',
  'p44-q28': 'bd0fcb5c',
  'p46-q11': '6b34ed80',
  'p46-q24': 'f22e876f',
  'p46-q25': 'ae0d10d8',
  'p46-q26': 'ae0d10d8',
  'p46-q27': 'ae0d10d8',
  'p46-q28': 'ae0d10d8',
  'p46-q29': 'e7242597',
  'p49-q1': 'b30606ed',
  'p49-q4': 'f659763a',
  'p51-q25': 'bd0fcb5c',
  'p52-q17': '83580dd6',
  'p52-q18': '83580dd6',
  'p52-q19': '83580dd6',
  'p52-q20': '83580dd6',
  'p52-q21': '83580dd6',
  'p52-q22': '83580dd6',
  'p52-q23': '83580dd6',
  'p52-q24': '83580dd6',
  'p52-q25': 'd1ab1133',
  'p52-q26': 'd1ab1133',
  'p52-q27': '669ca6bc',
  'p52-q28': 'a0030abb',
  'p52-q29': 'a0030abb',
  'p52-q30': '41b46d54',
  'p52-q31': '09fb866c',
  'p52-q32': '09fb866c',
  'p52-q33': '5088c967',
  'p52-q34': '66c44584',
  'p52-q35': '66c44584',
  'p52-q36': '488c3659',
  'p53-q7': '8b96c886',
  'p53-q8': '8b96c886',
  'p53-q9': '8b96c886',
  'p53-q10': '8b96c886',
  'p53-q11': '8b96c886',
  'p53-q12': '8b96c886',
  'p53-q13': '8b96c886',
  'p53-q14': '8b96c886',
  'p54-q25': '2d50461b',
  'p55-q10': '4712f361',
  'p55-q11': '08b4e4c4',
  'p57-q6': 'eea1b535',
  'p57-q7': 'eea1b535',
  'p58-q16': 'a1d66f9a',
  'p58-q17': 'fd3086ec',
  'p59-q13': '08de6460',
  'p59-q14': '08de6460',
  'p59-q15': '0bab69c9',
  'p60-q11': 'c9b992da',
  'p60-q12': 'c9b992da',
  'p60-q13': '06808fd5',
  'p61-q11': '25b0ff4b',
  'p61-q12': '25b0ff4b',
  'p61-q13': 'bd15e79d',
  'p61-q14': 'bd15e79d',
  'p61-q15': '75447ec6',
  'p62-q12': '7415af8e',
  'p62-q13': '7415af8e',
  'p62-q14': '7415af8e',
  'p62-q15': '7415af8e',
  'p63-q17': '73ac9493',
  'p64-q13': 'c19d5f79',
  'p68-q1': '06c216c8',
  'p68-q2': '06c216c8',
  'p68-q3': '06c216c8',
  'p68-q4': '06c216c8',
  'p68-q5': '8ea4981a',
  'p68-q6': '6334a3be',
  'p68-q8': '986c6f79',
  'p70-q10': 'dca0bce4',
  'p73-q7': '195c6054',
  'p73-q8': '195c6054',
  'p73-q9': '195c6054',
  'p73-q10': '195c6054',
  'p74-q1': 'd690ded0',
  'p74-q2': 'd690ded0',
  'p74-q3': 'd690ded0',
  'p74-q4': 'd690ded0',
  'p75-q3': '86a530e9',
  'p75-q4': '86a530e9',
  'p75-q5': '6e9d9dae',
  'p75-q6': '6e9d9dae',
  'p75-q9': 'ac7b4206',
  'p75-q10': '1cf23f6a',
  'p75-q12': '082f67a8',
  'p75-q13': '082f67a8',
  'p75-q14': '14626e5e',
  'p76-q4': 'be5c8b3e',
  'p76-q5': 'be5c8b3e',
  'p76-q6': 'be5c8b3e',
  'p76-q7': 'be5c8b3e',
};

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
    'li, tr, .completion-sentence, .calc-ltr, .calc-final, .task-grid > div, .axis-answer-box, h3, p',
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
  lookupTargetId: string,
  context: string,
  signature: string,
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
  const defaultAnswers = (defaults[lookupTargetId] || []).filter(
    isAllowedExpectedAnswer,
  );
  const implicitAnswers = (implicit[targetId] || []).filter(
    isAllowedExpectedAnswer,
  );
  const proofPage = Number(lookupTargetId.match(/^p(\d+)-/)?.[1]);
  const proven = PROVEN_ANSWER_PROOFS[proofPage]?.[lookupTargetId];

  if (defaultAnswers.length > 0) {
    const classification: AnswerClassification = VALID_RANGE_TARGETS.has(lookupTargetId)
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

  if (proven && proven.targetSignature === signature) {
    const answers = proven.answers.filter(isAllowedExpectedAnswer);
    if (answers.length > 0) {
      return {
        classification: proven.classification,
        currentAnswerSource: 'target-bound reviewed proof',
        sourceEvidence: proven.sourceEvidence,
        automaticCheckingSafe: true,
        answers,
      };
    }
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

  const reviewedOpenEndedSignature =
    REVIEWED_OPEN_ENDED_TARGET_SIGNATURES[lookupTargetId];
  if (reviewedOpenEndedSignature === signature || isOpenEnded(context)) {
    return {
      classification: 'open-ended',
      currentAnswerSource: 'teacher judgment required',
      sourceEvidence:
        reviewedOpenEndedSignature === signature
          ? 'signature-bound canonical review: learner-created or dependent response'
          : 'learner-created or explanatory response',
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
    const legacyPage = legacyPageNumberForCurrent(page.n);
    const defaults = DEFAULT_ANSWER_KEYS[legacyPage ?? page.n] || {};
    const targets = elements.map((target, index): AnswerCoverageTarget => {
      const targetId = target.dataset['lmsQid'] || '';
      const context = contextFor(target);
      const inputType = inputTypeFor(target);
      const lookupTargetId = legacyTargetIdForCurrent(targetId);
      const signature = hash(inputType + '\n' + context);
      const details = classify(
        target,
        targetId,
        lookupTargetId,
        context,
        signature,
        defaults,
        implicit,
      );
      return {
        targetId,
        order: index + 1,
        inputType,
        context,
        signature,
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
