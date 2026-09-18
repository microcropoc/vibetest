import { describe, expect, it } from 'vitest';

import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';

import { minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { moduleListItemView } from './module-list-item-view';
import { parseCourse } from './parse-course';

describe('moduleListItemView', () => {
  it('aggregates step progress for a module', () => {
    const course = parseCourse(minimalValidCourseJson());
    const module = course.modules[0]!;
    const stepId = module.steps[0]!.stepId;
    const snapshots: StepProgressSnapshot[] = [
      {
        stepId,
        type: 'theory',
        status: 'completed',
        lastCheckFailed: false,
        draft: {},
      },
    ];
    const lookup = stepProgressLookupFromSnapshots(snapshots);

    expect(moduleListItemView(module, lookup)).toEqual({
      moduleId: module.moduleId,
      title: module.title,
      completedSteps: 1,
      totalSteps: module.steps.length,
    });
  });
});
