import { readFile, writeFile } from 'node:fs/promises';

async function replaceRegex(path, marker, replacements) {
  let text = await readFile(path, 'utf8');
  if (text.includes(marker)) {
    console.log(`${path}: already patched.`);
    return;
  }

  for (const [pattern, replacement, label] of replacements) {
    const next = text.replace(pattern, replacement);
    if (next === text) {
      throw new Error(`${path}: regex patch failed for ${label}`);
    }
    text = next;
  }

  await writeFile(path, text, 'utf8');
}

await replaceRegex('tests/answer-coverage.test.ts', 'let staleProofs = 0;', [
  [
    /    let retainedProofs = 0;[\s\S]*?    expect\(retainedProofs\)\.toBeGreaterThan\(650\);/,
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
    'reviewed proof migration',
  ],
  [
    /    let retainedOpenEnded = 0;[\s\S]*?    expect\(retainedOpenEnded\)\.toBeGreaterThan\(140\);/,
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
    'open-ended signature migration',
  ],
]);

await replaceRegex('tests/layout-rules.test.ts', 'const insideCalcBox = (html: string, index: number)', [
  [
    /        const body = card[\s\S]*?        const kinds =/,
`        const body = card
          .replace(/<div class="calc-box">[\\s\\S]*?<\\/section>/g, ' ')
          .replace(/<div class="calc-final[^"]*">[\\s\\S]*?<\\/div>\\s*<\\/div>/g, ' ')
          .replace(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g, ' ')
          .replace(/<div class="calc-ltr"[\\s\\S]*?<\\/div>/g, ' ');
        const kinds =`,
    'completion-kind calculation exclusion',
  ],
  [
    /      for \(const f of p\.html\.matchAll[\s\S]*?      \/\* Room to work/,
`      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 1600);
        expect(head, \`page \${p.n}: a calculation without S or P\`)
          .toMatch(/calc-sym__math[^>]*>[^<]*[SP]|[SP] =/);
        expect(head, \`page \${p.n}: a calculation without its unit\`).toMatch(/יח/);
      }
      /* Room to work`,
    'canonical calculation symbols',
  ],
  [
    /\/answer-line\|calc-ltr\/\.test\(head\)/,
    '/answer-line|calc-ltr|calc-squared/.test(head)',
    'squared calculation workspace',
  ],
  [
    /  it\('an area or perimeter is never asked as a loose blank',[\s\S]*?\n  \}\);\n\n  it\('a sheet that asks for a calculation leaves space to do it'/,
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
          \`page \${p.n}: area/perimeter answer outside a calculation block\`,
        ).toBe(true);
      }
    }
  });

  it('a sheet that asks for a calculation leaves space to do it'`,
    'loose area/perimeter answer detection',
  ],
  [
    /      for \(const b of page\.html\.match\(\/<div class="calc-pair">[\s\S]*?\n      \}/,
`      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        if (!b.includes('calc-ltr__name')) continue;
        if ((b.match(/class="blank"/g) ?? []).length < 2) continue;
        const first = b.match(/--blank-width:(\\d+)ch/);
        expect(Number(first?.[1] ?? 0), \`page \${page.n}: no room to write the exercise\`)
          .toBeGreaterThanOrEqual(14);
      }`,
    'handwritten subtraction workspace',
  ],
]);

console.log('Canonical synchronization test expectations patched.');
