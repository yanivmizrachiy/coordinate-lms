import { readFile, writeFile } from 'node:fs/promises';

function replaceBetween(text, start, end, replacement, label) {
  const startAt = text.indexOf(start);
  if (startAt < 0) throw new Error(`Missing start marker for ${label}`);
  const endAt = text.indexOf(end, startAt + start.length);
  if (endAt < 0) throw new Error(`Missing end marker for ${label}`);
  return text.slice(0, startAt) + replacement + text.slice(endAt);
}

async function load(path) {
  return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
}

let answers = await load('tests/answer-coverage.test.ts');
if (!answers.includes('let staleProofs = 0;')) {
  answers = replaceBetween(
    answers,
    '    let retainedProofs = 0;',
    "  test('binds reviewed open-ended targets to the current canonical prompt'",
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
    expect(retainedProofs).toBeGreaterThan(580);
    expect(staleProofs).toBeGreaterThan(0);
  });

`,
    'reviewed proof migration',
  );

  answers = replaceBetween(
    answers,
    '    let retainedOpenEnded = 0;',
    "  test('accepts the new exact coordinate proofs and rejects nearby values'",
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
    expect(staleOpenEnded).toBeGreaterThan(0);
  });

`,
    'open-ended signature migration',
  );
  await writeFile('tests/answer-coverage.test.ts', answers, 'utf8');
} else {
  console.log('tests/answer-coverage.test.ts: already patched.');
}

let layout = await load('tests/layout-rules.test.ts');
if (!layout.includes('const insideCalcBox = (html: string, index: number)')) {
  layout = replaceBetween(
    layout,
    '        const body = card',
    '        const kinds =',
`        const body = card
          .replace(/<div class="calc-box">[\\s\\S]*?<\\/section>/g, ' ')
          .replace(/<div class="calc-final[^"]*">[\\s\\S]*?<\\/div>\\s*<\\/div>/g, ' ')
          .replace(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g, ' ')
          .replace(/<div class="calc-ltr"[\\s\\S]*?<\\/div>/g, ' ');
`,
    'completion-kind calculation exclusion',
  );

  layout = replaceBetween(
    layout,
    '      for (const f of p.html.matchAll(',
    '      /* Room to work',
`      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 1600);
        if (!/calc-final|calc-sym__math/.test(head)) continue;
        expect(head, \`page \${p.n}: a calculation without S or P\`)
          .toMatch(/calc-sym__math[^>]*>[^<]*[SP]|[SP] =/);
        expect(head, \`page \${p.n}: a calculation without its unit\`).toMatch(/יח/);
      }
`,
    'canonical calculation symbols',
  );

  layout = layout.replace(
    '/answer-line|calc-ltr/.test(head)',
    '/answer-line|calc-ltr|calc-squared/.test(head)',
  );

  layout = replaceBetween(
    layout,
    "  it('an area or perimeter is never asked as a loose blank'",
    "  it('a sheet that asks for a calculation leaves space to do it'",
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

`,
    'loose area/perimeter answer detection',
  );

  layout = replaceBetween(
    layout,
    "  it('every exercise leaves room to write the subtraction'",
    "  it('every calculation line carries its units'",
`  it('every exercise leaves room to write the subtraction', () => {
    for (const page of WORKBOOK) {
      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        const firstLine = b.match(/<div class="calc-ltr"[^>]*>[\\s\\S]*?<\\/div>/)?.[0] ?? '';
        const handwritten = firstLine.match(
          /<span class="calc-ltr__eq">=<\\/span>\\s*<span class="blank"[^>]*--blank-width:(\\d+)ch/,
        );
        if (!handwritten) continue;
        expect(Number(handwritten[1]), \`page \${page.n}: no room to write the exercise\`)
          .toBeGreaterThanOrEqual(14);
      }
    }
  });

`,
    'handwritten subtraction workspace',
  );

  await writeFile('tests/layout-rules.test.ts', layout, 'utf8');
} else {
  console.log('tests/layout-rules.test.ts: already patched.');
}

console.log('Canonical synchronization test expectations patched.');
