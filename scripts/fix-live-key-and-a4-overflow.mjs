import { readFile, writeFile } from 'node:fs/promises';

async function read(path) {
  return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
}

const enginePath = 'src/lms/engine.ts';
let engine = await read(enginePath);

const oldChecker = `  function showImmediateCorrectFeedback(
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
  }`;

const newChecker = `  function inlineExpectedAnswers(target: HTMLElement): string[] {
    const raw = target.dataset.lmsAnswers;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === 'string')
        : [];
    } catch {
      return [];
    }
  }

  function showImmediateCorrectFeedback(
    target: HTMLElement,
    qid: string,
  ): boolean {
    const progress = progressFor(qid);
    /* Input can happen before the asynchronous repository key has finished
       loading. Explicit/implicit authoring already places the same reviewed
       answers on the target, so use that safe inline key until the repository
       key arrives. */
    const storedExpected = answerKey[qid] || [];
    const expected = storedExpected.length > 0
      ? storedExpected
      : inlineExpectedAnswers(target);

    if (!acceptImmediateCorrectAnswer(progress, expected)) {
      return false;
    }

    updateTarget(target, progress);
    target.dataset.lmsFeedback = 'correct';
    return true;
  }`;

if (!engine.includes(newChecker)) {
  if (!engine.includes(oldChecker)) throw new Error('engine.ts: live feedback checker anchor missing');
  engine = engine.replace(oldChecker, newChecker);
  await writeFile(enginePath, engine, 'utf8');
}

const cssPath = 'src/styles/workbook.css';
let css = await read(cssPath);
const oldCss = `@media print {
  .sheet.sheet--overflow-tight .sheet-header {
    padding-bottom: 3px;
    margin-bottom: 4px;
  }
  .sheet.sheet--overflow-tight .q-card {
    padding: 5px 8px;
  }
  .sheet.sheet--overflow-tight .q-card h3 {
    margin: -5px -8px 4px;
    padding: 3px 7px;
    min-height: 1.8em;
  }
  .sheet.sheet--overflow-tight .tasks {
    margin-block: 2px;
  }
  .sheet.sheet--overflow-tight .tasks li {
    margin-block: 1px;
  }
  .sheet.sheet--overflow-tight .rule-box,
  .sheet.sheet--overflow-tight .note-box {
    padding: 4px 7px;
    margin-block: 2px 3px;
  }
  .sheet.sheet--overflow-tight .word-bank {
    padding: 3px 7px;
    margin-block: 2px 3px;
  }
  .sheet.sheet--overflow-tight .calc-pair,
  .sheet.sheet--overflow-tight .choice-row {
    margin-block: 1px 2px;
  }
  .sheet.sheet--overflow-tight .sheet-content {
    padding-bottom: 13mm;
  }
}`;
const newCss = `.sheet.sheet--overflow-tight .sheet-header {
  padding-bottom: 3px;
  margin-bottom: 4px;
}
.sheet.sheet--overflow-tight .q-card {
  padding: 5px 8px;
}
.sheet.sheet--overflow-tight .q-card h3 {
  margin: -5px -8px 4px;
  padding: 3px 7px;
  min-height: 1.8em;
}
.sheet.sheet--overflow-tight .tasks {
  margin-block: 2px;
}
.sheet.sheet--overflow-tight .tasks li {
  margin-block: 1px;
}
.sheet.sheet--overflow-tight .rule-box,
.sheet.sheet--overflow-tight .note-box {
  padding: 4px 7px;
  margin-block: 2px 3px;
}
.sheet.sheet--overflow-tight .word-bank {
  padding: 3px 7px;
  margin-block: 2px 3px;
}
.sheet.sheet--overflow-tight .calc-pair,
.sheet.sheet--overflow-tight .choice-row {
  margin-block: 1px 2px;
}
.sheet.sheet--overflow-tight .sheet-content {
  padding-bottom: 13mm;
}`;
if (!css.includes(newCss)) {
  if (!css.includes(oldCss)) throw new Error('workbook.css: adaptive overflow block anchor missing');
  css = css.replace(oldCss, newCss);
  await writeFile(cssPath, css, 'utf8');
}

console.log('Live-key fallback and A4 overflow recovery updated.');
