import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync('src/main.ts', 'utf8');

describe('route loading architecture', () => {
  it('keeps the opening screen independent from heavy workbook and LMS routes', () => {
    expect(main).toContain("import { home } from './views/home';");
    expect(main).toContain("import('./views/pageViewer')");
    expect(main).toContain("import('./views/book')");
    expect(main).toContain("import('./views/flipbook')");
    expect(main).toContain("import('./views/lmsAdmin')");
    expect(main).not.toMatch(/import \{ pageViewer \} from '\.\/views\/pageViewer'/);
    expect(main).not.toMatch(/import \{ book \} from '\.\/views\/book'/);
    expect(main).not.toMatch(/import \{ flipbook \} from '\.\/views\/flipbook'/);
  });

  it('guards asynchronous route loads against stale navigation results', () => {
    expect(main).toContain('const requestId = ++latestRenderRequest;');
    expect(main).toContain('if (requestId !== latestRenderRequest) return;');
    expect(main).toContain('startRouter((match) => { void render(match); });');
  });
});
