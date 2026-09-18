import { describe, expect, it } from 'vitest';

import { minimalValidCourseJson } from '../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../courses/parse-course';

import { reducePlayerStep } from './player-step-reducer';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

describe('reducePlayerStep', () => {
  const course = parseCourse(minimalValidCourseJson());
  const theoryStep = course.modules[0]!.steps[0]!;

  it('marks theory step completed on advance', () => {
    const snapshot = reducePlayerStep(theoryStep, undefined, { kind: 'advance' });
    expect(snapshot.status).toBe('completed');
    expect(snapshot.lastCheckFailed).toBe(false);
  });

  it('retry keeps completed status when step was already completed', () => {
    const completed: StepProgressSnapshot = {
      stepId: theoryStep.stepId,
      type: 'theory',
      status: 'completed',
      lastCheckFailed: false,
      draft: {},
    };
    const snapshot = reducePlayerStep(theoryStep, completed, { kind: 'retry' });
    expect(snapshot.status).toBe('completed');
    expect(snapshot.lastCheckFailed).toBe(false);
  });
});
