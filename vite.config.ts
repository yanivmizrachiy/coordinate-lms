import { defineConfig } from 'vite';

// Relative base so the same build works when opened locally (file/preview)
// and when served from a GitHub Pages project subpath
// (https://<user>.github.io/coordinate-first-quadrant/).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
