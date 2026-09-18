import type { Step } from '../../courses/course.model';

import type { CoreStepCommand } from './step-engine-command';
import type { StepEngine } from './step-engine-contract';
import {
  applyAdvanceViewable,
  applyRetry,
  draftFromSnapshot,
  mergeBaseFromSnapshot,
} from './step-engine-helpers';
import {
  defaultStepProgressSnapshot,
  emptyDraftForType,
  type StepDraftByType,
  type StepProgressSnapshot,
} from './step-progress-snapshot';
import type { StepEngineStateWithDraft } from './step-engine-state';
import { baseStateFromStep } from './step-engine-state';

/** Minimal viewable engine (theory/svg pattern) for core contract tests. */
export type ViewableStepType = 'theory' | 'svg';

export type ViewableEngineState = StepEngineStateWithDraft<
  StepDraftByType[ViewableStepType]
>;

function assertViewableStep(step: Step): asserts step is Step & { type: ViewableStepType } {
  if (step.type !== 'theory' && step.type !== 'svg') {
    throw new Error(`Stub viewable engine supports theory/svg only, got ${step.type}`);
  }
}

export const stubViewableStepEngine: StepEngine<ViewableEngineState, CoreStepCommand> = {
  createInitial(step, saved) {
    assertViewableStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    const draft = saved
      ? (draftFromSnapshot(saved) as StepDraftByType[ViewableStepType])
      : emptyDraftForType(step.type);
    return { ...merged, draft };
  },

  reduce(state, command) {
    switch (command.kind) {
      case 'advance':
        return { ...applyAdvanceViewable(state), draft: state.draft };
      case 'retry':
        return applyRetry(state, emptyDraftForType(state.type));
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: state.type,
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: state.draft,
    } as StepProgressSnapshot;
  },
};

export function createDefaultViewableSnapshot(step: Step): StepProgressSnapshot {
  assertViewableStep(step);
  return defaultStepProgressSnapshot(step);
}
