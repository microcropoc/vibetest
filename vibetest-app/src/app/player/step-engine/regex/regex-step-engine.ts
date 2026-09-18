import type { Step } from '../../../courses/course.model';

import type { CoreStepCommand } from '../step-engine-command';
import type { StepEngine } from '../step-engine-contract';
import {
  applyCheckFailure,
  applyCheckSuccess,
  applyRetry,
  draftFromSnapshot,
  mergeBaseFromSnapshot,
} from '../step-engine-helpers';
import type { StepDraftByType, StepProgressSnapshot } from '../step-progress-snapshot';
import type { StepEngineStateWithDraft } from '../step-engine-state';
import { baseStateFromStep } from '../step-engine-state';

import type { RegexPracticeResult } from './regex-practice-runner';

export type RegexStep = Step & { readonly type: 'regex' };

export type RegexEngineState = StepEngineStateWithDraft<StepDraftByType['regex']> & {
  readonly starterCode: string;
};

export type RegexStepCommand =
  | CoreStepCommand
  | { readonly kind: 'setDraftPattern'; readonly pattern: string };

function assertRegexStep(step: Step): asserts step is RegexStep {
  if (step.type !== 'regex') {
    throw new Error(`Regex step engine expected type "regex", got "${step.type}"`);
  }
}

export function createRegexStepEngine(): StepEngine<RegexEngineState, RegexStepCommand> {
  return regexStepEngine;
}

export const regexStepEngine: StepEngine<RegexEngineState, RegexStepCommand> = {
  createInitial(step, saved) {
    assertRegexStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    const draft = saved
      ? (draftFromSnapshot(saved) as StepDraftByType['regex'])
      : { pattern: step.content.starterCode };
    return { ...merged, draft, starterCode: step.content.starterCode };
  },

  reduce(state, command) {
    switch (command.kind) {
      case 'setDraftPattern':
        return {
          ...state,
          status: state.status === 'completed' ? 'completed' : 'in-progress',
          draft: { pattern: command.pattern },
        };
      case 'advance':
        return state;
      case 'retry':
        return applyRetry(state, { pattern: state.starterCode });
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: 'regex',
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: { pattern: state.draft.pattern },
    };
  },
};

export function applyRegexPracticeResult(
  state: RegexEngineState,
  result: RegexPracticeResult,
): RegexEngineState {
  if (result.ok) {
    return {
      ...applyCheckSuccess(state),
      starterCode: state.starterCode,
      draft: state.draft,
    };
  }
  return {
    ...applyCheckFailure(state),
    starterCode: state.starterCode,
    draft: state.draft,
  };
}
