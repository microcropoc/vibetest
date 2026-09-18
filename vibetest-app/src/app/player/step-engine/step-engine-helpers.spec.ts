import {
  applyAdvanceViewable,
  applyCheckFailure,
  applyCheckSuccess,
  applyRetry,
} from './step-engine-helpers';
import { emptyDraftForType } from './step-progress-snapshot';
import type { StepEngineBaseState, StepEngineStateWithDraft } from './step-engine-state';
import type { StepDraftByType } from './step-progress-snapshot';

const base: StepEngineBaseState = {
  stepId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  type: 'quiz',
  status: 'in-progress',
  lastCheckFailed: false,
};

describe('step-engine-helpers', () => {
  it('applyAdvanceViewable completes and clears failure flag', () => {
    const failed = { ...base, lastCheckFailed: true };
    const next = applyAdvanceViewable(failed);
    expect(next.status).toBe('completed');
    expect(next.lastCheckFailed).toBe(false);
  });

  it('applyCheckSuccess completes the step', () => {
    const next = applyCheckSuccess(base);
    expect(next.status).toBe('completed');
    expect(next.lastCheckFailed).toBe(false);
  });

  it('applyCheckFailure sets lastCheckFailed without completing', () => {
    const next = applyCheckFailure(base);
    expect(next.status).toBe('in-progress');
    expect(next.lastCheckFailed).toBe(true);
  });

  it('applyCheckFailure does not downgrade completed status', () => {
    const completed = { ...base, status: 'completed' as const };
    const next = applyCheckFailure(completed);
    expect(next.status).toBe('completed');
    expect(next.lastCheckFailed).toBe(true);
  });

  it('applyRetry clears draft and failure after failed check', () => {
    type QuizDraft = StepDraftByType['quiz'];
    const state: StepEngineStateWithDraft<QuizDraft> = {
      ...base,
      lastCheckFailed: true,
      draft: { selectedIndices: [0, 1] },
    };
    const next = applyRetry(state, emptyDraftForType('quiz'));
    expect(next.status).toBe('in-progress');
    expect(next.lastCheckFailed).toBe(false);
    expect(next.draft.selectedIndices).toEqual([]);
  });

  it('applyRetry after completed keeps completed and clears draft', () => {
    type QuizDraft = StepDraftByType['quiz'];
    const state: StepEngineStateWithDraft<QuizDraft> = {
      ...base,
      status: 'completed',
      lastCheckFailed: true,
      draft: { selectedIndices: [1] },
    };
    const next = applyRetry(state, emptyDraftForType('quiz'));
    expect(next.status).toBe('completed');
    expect(next.lastCheckFailed).toBe(false);
    expect(next.draft.selectedIndices).toEqual([]);
  });
});
