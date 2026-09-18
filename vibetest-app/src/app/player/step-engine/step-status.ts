/** Persisted step progress status (see SPECIFICATION — `stepProgress.status`). */
export type StepStatus = 'not-started' | 'in-progress' | 'completed';

export function isStepCompleted(status: StepStatus): boolean {
  return status === 'completed';
}
