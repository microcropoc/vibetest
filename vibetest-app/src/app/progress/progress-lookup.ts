import type { StepProgressEntry, StepProgressByStepId, StepProgressLookup } from './progress-types';

export const EMPTY_STEP_PROGRESS: StepProgressEntry = {
  status: 'not-started',
  lastCheckFailed: false,
};

export function stepProgressLookupFromMap(map: StepProgressByStepId): StepProgressLookup {
  return (stepId: string) => map[stepId];
}

export function resolveStepProgress(
  lookup: StepProgressLookup,
  stepId: string,
): StepProgressEntry {
  return lookup(stepId) ?? EMPTY_STEP_PROGRESS;
}
