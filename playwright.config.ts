import { defineConfig, devices } from '@playwright/test';

const testSession = JSON.stringify({
  uid: 'e2e-student',
  fullName: 'תלמיד בדיקה',
  username: 'e2e-student',
  email: 'student@example.com',
  role: 'student',
  createdAt: 1,
});

// Visual / behavioural end-to-end tests. Run with: npm run test:visual
// (requires browsers: `npx playwright install chromium`).
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4319',
    trace: 'on-first-retry',
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4319',
          localStorage: [
            {
              name: 'coordinate_lms_session_v2',
              value: testSession,
            },
          ],
        },
      ],
    },
    /* Smooth scrolling kept moving elements exactly while a click's stability
       check ran — a retry loop that only the slow mobile emulation lost. The
       app honours prefers-reduced-motion everywhere (tokens + scroll), so this
       runs the tests on the calm path a motion-sensitive user gets. */
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4319',
    env: { VITE_ALLOW_LOCAL_LMS: 'true' },
    // Never reuse a server on this port: another project of Yaniv's has run on
    // the default 4173, and Playwright then measured THAT app and reported
    // failures here. strictPort + no reuse turns a clash into a clear error.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
