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

import type { SqlitePracticeResult } from './sqlite-practice-runner';

export type SqliteStep = Step & { readonly type: 'sqlite' };

export type SqliteEngineState = StepEngineStateWithDraft<StepDraftByType['sqlite']> & {
  readonly starterCode: string;
};

export type SqliteStepCommand =
  | CoreStepCommand
  | { readonly kind: 'setDraftCode'; readonly draftCode: string };

function assertSqliteStep(step: Step): asserts step is SqliteStep {
  if (step.type !== 'sqlite') {
    throw new Error(`Sqlite step engine expected type "sqlite", got "${step.type}"`);
  }
}

export function createSqliteStepEngine(): StepEngine<SqliteEngineState, SqliteStepCommand> {
  return sqliteStepEngine;
}

export const sqliteStepEngine: StepEngine<SqliteEngineState, SqliteStepCommand> = {
  createInitial(step, saved) {
    assertSqliteStep(step);
    const base = baseStateFromStep(step);
    const merged = saved ? mergeBaseFromSnapshot(base, saved) : base;
    const draft = saved
      ? (draftFromSnapshot(saved) as StepDraftByType['sqlite'])
      : { draftCode: step.content.starterCode };
    return { ...merged, draft, starterCode: step.content.starterCode };
  },

  reduce(state, command) {
    switch (command.kind) {
      case 'setDraftCode':
        return {
          ...state,
          status: state.status === 'completed' ? 'completed' : 'in-progress',
          draft: { draftCode: command.draftCode },
        };
      case 'advance':
        return state;
      case 'retry':
        return applyRetry(state, { draftCode: state.starterCode });
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  },

  toSnapshot(state): StepProgressSnapshot {
    return {
      stepId: state.stepId,
      type: 'sqlite',
      status: state.status,
      lastCheckFailed: state.lastCheckFailed,
      draft: { draftCode: state.draft.draftCode },
    };
  },
};

export function applySqlitePracticeResult(
  state: SqliteEngineState,
  result: SqlitePracticeResult,
): SqliteEngineState {
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
