const configuredAdminEmails = String(
  import.meta.env.VITE_ADMIN_EMAILS || 'yanivmiz77@gmail.com',
)
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS = new Set(configuredAdminEmails);

export const LMS_CONFIG = {
  minScore: 1,
  maxScore: 100,
  maxAttempts: 3,
  // Practice is open to every canonical page. Registration controls persistence
  // and reports, never access to the learning tasks themselves.
  guestFreePages: Number.MAX_SAFE_INTEGER,
  activityIdleSeconds: 120,
  activityHeartbeatSeconds: 30,
} as const;
