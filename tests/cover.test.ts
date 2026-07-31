import { describe, it, expect } from 'vitest';
import { statSync } from 'node:fs';
import { APPROVED_COVER } from '../src/data/cover';

describe('approved workbook cover', () => {
  it('points at assets/covers/workbook-cover.png', () => {
    expect(APPROVED_COVER.file).toBe('workbook-cover.png');
    expect(APPROVED_COVER.src).toContain('assets/covers/workbook-cover.png');
  });

  it('the artwork is committed to the repo', () => {
    const png = new URL('../public/assets/covers/workbook-cover.png', import.meta.url);
    expect(statSync(png).size).toBeGreaterThan(10_000);
  });
});
