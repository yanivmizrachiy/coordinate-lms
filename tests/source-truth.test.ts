import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = new URL('..', import.meta.url).pathname;

function text(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8');
}

function collectTextFiles(path: string): string[] {
  const absolute = join(ROOT, path);
  if (!existsSync(absolute)) return [];
  if (!statSync(absolute).isDirectory()) return [path];

  return readdirSync(absolute).flatMap((name) => {
    const child = join(path, name);
    const full = join(ROOT, child);
    if (statSync(full).isDirectory()) return collectTextFiles(child);
    return /\.(?:ts|tsx|js|mjs|cjs|md|json|yml|yaml|css|html)$/.test(name) ? [child] : [];
  });
}

describe('single source of truth guard', () => {
  it('makes RULES.md explicitly define the printable workbook as the one-to-one visual/content source', () => {
    const rules = text('RULES.md');
    expect(rules).toContain('single and only source of truth');
    expect(rules).toContain('one-to-one digital twin');
    expect(rules).toContain('visually and structurally reproduce the printable page one-to-one');
    expect(rules).toContain('Any future change in the canonical printable source');
    expect(rules).toContain('CI must detect printable-source/LMS drift and block release');
  });

  it('keeps active repository text free of known contradictory legacy assumptions', () => {
    const files = [
      'README.md',
      'CLAUDE.md',
      'HANDOFF.md',
      ...collectTextFiles('src'),
      ...collectTextFiles('docs'),
      ...collectTextFiles('scripts'),
    ];

    const forbidden: Array<[RegExp, string]> = [
      [/teacher judgment required/gi, 'teacher judgment required'],
      [/פתוח להערכת מורה/g, 'פתוח להערכת מורה'],
      [/כל 1,061 היעדים/g, 'hardcoded 1,061 target count'],
      [/מניפסט סקירת התשובות אינו תואם ל־77 העמודים/g, 'hardcoded 77-page manifest'],
      [/77-page booklet/gi, '77-page booklet'],
      [/guest draft\/result transfers/gi, 'guest transfer workflow'],
      [/transfer guest history/gi, 'guest history transfer'],
    ];

    const violations: string[] = [];
    for (const file of files) {
      const value = text(file);
      for (const [pattern, label] of forbidden) {
        pattern.lastIndex = 0;
        if (pattern.test(value)) violations.push(`${file}: ${label}`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('does not keep retired status/rule documents that can compete with RULES.md', () => {
    for (const retired of ['USER_MEMORY.md', 'MIGRATION_STATUS.md', 'docs/WORK_PLAN.md']) {
      expect(existsSync(join(ROOT, retired)), retired).toBe(false);
    }
  });

  it('keeps synchronization evidence explicitly non-normative', () => {
    const lock = JSON.parse(text('canonical-print-source.lock.json')) as { purpose?: string };
    expect(lock.purpose).toContain('RULES.md is the sole normative source of truth');
  });
});
