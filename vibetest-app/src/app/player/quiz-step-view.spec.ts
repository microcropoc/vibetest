import { describe, expect, it } from 'vitest';

import { quizShowsSuccess } from './quiz-step-view';
import type { QuizStep } from './step-engine/quiz/quiz-step-engine';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

const STEP: QuizStep = {
  stepId: 'quiz-1',
  type: 'quiz',
  title: 'Multi',
  content: { question: 'Q', options: ['A', 'B', 'C'], correctIndices: [0, 2] },
};

function snapshot(
  overrides: Partial<{
    status: StepProgressSnapshot['status'];
    lastCheckFailed: boolean;
    selectedIndices: readonly number[];
  }> = {},
): StepProgressSnapshot {
  return {
    stepId: STEP.stepId,
    type: 'quiz',
    status: overrides.status ?? 'completed',
    lastCheckFailed: overrides.lastCheckFailed ?? false,
    draft: { selectedIndices: overrides.selectedIndices ?? [2, 0] },
  };
}

describe('quizShowsSuccess', () => {
  it('is true for a completed step with the correct answer selected', () => {
    expect(quizShowsSuccess(STEP, snapshot())).toBe(true);
  });

  it('is false when the selection changed after success', () => {
    expect(quizShowsSuccess(STEP, snapshot({ selectedIndices: [0] }))).toBe(false);
  });

  it('is false after retry cleared the selection', () => {
    expect(quizShowsSuccess(STEP, snapshot({ selectedIndices: [] }))).toBe(false);
  });

  it('is false when the last check failed', () => {
    expect(quizShowsSuccess(STEP, snapshot({ lastCheckFailed: true }))).toBe(false);
  });

  it('is false for a step that is not completed yet', () => {
    expect(quizShowsSuccess(STEP, snapshot({ status: 'in-progress' }))).toBe(false);
  });

  it('is false without a quiz snapshot', () => {
    expect(quizShowsSuccess(STEP, undefined)).toBe(false);
  });
});
