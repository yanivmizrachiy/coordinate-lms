import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/* An empty answer box used to be a bare bordered square with nothing on it —
   on a phone, where the whole A4 sheet is scaled down, it read as a blank
   button. The practice layer now writes a faint TYPE hint inside an empty box
   (a number, a word, an axis letter) so the learner knows what to type. The
   hint is derived from the sheet's own `data-missing` metadata, never from a
   second answer source, and never names the actual answer. These checks keep
   that promise true as pages and the engine change. */

const engine = readFileSync(new URL('../src/lms/engine.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/lms.css', import.meta.url), 'utf8');
const pagesDir = new URL('../src/data/workbook/pages/', import.meta.url);

/* The hint vocabulary: a closed set of generic Hebrew KIND words. „אות" (a
   letter), „מספר" (a number), „מילה" (a word). None of these is ever a real
   answer on a coordinate sheet, which is exactly why they are safe to show. */
const HINT_VOCABULARY = ['אות', 'מספר', 'מילה'];

const hintMapBlock = /ANSWER_HINT_BY_KIND[^{]*\{([\s\S]*?)\}/.exec(engine)?.[1] ?? '';
/* Object keys may be ordinary identifiers (`letter`) or quoted metadata names
   (`'x-order'`). Parse both so this guard follows the real object syntax rather
   than accidentally banning a valid canonical data-missing name. */
const hintKinds = [...hintMapBlock.matchAll(/(?:'([^']+)'|(\w+))\s*:/g)]
  .map((m) => m[1] ?? m[2]!)
  .filter(Boolean);
const hintValues = [...hintMapBlock.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]!);

describe('empty answer boxes show a non-revealing type hint', () => {
  it('parses the hint map from the engine', () => {
    expect(hintKinds.length, 'ANSWER_HINT_BY_KIND did not parse').toBeGreaterThan(0);
    expect(hintValues.length).toBe(hintKinds.length);
  });

  it('maps every data-missing kind used anywhere in the book to a hint', () => {
    const usedKinds = new Set<string>();
    for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.ts'))) {
      const src = readFileSync(new URL(file, pagesDir), 'utf8');
      for (const m of src.matchAll(/data-missing="([^"]+)"/g)) usedKinds.add(m[1]!);
    }
    expect(usedKinds.size, 'no data-missing blanks found at all').toBeGreaterThan(0);
    const unmapped = [...usedKinds].filter((k) => !hintKinds.includes(k));
    expect(unmapped, `data-missing kinds with no answer hint: ${unmapped.join(', ')}`).toEqual([]);
  });

  it('only ever shows a generic KIND word, never a concrete answer', () => {
    for (const value of hintValues) {
      expect(HINT_VOCABULARY, `hint "${value}" is not a generic kind word`).toContain(value);
    }
  });

  it('derives the hint from canonical metadata on the target itself', () => {
    /* The hint comes off the blank's own data-missing attribute (or an explicit
       .word-blank), so it can never drift from the content or invent an answer. */
    expect(engine).toContain('target.dataset.missing');
    expect(engine).toMatch(/dataset\.lmsHint\s*=/);
  });

  it('shows the hint only while the box is still empty', () => {
    expect(css).toMatch(/\[data-lms-hint\]\[data-lms-state="empty"\]::before/);
    expect(css).toContain('content: attr(data-lms-hint)');
  });

  it('never prints the hint', () => {
    const printBlock = /@media print\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(printBlock, 'lms.css has no @media print block').not.toBe('');
    expect(printBlock).toContain('[data-lms-hint]::before');
  });
});
