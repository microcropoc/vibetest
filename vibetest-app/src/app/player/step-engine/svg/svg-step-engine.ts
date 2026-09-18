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

/** SVG step runtime state (inline `content.svg`; render in vt-21). */
export type SvgEngineState = StepEngineStateWithDraft<StepDraftByType['svg']> & {
  readonly viewed: boolean;
};

export type SvgStepCommand = CoreStepCommand | { readonly kind: 'markViewed' };

export type SvgStep = Step & { readonly type: 'svg' };

function assertSvgStep(step: Step): asserts step is SvgStep {
  if (step.type !== 'svg') {
    throw new Error(`SVG step engine expected type "svg", got "${step.type}"`);
  }
}

function viewedFromSnapshot(saved: StepProgressSnapshot | undefined): boolean {
  if (!saved) {
    return false;
  }
  return saved.status !== 'not-started';
}

export function createSvgStepEngine(): StepEngine<SvgEngineState, SvgStepCommand> {
  return svgStepEngine;
}

export const svgStepEngine: StepEngine<SvgEngineState, SvgStepCommand> = {
  createInitial(step, saved) {
    assertSvgStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    const draft = saved
      ? (draftFromSnapshot(saved) as StepDraftByType['svg'])
      : emptyDraftForType('svg');
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
        return { ...applyRetry(state, emptyDraftForType('svg')), viewed: false };
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: 'svg',
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: state.draft,
    };
  },
};
