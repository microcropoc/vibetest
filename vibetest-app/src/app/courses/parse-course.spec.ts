import { minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { isCourse, parseCourse } from './parse-course';

describe('parseCourse', () => {
  it('parses a valid minimal course', () => {
    const course = parseCourse(minimalValidCourseJson());
    expect(course.courseId).toBe(minimalValidCourseJson()['courseId']);
    expect(course.modules[0].steps).toHaveLength(2);
  });

  it('rejects invalid schemaVersion', () => {
    const raw = { ...minimalValidCourseJson(), schemaVersion: 2 };
    expect(() => parseCourse(raw)).toThrow();
    expect(isCourse(raw)).toBe(false);
  });

  it('rejects theory step with non-string content', () => {
    const raw = minimalValidCourseJson();
    const modules = raw['modules'] as Record<string, unknown>[];
    const steps = modules[0]['steps'] as Record<string, unknown>[];
    steps[0] = { ...steps[0], content: { not: 'markdown' } };
    expect(isCourse(raw)).toBe(false);
  });
});
