import {
  FIXTURE_CREATED_AT,
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidImportJson,
} from './__fixtures__/course-fixtures';
import { ImportCourseSchema } from './import-course-zod-schema';
import { importDtoToCourse } from './import-dto-to-course';

describe('importDtoToCourse', () => {
  it('assigns UUIDs and createdAt', () => {
    const dto = ImportCourseSchema.parse(minimalValidImportJson());
    const uuids = [
      FIXTURE_COURSE_ID,
      FIXTURE_MODULE_ID,
      FIXTURE_STEP_THEORY_ID,
      FIXTURE_STEP_QUIZ_ID,
    ];
    let index = 0;
    const course = importDtoToCourse(dto, {
      randomUuid: () => uuids[index++] ?? FIXTURE_COURSE_ID,
      now: () => new Date(FIXTURE_CREATED_AT),
    });

    expect(course.courseId).toBe(FIXTURE_COURSE_ID);
    expect(course.createdAt).toBe(FIXTURE_CREATED_AT);
    expect(course.modules[0]?.moduleId).toBe(FIXTURE_MODULE_ID);
    expect(course.modules[0]?.steps[0]?.stepId).toBe(FIXTURE_STEP_THEORY_ID);
    expect(course.title).toBe('Test course');
  });
});
