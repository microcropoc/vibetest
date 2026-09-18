import type { Step } from '../courses/course.model';
import { resolveStepProgress } from '../progress/progress-lookup';
import { stepIndicatorState } from '../progress/step-indicator-state';
import type { StepIndicatorState } from '../progress/progress-types';

import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

export interface StepIndicatorItemView {
  readonly index: number;
  readonly stepId: string;
  readonly label: string;
  readonly state: StepIndicatorState;
}

export function stepIndicatorItems(
  steps: readonly Step[],
  currentStepIndex: number,
  snapshotsByStepId: Readonly<Record<string, StepProgressSnapshot>>,
): readonly StepIndicatorItemView[] {
  const lookup = (stepId: string) => {
    const snapshot = snapshotsByStepId[stepId];
    if (!snapshot) {
      return undefined;
    }
    return {
      status: snapshot.status,
      lastCheckFailed: snapshot.lastCheckFailed,
    };
  };

  return steps.map((step, index) => {
    const progress = resolveStepProgress(lookup, step.stepId);
    return {
      index,
      stepId: step.stepId,
      label: `Шаг ${index + 1}: ${step.title}`,
      state: stepIndicatorState(progress, index === currentStepIndex),
    };
  });
}
