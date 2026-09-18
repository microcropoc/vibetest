import { describe, expect, it } from 'vitest';

import { minimalValidCourseJson } from '../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../courses/parse-course';

import { stepIndicatorItems } from './step-indicator-items';

describe('stepIndicatorItems', () => {
  it('marks current step and completed earlier steps', () => {
    const course = parseCourse(minimalValidCourseJson());
    const steps = course.modules[0]!.steps;
    const theoryId = steps[0]!.stepId;
    const items = stepIndicatorItems(
      steps,
      1,
      {
        [theoryId]: {
          stepId: theoryId,
          type: 'theory',
          status: 'completed',
          lastCheckFailed: false,
          draft: {},
        },
      },
    );
    expect(items[0]?.state).toBe('completed');
    expect(items[1]?.state).toBe('current');
  });
});
