import { parseCourse } from '../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from '../courses/__fixtures__/course-fixtures';
import {
  defaultStepProgressSnapshot,
  type StepProgressSnapshot,
} from '../player/step-engine/step-progress-snapshot';

import { CourseRepository } from './course-repository';
import { deleteStepProgressByCourseId } from './delete-step-progress-by-course-id';
import { ProgressRepository } from './progress-repository';
import { courseToRow } from './course-row-parse';
import { createTestVibetestDb, destroyTestVibetestDb } from './test-db-harness';
import type { VibetestDb } from './vibetest-db';

describe('ProgressRepository', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('put/get roundtrip and list by course', async () => {
    db = createTestVibetestDb();
    const progressRepo = ProgressRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());
    const ref = {
      courseId: FIXTURE_COURSE_ID,
      moduleId: FIXTURE_MODULE_ID,
      stepId: FIXTURE_STEP_QUIZ_ID,
    };
    const snapshot: StepProgressSnapshot = {
      stepId: FIXTURE_STEP_QUIZ_ID,
      type: 'quiz',
      status: 'in-progress',
      lastCheckFailed: true,
      draft: { selectedIndices: [1] },
    };

    await progressRepo.put(ref, snapshot);

    const loaded = await progressRepo.get(ref);
    expect(loaded).toEqual(snapshot);

    const listed = await progressRepo.listByCourseId(FIXTURE_COURSE_ID);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.stepId).toBe(FIXTURE_STEP_QUIZ_ID);
  });

  it('deleteAllByCourseId uses vt-12 helper only', async () => {
    db = createTestVibetestDb();
    const progressRepo = ProgressRepository.forDb(db);
    const courseRepo = CourseRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());

    await courseRepo.put(course);
    await progressRepo.put(
      {
        courseId: FIXTURE_COURSE_ID,
        moduleId: FIXTURE_MODULE_ID,
        stepId: FIXTURE_STEP_THEORY_ID,
      },
      defaultStepProgressSnapshot(course.modules[0].steps[0]),
    );

    const deleted = await progressRepo.deleteAllByCourseId(FIXTURE_COURSE_ID);
    expect(deleted).toBe(1);
    expect(await progressRepo.listByCourseId(FIXTURE_COURSE_ID)).toHaveLength(0);
    expect(await courseRepo.get(FIXTURE_COURSE_ID)).toBeDefined();
  });

  it('composes helper with courses.put in external transaction (import replace)', async () => {
    db = createTestVibetestDb();
    const progressRepo = ProgressRepository.forDb(db);
    const course = parseCourse(minimalValidCourseJson());
    const replacement = parseCourse({ ...minimalValidCourseJson(), title: 'Replaced' });

    await progressRepo.put(
      {
        courseId: FIXTURE_COURSE_ID,
        moduleId: FIXTURE_MODULE_ID,
        stepId: FIXTURE_STEP_THEORY_ID,
      },
      defaultStepProgressSnapshot(course.modules[0].steps[0]),
    );

    await db.transaction('rw', db.courses, db.stepProgress, async () => {
      await deleteStepProgressByCourseId(db!.stepProgress, FIXTURE_COURSE_ID);
      await db!.courses.put(courseToRow(replacement));
    });

    expect(await progressRepo.listByCourseId(FIXTURE_COURSE_ID)).toHaveLength(0);
    expect((await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID))?.title).toBe('Replaced');
  });
});
