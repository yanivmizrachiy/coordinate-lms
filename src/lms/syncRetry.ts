import type { ActivityEvent, PersistenceOutcome } from './types';

interface SynchronizationRetryPlan {
  retryDraft?: () => Promise<PersistenceOutcome>;
  retryResult?: () => Promise<PersistenceOutcome>;
  pendingActivity: readonly ActivityEvent[];
  retryActivity: (event: ActivityEvent) => Promise<PersistenceOutcome>;
}

export async function runSynchronizationRetry(
  plan: SynchronizationRetryPlan,
): Promise<PersistenceOutcome[]> {
  const outcomes: PersistenceOutcome[] = [];
  if (plan.retryDraft) outcomes.push(await plan.retryDraft());
  if (plan.retryResult) outcomes.push(await plan.retryResult());
  for (const event of plan.pendingActivity) {
    outcomes.push(await plan.retryActivity(event));
  }
  return outcomes;
}
