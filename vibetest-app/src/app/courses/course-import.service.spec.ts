import { CourseRepository } from '../storage/course-repository';
import { ProgressRepository } from '../storage/progress-repository';
import { buildStepProgressKey } from '../storage/step-progress-key';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from './__fixtures__/course-fixtures';
import { CourseImportService } from './course-import.service';
describe('CourseImportService', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('creates course with regenerateIds (new courseId)', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    const text = JSON.stringify(minimalValidCourseJson());

    const result = await service.importCourse(text, { regenerateIds: true });

    expect(result).toEqual({ ok: true, courseId: expect.any(String), action: 'created' });
    if (result.ok) {
      expect(result.courseId).not.toBe(FIXTURE_COURSE_ID);
      expect(await CourseRepository.forDb(db).get(result.courseId)).toBeDefined();
    }
  });

  it('creates course when courseId is new and regenerateIds is false', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    const text = JSON.stringify(minimalValidCourseJson());

    const result = await service.importCourse(text, { regenerateIds: false });

    expect(result).toEqual({ ok: true, courseId: FIXTURE_COURSE_ID, action: 'created' });
  });

  it('requires replace confirmation when courseId exists', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    const text = JSON.stringify(minimalValidCourseJson());
    await service.importCourse(text, { regenerateIds: false });

    const second = await service.importCourse(
      JSON.stringify({ ...minimalValidCourseJson(), title: 'Updated' }),
      { regenerateIds: false },
    );

    expect(second).toEqual({
      ok: false,
      stage: 'replace-required',
      courseId: FIXTURE_COURSE_ID,
    });
    expect((await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID))?.title).toBe('Test course');
  });

  it('replace with confirmReplace wipes progress and updates course', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    const progressRepo = ProgressRepository.forDb(db);
    const text = JSON.stringify(minimalValidCourseJson());

    await service.importCourse(text, { regenerateIds: false });
    await progressRepo.put(
      {
        courseId: FIXTURE_COURSE_ID,
        moduleId: FIXTURE_MODULE_ID,
        stepId: FIXTURE_STEP_THEORY_ID,
      },
      {
        stepId: FIXTURE_STEP_THEORY_ID,
        type: 'theory',
        status: 'completed',
        lastCheckFailed: false,
        draft: {},
      },
    );

    const result = await service.importCourse(
      JSON.stringify({ ...minimalValidCourseJson(), title: 'Replaced title' }),
      { regenerateIds: false, confirmReplace: true },
    );

    expect(result).toEqual({ ok: true, courseId: FIXTURE_COURSE_ID, action: 'replaced' });
    expect((await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID))?.title).toBe('Replaced title');
    expect(await progressRepo.listByCourseId(FIXTURE_COURSE_ID)).toHaveLength(0);
    expect(
      await db.stepProgress.get(
        buildStepProgressKey(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID, FIXTURE_STEP_THEORY_ID),
      ),
    ).toBeUndefined();
  });

  it('does not save on validation failure', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);

    const result = await service.importCourse('{', { regenerateIds: false });

    expect(result.ok).toBe(false);
    expect(await CourseRepository.forDb(db).list()).toHaveLength(0);
  });
});
