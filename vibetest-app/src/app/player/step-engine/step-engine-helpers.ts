import type { StepProgressSnapshot } from './step-progress-snapshot';
import { emptyDraftForType } from './step-progress-snapshot';
import type { StepEngineBaseState, StepEngineStateWithDraft } from './step-engine-state';
import type { StepStatus } from './step-status';

/** Viewable steps (theory/svg): explicit advance marks the step completed. */
export function applyAdvanceViewable(state: StepEngineBaseState): StepEngineBaseState {
  return {
    ...state,
    status: 'completed',
    lastCheckFailed: false,
  };
}

/** Quiz/practice: successful check completes the step. */
export function applyCheckSuccess(state: StepEngineBaseState): StepEngineBaseState {
  return {
    ...state,
    status: 'completed',
    lastCheckFailed: false,
  };
}

/** Quiz/practice: failed check flags UI error; does not complete the step. */
export function applyCheckFailure(state: StepEngineBaseState): StepEngineBaseState {
  const status: StepStatus =
    state.status === 'completed' ? 'completed' : 'in-progress';
  return {
    ...state,
    status,
    lastCheckFailed: true,
  };
}

/**
 * Retry: clear draft and failure flag. Completed steps stay completed (player spec).
 */
export function applyRetry<D, S extends StepEngineStateWithDraft<D>>(
  state: S,
  emptyDraft: D,
): S {
  const status: StepStatus =
    state.status === 'completed' ? 'completed' : 'in-progress';
  return {
    ...state,
    status,
    lastCheckFailed: false,
    draft: emptyDraft,
  };
}

export function mergeBaseFromSnapshot(
  state: StepEngineBaseState,
  saved: StepProgressSnapshot,
): StepEngineBaseState {
  if (saved.stepId !== state.stepId) {
    throw new Error('Snapshot stepId does not match step');
  }
  return {
    ...state,
    status: saved.status,
    lastCheckFailed: saved.lastCheckFailed,
  };
}

export function draftFromSnapshot(saved: StepProgressSnapshot): unknown {
  return saved.draft ?? emptyDraftForType(saved.type);
}
