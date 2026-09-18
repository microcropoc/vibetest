import type { Module } from '../courses/course.model';
import { parseCourse } from '../courses/parse-course';
import {
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from '../courses/__fixtures__/course-fixtures';

import {
  courseModuleProgress,
  firstIncompleteStepIndex,
  isModuleCompleted,
  moduleStepProgress,
} from './progress-aggregation';
import { stepProgressLookupFromMap } from './progress-lookup';

describe('progress aggregation', () => {
  const course = parseCourse(minimalValidCourseJson());
  const module = course.modules[0];

  it('counts zero completed with empty progress map', () => {
    const lookup = stepProgressLookupFromMap({});
    expect(moduleStepProgress(module, lookup)).toEqual({ completed: 0, total: 2 });
    expect(isModuleCompleted(module, lookup)).toBe(false);
    expect(courseModuleProgress(course, lookup)).toEqual({
      completedModules: 0,
      totalModules: 1,
      steps: { completed: 0, total: 2 },
    });
  });

  it('counts module and course progress when all steps completed', () => {
    const lookup = stepProgressLookupFromMap({
      [FIXTURE_STEP_THEORY_ID]: { status: 'completed', lastCheckFailed: false },
      [FIXTURE_STEP_QUIZ_ID]: { status: 'completed', lastCheckFailed: false },
    });
    expect(moduleStepProgress(module, lookup)).toEqual({ completed: 2, total: 2 });
    expect(isModuleCompleted(module, lookup)).toBe(true);
    expect(courseModuleProgress(course, lookup).completedModules).toBe(1);
  });

  it('firstIncompleteStepIndex returns first non-completed step', () => {
    const lookup = stepProgressLookupFromMap({
      [FIXTURE_STEP_THEORY_ID]: { status: 'completed', lastCheckFailed: false },
      [FIXTURE_STEP_QUIZ_ID]: { status: 'not-started', lastCheckFailed: false },
    });
    expect(firstIncompleteStepIndex(module, lookup)).toBe(1);
  });

  it('firstIncompleteStepIndex returns 0 when all completed', () => {
    const lookup = stepProgressLookupFromMap({
      [FIXTURE_STEP_THEORY_ID]: { status: 'completed', lastCheckFailed: false },
      [FIXTURE_STEP_QUIZ_ID]: { status: 'completed', lastCheckFailed: false },
    });
    expect(firstIncompleteStepIndex(module, lookup)).toBe(0);
  });

  it('firstIncompleteStepIndex returns 0 for empty module', () => {
    const emptyModule: Module = {
      moduleId: course.modules[0].moduleId,
      title: 'Empty',
      steps: [],
    };
    expect(firstIncompleteStepIndex(emptyModule, stepProgressLookupFromMap({}))).toBe(0);
  });
});
