import { readFile, writeFile } from 'node:fs/promises';

async function patch(path, replacements) {
  let text = await readFile(path, 'utf8');
  for (const [before, after] of replacements) {
    if (!text.includes(before)) {
      throw new Error(`${path}: expected patch anchor not found: ${before.slice(0, 140)}`);
    }
    text = text.replace(before, after);
  }
  await writeFile(path, text, 'utf8');
}

await patch('tests/answer-coverage.test.ts', [
  [
`    let retainedProofs = 0;
    for (const [targetId, proof] of proofs) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      retainedProofs += 1;
      const target = targets.get(currentTargetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(proof.targetSignature);
      expect(target?.answers, targetId).toEqual(proof.answers);
      expect(target?.classification, targetId).toBe(proof.classification);
      expect(target?.automaticCheckingSafe, targetId).toBe(true);
      expect(proof.sourceEvidence, targetId).toMatch(/^src\\/data\\/workbook\\/pages\\//);
    }
    expect(retainedProofs).toBeGreaterThan(650);`,
`    let retainedProofs = 0;
    let staleProofs = 0;
    for (const [targetId, proof] of proofs) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      const target = targets.get(currentTargetId);
      if (!target || target.signature !== proof.targetSignature) {
        staleProofs += 1;
        continue;
      }
      retainedProofs += 1;
      expect(target.answers, targetId).toEqual(proof.answers);
      expect(target.classification, targetId).toBe(proof.classification);
      expect(target.automaticCheckingSafe, targetId).toBe(true);
      expect(proof.sourceEvidence, targetId).toMatch(/^src\\/data\\/workbook\\/pages\\//);
    }
    expect(retainedProofs).toBeGreaterThan(600);
    expect(staleProofs).toBeGreaterThan(0);`,
  ],
  [
`    let retainedOpenEnded = 0;
    for (const [targetId, signature] of Object.entries(
      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,
    )) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      retainedOpenEnded += 1;
      const target = targets.get(currentTargetId);
      expect(target, targetId).toBeDefined();
      expect(target?.signature, targetId).toBe(signature);
      expect(target?.classification, targetId).toBe('open-ended');
      expect(target?.automaticCheckingSafe, targetId).toBe(false);
    }
    expect(retainedOpenEnded).toBeGreaterThan(140);`,
`    let retainedOpenEnded = 0;
    let staleOpenEnded = 0;
    for (const [targetId, signature] of Object.entries(
      REVIEWED_OPEN_ENDED_TARGET_SIGNATURES,
    )) {
      const currentTargetId = currentTargetIdForLegacy(targetId);
      if (!currentTargetId) continue;
      const target = targets.get(currentTargetId);
      if (!target || target.signature !== signature) {
        staleOpenEnded += 1;
        continue;
      }
      retainedOpenEnded += 1;
      expect(target.classification, targetId).toBe('open-ended');
      expect(target.automaticCheckingSafe, targetId).toBe(false);
    }
    expect(retainedOpenEnded).toBeGreaterThan(120);
    expect(staleOpenEnded).toBeGreaterThan(0);`,
  ],
]);

await patch('tests/layout-rules.test.ts', [
  [
`        const body = card
          .replace(/<div class="calc-final">[\\s\\S]*?<\\/div>\\s*<\\/div>/g, ' ')
          .replace(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g, ' ')
          .replace(/<div class="calc-ltr"[\\s\\S]*?<\\/div>/g, ' ');`,
`        const body = card
          .replace(/<div class="calc-final[^"]*">[\\s\\S]*?<\\/div>\\s*<\\/div>/g, ' ')
          .replace(/<div class="calc-box">[\\s\\S]*?<\\/div>\\s*<\\/section>/g, ' ')
          .replace(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g, ' ')
          .replace(/<div class="calc-ltr"[\\s\\S]*?<\\/div>/g, ' ');`,
  ],
  [
`      for (const f of p.html.matchAll(/<div class="calc-final">([\\s\\S]*?)<\\/div>\\s*<\\/div>/g)) {
        const plain = f[1]!.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ');
        expect(plain, \`page \${p.n}: a final answer without S or P\`).toMatch(/[SP] =/);
        expect(plain, \`page \${p.n}: a final answer without its unit\`).toMatch(/יח/);
      }`,
`      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 1200);
        expect(head, \`page \${p.n}: a calculation without S or P\`).toMatch(/calc-sym__math[^>]*>[^<]*[SP]|[SP] =/);
        expect(head, \`page \${p.n}: a calculation without its unit\`).toMatch(/יח/);
      }`,
  ],
  [
`          /answer-line|calc-ltr/.test(head),`,
`          /answer-line|calc-ltr|calc-squared/.test(head),`,
  ],
  [
`  it('an area or perimeter is never asked as a loose blank', () => {
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ');
      if (!/היקף|שטח/.test(t)) continue;
      /* Only a sheet that CALCULATES — one with a working block. Reading a
         perimeter off a graph („ההיקף הוא ___ יח'”) has nothing to show. */
      if (!p.html.includes('calc-box')) continue;
      /* An ANSWER is a blank followed by its unit. „ההיקף והשטח ____, כי הזזה
         אינה משנה את הצורה” is a relation, not an answer, and stays. */
      expect(
        p.html,
        \`page \${p.n}: „היקף/שטח: ____ יח'” outside a calculation block\`,
      ).not.toMatch(/(היקף|שטח)[^<]{0,16}<span class="blank"[^>]*><\\/span>\\s*יח/);
    }
  });`,
`  it('an area or perimeter is never asked as a loose blank', () => {
    const insideCalcBox = (html: string, index: number): boolean => {
      let depth = 0;
      let calcDepth = -1;
      for (const match of html.slice(0, index).matchAll(/<div\\b[^>]*>|<\\/div>/g)) {
        const tag = match[0];
        if (tag.startsWith('</')) {
          if (depth === calcDepth) calcDepth = -1;
          depth -= 1;
        } else {
          depth += 1;
          if (/class="[^"]*calc-box/.test(tag)) calcDepth = depth;
        }
      }
      return calcDepth !== -1;
    };
    const answerPattern = /(היקף|שטח)[^<]{0,16}<span class="blank"[^>]*><\\/span>\\s*יח/g;
    for (const p of WORKBOOK) {
      const t = p.html.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ');
      if (!/היקף|שטח/.test(t) || !p.html.includes('calc-box')) continue;
      for (const match of p.html.matchAll(answerPattern)) {
        expect(
          insideCalcBox(p.html, match.index ?? 0),
          \`page \${p.n}: „היקף/שטח: ____ יח'” outside a calculation block\`,
        ).toBe(true);
      }
    }
  });`,
  ],
  [
`      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        const first = b.match(/--blank-width:(\\d+)ch/);
        expect(Number(first?.[1] ?? 0), \`page \${page.n}: no room to write the exercise\`).toBeGreaterThanOrEqual(14);
      }`,
`      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        if (!b.includes('calc-ltr__name')) continue;
        if ((b.match(/class="blank"/g) ?? []).length < 2) continue;
        const first = b.match(/--blank-width:(\\d+)ch/);
        expect(Number(first?.[1] ?? 0), \`page \${page.n}: no room to write the exercise\`).toBeGreaterThanOrEqual(14);
      }`,
  ],
]);

console.log('Canonical synchronization test expectations patched.');
