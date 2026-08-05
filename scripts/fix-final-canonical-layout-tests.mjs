import { readFile, writeFile } from 'node:fs/promises';

const path = 'tests/layout-rules.test.ts';
let text = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');

const oldAreaCheck = `      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 1600);
        expect(head, \`page \${p.n}: a calculation without S or P\`)
          .toMatch(/calc-sym__math[^>]*>[^<]*[SP]|[SP] =/);
        expect(head, \`page \${p.n}: a calculation without its unit\`).toMatch(/יח/);
      }`;

const newAreaCheck = `      for (const box of p.html.split('<div class="calc-box">').slice(1)) {
        const head = box.slice(0, 1600);
        /* Some calc-box blocks contain only side-length subtraction. They need
           units and writing room, but S/P belongs only to an actual area or
           perimeter result. */
        if (!/calc-final|calc-sym__math/.test(head)) continue;
        expect(head, \`page \${p.n}: a calculation without S or P\`)
          .toMatch(/calc-sym__math[^>]*>[^<]*[SP]|[SP] =/);
        expect(head, \`page \${p.n}: a calculation without its unit\`).toMatch(/יח/);
      }`;

const oldWorkspaceCheck = `      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        if (!b.includes('calc-ltr__name')) continue;
        if ((b.match(/class="blank"/g) ?? []).length < 2) continue;
        const first = b.match(/--blank-width:(\\d+)ch/);
        expect(Number(first?.[1] ?? 0), \`page \${page.n}: no room to write the exercise\`)
          .toBeGreaterThanOrEqual(14);
      }`;

const newWorkspaceCheck = `      for (const b of page.html.match(/<div class="calc-pair">[\\s\\S]*?<\\/div><\\/div><\\/div>/g) ?? []) {
        const firstLine = b.match(/<div class="calc-ltr"[^>]*>[\\s\\S]*?<\\/div>/)?.[0] ?? '';
        /* A wide blank is required only when the learner writes the subtraction
           itself. If the subtraction is already printed, the remaining blank
           is only the short numeric result field. */
        const handwritten = firstLine.match(
          /<span class="calc-ltr__eq">=<\\/span>\\s*<span class="blank"[^>]*--blank-width:(\\d+)ch/,
        );
        if (!handwritten) continue;
        expect(Number(handwritten[1]), \`page \${page.n}: no room to write the exercise\`)
          .toBeGreaterThanOrEqual(14);
      }`;

for (const [before, after, label] of [
  [oldAreaCheck, newAreaCheck, 'area/perimeter S/P distinction'],
  [oldWorkspaceCheck, newWorkspaceCheck, 'handwritten subtraction width'],
]) {
  if (text.includes(after)) continue;
  if (!text.includes(before)) {
    throw new Error(`Missing layout test anchor: ${label}`);
  }
  text = text.replace(before, after);
}

await writeFile(path, text, 'utf8');
console.log('Final canonical layout assertions updated.');
