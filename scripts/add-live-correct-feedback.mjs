import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/lms/engine.ts';
let text = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');

if (text.includes("from './liveFeedback'")) {
  console.log('Immediate LMS correctness feedback is already connected.');
  process.exit(0);
}

const replacements = [
  [
    "import { answersMatch } from './answerValidation';\n",
    "import { answersMatch } from './answerValidation';\nimport { acceptImmediateCorrectAnswer } from './liveFeedback';\n",
    'live feedback import',
  ],
  [
`  function rememberOutcome(
    operation: 'draft' | 'result',`,
`  function showImmediateCorrectFeedback(
    target: HTMLElement,
    qid: string,
  ): boolean {
    const progress = progressFor(qid);
    const expected = answerKey[qid] || [];

    if (!acceptImmediateCorrectAnswer(progress, expected)) {
      return false;
    }

    updateTarget(target, progress);
    target.dataset.lmsFeedback = 'correct';
    return true;
  }

  function rememberOutcome(
    operation: 'draft' | 'result',`,
    'positive-only live checker',
  ],
  [
`      const progress = progressFor(qid);
      progress.answer = targetValue(target);
      progress.correct = false;

      if (!progress.locked) {
        target.dataset.lmsState = progress.answer
          ? 'filled'
          : 'empty';
      }
`,
`      const progress = progressFor(qid);
      progress.answer = targetValue(target);

      if (!progress.locked && !progress.correct) {
        const accepted = showImmediateCorrectFeedback(target, qid);
        if (!accepted) {
          target.dataset.lmsState = progress.answer
            ? 'filled'
            : 'empty';
        }
      }
`,
    'input-time positive feedback',
  ],
  [
`    for (const target of targets) {
      const qid = target.dataset.lmsQid;

      if (!qid) continue;

      const progress = progressFor(qid);

      if (progress.answer) {
        setTargetValue(target, progress.answer);
      }

      updateTarget(target, progress);
    }

    if (draft.score !== undefined) {`,
`    let restoredCorrectAnswer = false;

    for (const target of targets) {
      const qid = target.dataset.lmsQid;

      if (!qid) continue;

      const progress = progressFor(qid);

      if (progress.answer) {
        setTargetValue(target, progress.answer);
      }

      if (
        !draft.submitted &&
        showImmediateCorrectFeedback(target, qid)
      ) {
        restoredCorrectAnswer = true;
      } else {
        updateTarget(target, progress);
      }
    }

    if (restoredCorrectAnswer) scheduleSave();

    if (draft.score !== undefined) {`,
    'restored-answer feedback',
  ],
];

for (const [before, after, label] of replacements) {
  if (!text.includes(before)) {
    throw new Error(`Could not find engine anchor for ${label}.`);
  }
  text = text.replace(before, after);
}

await writeFile(path, text, 'utf8');
console.log('Immediate LMS correctness feedback connected.');
