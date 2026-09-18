import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from './__fixtures__/course-fixtures';
import { parseCourse } from './parse-course';
import { regenerateCourseIds } from './regenerate-course-ids';

describe('regenerateCourseIds', () => {
  it('replaces all ids and preserves content', () => {
    const before = parseCourse(minimalValidCourseJson());
    const after = regenerateCourseIds(before);

    expect(after.courseId).not.toBe(FIXTURE_COURSE_ID);
    expect(after.modules[0].moduleId).not.toBe(FIXTURE_MODULE_ID);
    expect(after.modules[0].steps[0].stepId).not.toBe(FIXTURE_STEP_THEORY_ID);
    expect(after.modules[0].steps[1].stepId).not.toBe(FIXTURE_STEP_QUIZ_ID);

    expect(after.title).toBe(before.title);
    expect(after.modules[0].steps[0].type).toBe('theory');
    if (after.modules[0].steps[0].type === 'theory') {
      expect(after.modules[0].steps[0].content).toBe(before.modules[0].steps[0].content);
    }
  });
});
