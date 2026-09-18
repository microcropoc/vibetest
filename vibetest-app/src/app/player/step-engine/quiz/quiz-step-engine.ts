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
import {
  emptyDraftForType,
  type StepDraftByType,
  type StepProgressSnapshot,
} from '../step-progress-snapshot';
import type { StepEngineStateWithDraft } from '../step-engine-state';
import { baseStateFromStep } from '../step-engine-state';

import { isValidSelection, quizAnswersMatch } from './quiz-answer';

export type QuizStep = Step & { readonly type: 'quiz' };

export type QuizEngineState = StepEngineStateWithDraft<StepDraftByType['quiz']> & {
  readonly optionCount: number;
  readonly correctIndices: readonly number[];
};

export type QuizStepCommand =
  | CoreStepCommand
  | { readonly kind: 'setSelection'; readonly selectedIndices: readonly number[] }
  | { readonly kind: 'submitAnswer' };

function assertQuizStep(step: Step): asserts step is QuizStep {
  if (step.type !== 'quiz') {
    throw new Error(`Quiz step engine expected type "quiz", got "${step.type}"`);
  }
}

function draftFromStateOrSnapshot(
  saved: StepProgressSnapshot | undefined,
): StepDraftByType['quiz'] {
  if (!saved || saved.type !== 'quiz') {
    return emptyDraftForType('quiz');
  }
  const draft = draftFromSnapshot(saved) as StepDraftByType['quiz'];
  return {
    selectedIndices: [...draft.selectedIndices],
  };
}

export function createQuizStepEngine(): StepEngine<QuizEngineState, QuizStepCommand> {
  return quizStepEngine;
}

export const quizStepEngine: StepEngine<QuizEngineState, QuizStepCommand> = {
  createInitial(step, saved) {
    assertQuizStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    return {
      ...merged,
      draft: draftFromStateOrSnapshot(saved),
      optionCount: step.content.options.length,
      correctIndices: step.content.correctIndices,
    };
  },

  reduce(state, command) {
    switch (command.kind) {
      case 'setSelection': {
        if (!isValidSelection(command.selectedIndices, state.optionCount)) {
          return state;
        }
        return {
          ...state,
          status: state.status === 'completed' ? 'completed' : 'in-progress',
          draft: { selectedIndices: normalizeSelection(command.selectedIndices) },
        };
      }
      case 'submitAnswer': {
        const { selectedIndices } = state.draft;
        if (!isValidSelection(selectedIndices, state.optionCount)) {
          return state;
        }
        const matched = quizAnswersMatch(selectedIndices, state.correctIndices);
        const nextBase = matched ? applyCheckSuccess(state) : applyCheckFailure(state);
        return { ...state, ...nextBase };
      }
      case 'advance':
        return state;
      case 'retry':
        return applyRetry(state, emptyDraftForType('quiz'));
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: 'quiz',
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: { selectedIndices: [...state.draft.selectedIndices] },
    };
  },
};

function normalizeSelection(indices: readonly number[]): readonly number[] {
  return [...new Set(indices)].sort((a, b) => a - b);
}
