import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/firestore-emulator.test.ts'],
    environment: 'node',
    fileParallelism: false,
  },
});
