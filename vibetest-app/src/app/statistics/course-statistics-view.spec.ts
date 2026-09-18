import { minimalValidCourseJson } from '../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../courses/parse-course';
import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

import { courseStatisticsView } from './course-statistics-view';

describe('courseStatisticsView', () => {
  it('aggregates module and step progress from snapshots', () => {
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

    const view = courseStatisticsView(course, snapshots);

    expect(view).toEqual({
      courseId: course.courseId,
      title: course.title,
      completedModules: 0,
      totalModules: 1,
      completedSteps: 1,
      totalSteps: course.modules[0]!.steps.length,
    });
  });
});
