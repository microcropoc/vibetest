import { parseCourse } from '../courses/parse-course';
import { minimalValidCourseJson } from '../courses/__fixtures__/course-fixtures';

import { CourseRepository } from './course-repository';
import { deleteStepProgressByCourseId } from './delete-step-progress-by-course-id';
import { courseToRow } from './course-row-parse';
import { buildStepProgressKey } from './step-progress-key';
import { createTestVibetestDb, destroyTestVibetestDb } from './test-db-harness';
import type { VibetestDb } from './vibetest-db';

describe('CourseRepository', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('lists and gets courses with parse on read', async () => {
    db = createTestVibetestDb();
    const repo = CourseRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());

    await repo.put(course);

    const listed = await repo.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.courseId).toBe(course.courseId);

    const loaded = await repo.get(course.courseId);
    expect(loaded?.title).toBe('Test course');
  });

  it('replace upserts course without touching step progress', async () => {
    db = createTestVibetestDb();
    const repo = CourseRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());
    const moduleId = course.modules[0].moduleId;
    const stepId = course.modules[0].steps[0].stepId;

    await repo.put(course);
    await db.stepProgress.put({
      progressKey: buildStepProgressKey(course.courseId, moduleId, stepId),
      courseId: course.courseId,
      moduleId,
      stepId,
      type: 'theory',
      status: 'completed',
      lastCheckFailed: false,
    });

    const updated = parseCourse({
      ...minimalValidCourseJson(),
      title: 'Updated title',
    });
    await repo.replace(updated);

    expect((await repo.get(course.courseId))?.title).toBe('Updated title');
    expect(await db.stepProgress.where('courseId').equals(course.courseId).count()).toBe(1);
  });

  it('delete removes course and progress in one transaction', async () => {
    db = createTestVibetestDb();
    const repo = CourseRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());
    const moduleId = course.modules[0].moduleId;
    const stepId = course.modules[0].steps[0].stepId;

    await repo.put(course);
    await db.stepProgress.put({
      progressKey: buildStepProgressKey(course.courseId, moduleId, stepId),
      courseId: course.courseId,
      moduleId,
      stepId,
      type: 'theory',
      status: 'in-progress',
      lastCheckFailed: false,
    });

    await repo.delete(course.courseId);

    expect(await repo.get(course.courseId)).toBeUndefined();
    expect(await db.stepProgress.where('courseId').equals(course.courseId).count()).toBe(0);
  });

  it('deleteStepProgressByCourseId composes inside external transaction with courses.put', async () => {
    const testDb = createTestVibetestDb();
    db = testDb;
    const course = parseCourse(minimalValidCourseJson());
    const moduleId = course.modules[0].moduleId;
    const stepId = course.modules[0].steps[0].stepId;
    const replacement = parseCourse({
      ...minimalValidCourseJson(),
      title: 'Replaced in txn',
    });

    await testDb.courses.put(courseToRow(course));
    await testDb.stepProgress.put({
      progressKey: buildStepProgressKey(course.courseId, moduleId, stepId),
      courseId: course.courseId,
      moduleId,
      stepId,
      type: 'theory',
      status: 'completed',
      lastCheckFailed: false,
    });

    await testDb.transaction('rw', testDb.courses, testDb.stepProgress, async () => {
      await deleteStepProgressByCourseId(testDb.stepProgress, course.courseId);
      await testDb.courses.put(courseToRow(replacement));
    });

    expect(await testDb.stepProgress.where('courseId').equals(course.courseId).count()).toBe(0);
    const row = await testDb.courses.get(course.courseId);
    expect(row?.course.title).toBe('Replaced in txn');
  });
});
