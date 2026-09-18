import type { Step } from '../../../courses/course.model';

import type { CoreStepCommand } from '../step-engine-command';
import type { StepEngine } from '../step-engine-contract';
import {
  applyAdvanceViewable,
  applyRetry,
  draftFromSnapshot,
  mergeBaseFromSnapshot,
} from '../step-engine-helpers';
import {
  emptyDraftForType,
  type StepDraftByType,
  type StepProgressSnapshot,
} from '../step-progress-snapshot';
import type { StepEngineStateWithDraft } from '../step-engine-state';
import { baseStateFromStep } from '../step-engine-state';

/** Theory step runtime state (`content` is markdown string on the step). */
export type TheoryEngineState = StepEngineStateWithDraft<StepDraftByType['theory']> & {
  readonly viewed: boolean;
};

/** Core commands plus explicit “content seen” before advance. */
export type TheoryStepCommand = CoreStepCommand | { readonly kind: 'markViewed' };

export type TheoryStep = Step & { readonly type: 'theory' };

function assertTheoryStep(step: Step): asserts step is TheoryStep {
  if (step.type !== 'theory') {
    throw new Error(`Theory step engine expected type "theory", got "${step.type}"`);
  }
}

function viewedFromSnapshot(saved: StepProgressSnapshot | undefined): boolean {
  if (!saved) {
    return false;
  }
  return saved.status !== 'not-started';
}

export function createTheoryStepEngine(): StepEngine<TheoryEngineState, TheoryStepCommand> {
  return theoryStepEngine;
}

export const theoryStepEngine: StepEngine<TheoryEngineState, TheoryStepCommand> = {
  createInitial(step, saved) {
    assertTheoryStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    const draft = saved
      ? (draftFromSnapshot(saved) as StepDraftByType['theory'])
      : emptyDraftForType('theory');
    return {
      ...merged,
      draft,
      viewed: viewedFromSnapshot(saved),
    };
  },

  reduce(state, command) {
    switch (command.kind) {
      case 'markViewed':
        if (state.status === 'completed') {
          return { ...state, viewed: true };
        }
        return { ...state, viewed: true, status: 'in-progress' };
      case 'advance': {
        const advanced = applyAdvanceViewable(state);
        return { ...state, ...advanced, viewed: true };
      }
      case 'retry':
        return { ...applyRetry(state, emptyDraftForType('theory')), viewed: false };
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: 'theory',
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: state.draft,
    };
  },
};
