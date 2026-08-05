import { readFile, writeFile } from 'node:fs/promises';

async function patch(path, replacements) {
  let text = await readFile(path, 'utf8');
  for (const [before, after] of replacements) {
    if (!text.includes(before)) {
      throw new Error(`${path}: expected patch anchor not found: ${before.slice(0, 100)}`);
    }
    text = text.replace(before, after);
  }
  await writeFile(path, text, 'utf8');
}

await patch('src/lms/answerCoverage.ts', [
  [
    "import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';\n",
    "import { WORKBOOK, TOTAL_PAGES } from '../data/workbook';\nimport { legacyPageNumberForCurrent, legacyTargetIdForCurrent } from './legacyWorkbookMap';\n",
  ],
  [
    "  targetId: string,\n  context: string,",
    "  targetId: string,\n  lookupTargetId: string,\n  context: string,",
  ],
  [
    "  const defaultAnswers = (defaults[targetId] || []).filter(\n",
    "  const defaultAnswers = (defaults[lookupTargetId] || []).filter(\n",
  ],
  [
    "  const proven = PROVEN_ANSWER_PROOFS[Number(targetId.match(/^p(\\d+)-/)?.[1])]\n    ?.[targetId];\n",
    "  const proofPage = Number(lookupTargetId.match(/^p(\\d+)-/)?.[1]);\n  const proven = PROVEN_ANSWER_PROOFS[proofPage]?.[lookupTargetId];\n",
  ],
  [
    "    const classification: AnswerClassification = VALID_RANGE_TARGETS.has(targetId)\n",
    "    const classification: AnswerClassification = VALID_RANGE_TARGETS.has(lookupTargetId)\n",
  ],
  [
    "    REVIEWED_OPEN_ENDED_TARGET_SIGNATURES[targetId];\n",
    "    REVIEWED_OPEN_ENDED_TARGET_SIGNATURES[lookupTargetId];\n",
  ],
  [
    "    const implicit = implicitAnswerKey(page.n);\n    const defaults = DEFAULT_ANSWER_KEYS[page.n] || {};\n",
    "    const implicit = implicitAnswerKey(page.n);\n    const legacyPage = legacyPageNumberForCurrent(page.n);\n    const defaults = DEFAULT_ANSWER_KEYS[legacyPage ?? page.n] || {};\n",
  ],
  [
    "      const context = contextFor(target);\n      const inputType = inputTypeFor(target);\n",
    "      const context = contextFor(target);\n      const inputType = inputTypeFor(target);\n      const lookupTargetId = legacyTargetIdForCurrent(targetId);\n",
  ],
  [
    "        targetId,\n        context,\n",
    "        targetId,\n        lookupTargetId,\n        context,\n",
  ],
]);

await patch('tests/workbook.test.ts', [
  ["import { GAMES } from '../src/games';\n", ''],
  ["has pages numbered 1..77 with no holes (worksheets + games interleaved)", "has pages numbered 1..78 with no holes"],
  ['expect(TOTAL_PAGES).toBe(77);', 'expect(TOTAL_PAGES).toBe(78);'],
  ['for (let n = 1; n <= 77; n++)', 'for (let n = 1; n <= 78; n++)'],
  ['Array.from({ length: 77 }, (_, i) => i + 1)', 'Array.from({ length: 78 }, (_, i) => i + 1)'],
  [
    "  it('every game is a numbered page exactly once, in a topic', () => {\n    for (const g of GAMES) {\n      const hosts = WORKBOOK.filter((p) => p.gameId === g.id);\n      expect(hosts.length, `game ${g.id}`).toBe(1);\n      expect(hosts[0]!.html, `game ${g.id} host`).toContain(`data-game-host=\"${g.id}\"`);\n    }\n  });",
    "  it('no numbered page hosts a runtime game', () => {\n    for (const page of WORKBOOK) {\n      expect(page.html, `page ${page.n}`).not.toContain('data-game-host');\n    }\n  });",
  ],
  ['Array.from({ length: 77 }, (_, i) => i + 1)', 'Array.from({ length: 78 }, (_, i) => i + 1)'],
]);

await patch('tests/layout-rules.test.ts', [
  [
    "WORKBOOK.find((p) => p.title.includes('שיעור x'))",
    "WORKBOOK.find((p) => p.title.includes('שיעור x') || p.subtitle.includes('שיעור x'))",
  ],
]);

await patch('tests/answer-coverage.test.ts', [
  [
    "import { PROVEN_ANSWER_PROOFS } from '../src/lms/provenAnswerKey';\n",
    "import { PROVEN_ANSWER_PROOFS } from '../src/lms/provenAnswerKey';\nimport { currentTargetIdForLegacy } from '../src/lms/legacyWorkbookMap';\n",
  ],
  ["represents every workbook page from 1 through 77", "represents every workbook page from 1 through 78"],
  ['expect(report.pages).toHaveLength(77);', 'expect(report.pages).toHaveLength(78);'],
  ['Array.from({ length: 77 }, (_, index) => index + 1)', 'Array.from({ length: 78 }, (_, index) => index + 1)'],
  [
    "    expect(proofs).toHaveLength(735);\n    for (const [targetId, proof] of proofs) {\n      const target = targets.get(targetId);",
    "    expect(proofs).toHaveLength(735);\n    let retainedProofs = 0;\n    for (const [targetId, proof] of proofs) {\n      const currentTargetId = currentTargetIdForLegacy(targetId);\n      if (!currentTargetId) continue;\n      retainedProofs += 1;\n      const target = targets.get(currentTargetId);",
  ],
  [
    "      expect(proof.sourceEvidence, targetId).toMatch(/^src\\/data\\/workbook\\/pages\\//);\n    }\n  });",
    "      expect(proof.sourceEvidence, targetId).toMatch(/^src\\/data\\/workbook\\/pages\\//);\n    }\n    expect(retainedProofs).toBeGreaterThan(650);\n  });",
  ],
  [
    "    expect(Object.keys(REVIEWED_OPEN_ENDED_TARGET_SIGNATURES)).toHaveLength(161);\n    for (const [targetId, signature] of Object.entries(\n      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,\n    )) {\n      const target = targets.get(targetId);",
    "    expect(Object.keys(REVIEWED_OPEN_ENDED_TARGET_SIGNATURES)).toHaveLength(161);\n    let retainedOpenEnded = 0;\n    for (const [targetId, signature] of Object.entries(\n      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,\n    )) {\n      const currentTargetId = currentTargetIdForLegacy(targetId);\n      if (!currentTargetId) continue;\n      retainedOpenEnded += 1;\n      const target = targets.get(currentTargetId);",
  ],
  [
    "      expect(target?.automaticCheckingSafe, targetId).toBe(false);\n    }\n  });",
    "      expect(target?.automaticCheckingSafe, targetId).toBe(false);\n    }\n    expect(retainedOpenEnded).toBeGreaterThan(140);\n  });",
  ],
]);

for (const path of ['README.md', 'RULES.md']) {
  let text = await readFile(path, 'utf8');
  text = text.replaceAll('77 עמודים', '78 עמודים');
  text = text.replaceAll('77-page', '78-page');
  await writeFile(path, text, 'utf8');
}

console.log('Workbook synchronization migration patches applied.');
