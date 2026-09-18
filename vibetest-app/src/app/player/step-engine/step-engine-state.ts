import type { Step } from '../../courses/course.model';

import type { StepDraftByType, StepType } from './step-progress-snapshot';
import type { StepStatus } from './step-status';

/** Shared runtime fields for every step engine implementation. */
export interface StepEngineBaseState {
  readonly stepId: string;
  readonly type: StepType;
  readonly status: StepStatus;
  readonly lastCheckFailed: boolean;
}

export interface StepEngineStateWithDraft<D> extends StepEngineBaseState {
  readonly draft: D;
}

export function baseStateFromStep(step: Step): StepEngineBaseState {
  return {
    stepId: step.stepId,
    type: step.type,
    status: 'not-started',
    lastCheckFailed: false,
  };
}
