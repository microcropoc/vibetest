import { parseCourse } from '../courses/parse-course';
import { minimalValidCourseJson } from '../courses/__fixtures__/course-fixtures';

import { deleteCourseAndProgress } from './course-progress-transaction';
import { buildStepProgressKey } from './step-progress-key';
import { createTestVibetestDb, destroyTestVibetestDb } from './test-db-harness';
import type { VibetestDb } from './vibetest-db';

describe('VibetestDb', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('opens and stores a course row', async () => {
    db = createTestVibetestDb();
    const course = parseCourse(minimalValidCourseJson());
    await db.courses.put({ courseId: course.courseId, course });
    const loaded = await db.courses.get(course.courseId);
    expect(loaded?.course.title).toBe('Test course');
  });

  it('stores step progress and queries by courseId', async () => {
    db = createTestVibetestDb();
    const course = parseCourse(minimalValidCourseJson());
    const moduleId = course.modules[0].moduleId;
    const stepId = course.modules[0].steps[0].stepId;
    const progressKey = buildStepProgressKey(course.courseId, moduleId, stepId);

    await db.stepProgress.put({
      progressKey,
      courseId: course.courseId,
      moduleId,
      stepId,
      type: 'theory',
      status: 'in-progress',
      lastCheckFailed: false,
    });

    const rows = await db.stepProgress.where('courseId').equals(course.courseId).toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('in-progress');
  });

  it('deleteCourseAndProgress removes course and progress together', async () => {
    db = createTestVibetestDb();
    const course = parseCourse(minimalValidCourseJson());
    const moduleId = course.modules[0].moduleId;
    const stepId = course.modules[0].steps[0].stepId;

    await db.courses.put({ courseId: course.courseId, course });
    await db.stepProgress.put({
      progressKey: buildStepProgressKey(course.courseId, moduleId, stepId),
      courseId: course.courseId,
      moduleId,
      stepId,
      type: 'theory',
      status: 'completed',
      lastCheckFailed: false,
    });

    await deleteCourseAndProgress(db, course.courseId);

    expect(await db.courses.get(course.courseId)).toBeUndefined();
    expect(await db.stepProgress.where('courseId').equals(course.courseId).count()).toBe(0);
  });
});
