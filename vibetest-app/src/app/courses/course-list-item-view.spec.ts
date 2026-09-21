import { describe, expect, it } from 'vitest';

import { minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { parseCourse } from './parse-course';
import { courseListItemView } from './course-list-item-view';
import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

describe('courseListItemView', () => {
  it('aggregates module progress from snapshots', () => {
    const course = parseCourse(minimalValidCourseJson());
    const stepId = course.modules[0]!.steps[0]!.stepId;
    const snapshots: StepProgressSnapshot[] = [
      {
        stepId,
        type: 'theory',
        status: 'completed',
        lastCheckFailed: false,
        draft: {},
      },
    ];

    const view = courseListItemView(course, snapshots);

    expect(view).toEqual({
      courseId: course.courseId,
      title: course.title,
      completedModules: 0,
      totalModules: 1,
      completedSteps: 1,
      totalSteps: 2,
      createdAt: course.createdAt,
      createdAtLabel: '15.01.2020, 12:00',
    });
  });
});
