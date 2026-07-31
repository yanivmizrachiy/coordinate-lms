import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit/data tests only. Playwright e2e specs live in tests/e2e and run separately.
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
});
