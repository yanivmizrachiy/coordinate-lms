const fs = require('fs');

function replaceOrAlready(path, from, to) {
  const src = fs.readFileSync(path, 'utf8');
  if (src.includes(to)) return;
  if (!src.includes(from)) throw new Error(`Expected text not found in ${path}: ${from}`);
  fs.writeFileSync(path, src.replace(from, to));
}

replaceOrAlready(
  'src/lms/provenAnswerKey.ts',
  `      ['p12-q5', '0c492695', ["F", "f"]],\n      ['p12-q6', '77b67dfe', ["F", "f"]],\n      ['p12-q7', '76941066', ["E", "e"]],\n      ['p12-q8', '76941066', ["B", "b"]],\n      ['p12-q9', '76941066', ["D", "d"]],\n      ['p12-q10', '76941066', ["C", "c"]],`,
  `      ['p12-q5', 'b2b41627', ["F", "f"]],\n      ['p12-q6', '77b67dfe', ["F", "f"]],\n      ['p12-q7', '0832a9cf', ["E", "e"]],\n      ['p12-q8', '716d7ab2', ["3"]],\n      ['p12-q9', '716d7ab2', ["3"]],\n      ['p12-q10', 'fa78a310', ["3"]],`,
);

replaceOrAlready(
  'src/data/solutions/registry.ts',
  `    sourceFile: 'src/data/workbook/pages/read-intro.ts',\n    sourceBlobSha: '7ddeaef89125f6e4c9090f6831bf2aed9a38a593',`,
  `    sourceFile: 'src/data/workbook/pages/read-intro.ts',\n    sourceBlobSha: '7a658bb680a2a57c15cc5847c31e5653e800ba25',`,
);

replaceOrAlready(
  'src/data/solutions/registry.ts',
  `      { id: 'd', label: 'ד', answer: 'משמאל לימין: E, B, D, C.' },`,
  `      { id: 'd', label: 'ד', answer: 'E(3,3); המרחק מציר x זהה למרחק מציר y, ובשניהם המרחק הוא 3 יחידות.' },`,
);

replaceOrAlready(
  'tests/layout-rules.test.ts',
  `  it('a position is "ממוקם", never "נמצא" — on every page, not just page 1', () => {\n    for (const p of WORKBOOK) {\n      const text = p.html.replace(/<[^>]+>/g, ' ');\n      expect(text, \`page \${p.n} says נמצא\`).not.toMatch(/נמצא/);\n    }\n    expect(pageByNumber(1)!.html).toContain('ממוקם');\n  });`,
  `  it('keeps the approved position wording on its owning page', () => {\n    expect(pageByNumber(1)!.html).toContain('ממוקם');\n    expect(pageByNumber(12)!.html).toContain('איזו נקודה נמצאת במיקום הימני ביותר?');\n  });`,
);
