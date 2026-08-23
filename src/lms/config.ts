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
  // One first checked attempt + up to three corrections after a mistake.
  maxAttempts: 4,
  activityIdleSeconds: 120,
  activityHeartbeatSeconds: 30,
} as const;
