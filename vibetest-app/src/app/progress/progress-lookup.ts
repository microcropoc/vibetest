import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

import type { StepProgressEntry, StepProgressByStepId, StepProgressLookup } from './progress-types';

export const EMPTY_STEP_PROGRESS: StepProgressEntry = {
  status: 'not-started',
  lastCheckFailed: false,
};

export function stepProgressLookupFromMap(map: StepProgressByStepId): StepProgressLookup {
  return (stepId: string) => map[stepId];
}

export function stepProgressLookupFromSnapshots(
  snapshots: readonly StepProgressSnapshot[],
): StepProgressLookup {
  const map: Record<string, StepProgressEntry> = {};
  for (const snapshot of snapshots) {
    map[snapshot.stepId] = {
      status: snapshot.status,
      lastCheckFailed: snapshot.lastCheckFailed,
    };
  }
  return stepProgressLookupFromMap(map);
}

export function resolveStepProgress(
  lookup: StepProgressLookup,
  stepId: string,
): StepProgressEntry {
  return lookup(stepId) ?? EMPTY_STEP_PROGRESS;
}
