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
  guestFreePages: 1,
  activityIdleSeconds: 120,
  activityHeartbeatSeconds: 30,
} as const;
