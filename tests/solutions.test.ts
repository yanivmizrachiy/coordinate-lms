import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SOLUTION_PAGES, SOLUTION_SPECS } from '../src/data/solutions';
import { WORKBOOK } from '../src/data/workbook';

function gitBlobSha(path: string): string {
  const bytes = readFileSync(path);
  const header = Buffer.from(`blob ${bytes.byteLength}\0`, 'utf8');
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

describe('dynamic solutions', () => {
  it('covers every canonical workbook page exactly once', () => {
    expect(SOLUTION_SPECS).toHaveLength(WORKBOOK.length);
    expect(new Set(SOLUTION_SPECS.map((spec) => spec.source)).size).toBe(WORKBOOK.length);
  });

  it('resolves every solution from the canonical WORKBOOK instead of a stored page number', () => {
    for (const entry of SOLUTION_PAGES) {
      expect(WORKBOOK.includes(entry.page)).toBe(true);
      expect(entry.topic.pages).toContain(entry.page.n);
    }
  });

  it('has no duplicate page sources or exercise ids', () => {
    expect(new Set(SOLUTION_SPECS.map((spec) => spec.source)).size).toBe(SOLUTION_SPECS.length);
    for (const spec of SOLUTION_SPECS) {
      const ids = spec.exercises.map((exercise) => exercise.id);
      expect(new Set(ids).size, spec.sourceFile).toBe(ids.length);
      expect(ids.every(Boolean), spec.sourceFile).toBe(true);
    }
  });

  it('fails when a solved worksheet source or visible poster asset changes without re-verifying its answers', () => {
    for (const spec of SOLUTION_SPECS) {
      expect(gitBlobSha(spec.sourceFile), spec.sourceFile).toBe(spec.sourceBlobSha);
      for (const asset of spec.sourceAssets ?? []) {
        expect(gitBlobSha(asset.path), asset.path).toBe(asset.blobSha);
      }
    }
  });

  it('never publishes an empty answer', () => {
    for (const spec of SOLUTION_SPECS) {
      for (const exercise of spec.exercises) {
        expect(exercise.answer.trim().length, `${spec.sourceFile}#${exercise.id}`).toBeGreaterThan(0);
      }
    }
  });
});
