import { CourseRepository } from '../storage/course-repository';
import { ProgressRepository } from '../storage/progress-repository';
import { buildStepProgressKey } from '../storage/step-progress-key';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidImportJson,
  minimalValidImportModuleJson,
} from './__fixtures__/course-fixtures';
import { CourseImportService } from './course-import.service';
import type { PracticeReferenceValidationDeps } from './validate-practice-references';

const IMPORT_UUIDS = [
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_THEORY_ID,
  FIXTURE_STEP_QUIZ_ID,
];

function stubImportUuids(...queues: readonly (readonly string[])[]): void {
  let queueIndex = 0;
  let withinQueue = 0;
  vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
    const queue = queues[queueIndex] ?? IMPORT_UUIDS;
    const id = queue[withinQueue];
    withinQueue += 1;
    if (withinQueue >= queue.length) {
      withinQueue = 0;
      queueIndex += 1;
    }
    if (id === undefined) {
      throw new Error('UUID queue exhausted');
    }
    return id as `${string}-${string}-${string}-${string}-${string}`;
  });
}

function mockPracticeDeps(
  overrides?: Partial<PracticeReferenceValidationDeps>,
): PracticeReferenceValidationDeps {
  return {
    runJavascriptStep: vi.fn().mockResolvedValue({ ok: true }),
    runSqliteStep: vi.fn().mockResolvedValue({ ok: true }),
    runRegexStep: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  };
}

describe('CourseImportService', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('creates course with regenerateIds (new courseId)', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(IMPORT_UUIDS, [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
    ]);
    const text = JSON.stringify(minimalValidImportJson());

    const result = await service.importCourse(text, { regenerateIds: true });

    expect(result).toEqual({ ok: true, courseId: '11111111-1111-4111-8111-111111111111', action: 'created' });
    if (result.ok) {
      expect(result.courseId).not.toBe(FIXTURE_COURSE_ID);
      expect(await CourseRepository.forDb(db).get(result.courseId)).toBeDefined();
    }
  });

  it('creates course when regenerateIds is false', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(IMPORT_UUIDS);
    const text = JSON.stringify(minimalValidImportJson());

    const result = await service.importCourse(text, { regenerateIds: false });

    expect(result).toEqual({ ok: true, courseId: FIXTURE_COURSE_ID, action: 'created' });
  });

  it('requires replace confirmation when courseId exists', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(IMPORT_UUIDS, IMPORT_UUIDS);
    const text = JSON.stringify(minimalValidImportJson());
    await service.importCourse(text, { regenerateIds: false });

    const second = await service.importCourse(
      JSON.stringify({ ...minimalValidImportJson(), title: 'Updated' }),
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
    stubImportUuids(IMPORT_UUIDS, IMPORT_UUIDS);
    const text = JSON.stringify(minimalValidImportJson());

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
      JSON.stringify({ ...minimalValidImportJson(), title: 'Replaced title' }),
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

  it('does not run practice validation when flag is off', async () => {
    db = createTestVibetestDb();
    const practiceDeps = mockPracticeDeps();
    const service = CourseImportService.forDb(db, { practiceValidationDeps: practiceDeps });
    stubImportUuids(IMPORT_UUIDS);

    await service.importCourse(JSON.stringify(minimalValidImportJson()), { regenerateIds: false });

    expect(practiceDeps.runJavascriptStep).not.toHaveBeenCalled();
    expect(practiceDeps.runSqliteStep).not.toHaveBeenCalled();
    expect(practiceDeps.runRegexStep).not.toHaveBeenCalled();
  });

  it('returns practice stage and does not save when self-check fails', async () => {
    db = createTestVibetestDb();
    const practiceDeps = mockPracticeDeps({
      runJavascriptStep: vi.fn().mockResolvedValue({
        ok: false,
        failedTestIndex: 0,
        message: 'broken',
      }),
    });
    const service = CourseImportService.forDb(db, { practiceValidationDeps: practiceDeps });
    stubImportUuids(IMPORT_UUIDS);

    const importJson = {
      ...minimalValidImportJson(),
      modules: [
        {
          title: 'Practice',
          steps: [
            {
              type: 'javascript',
              title: 'Add',
              content: {
                description: 'd',
                starterCode: 'const add = () => 0;',
                referenceSolution: 'const add = () => 1;',
                setup: '',
                functionName: 'add',
                timeoutMs: 2000,
                tests: [{ args: [] }],
              },
            },
          ],
        },
      ],
    };

    const result = await service.importCourse(JSON.stringify(importJson), {
      regenerateIds: false,
      validatePracticeSteps: true,
    });

    expect(result).toEqual({
      ok: false,
      stage: 'practice',
      issues: [{ path: 'modules[0].steps[0]', message: 'test 0: broken' }],
    });
    expect(practiceDeps.runJavascriptStep).toHaveBeenCalledOnce();
    expect(await CourseRepository.forDb(db).list()).toHaveLength(0);
  });

  it('appends module to existing course without wiping progress', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    const progressRepo = ProgressRepository.forDb(db);
    const appendModuleId = 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a77';
    const appendStepId = 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a88';
    stubImportUuids(IMPORT_UUIDS, [appendModuleId, appendStepId]);

    await service.importCourse(JSON.stringify(minimalValidImportJson()), { regenerateIds: false });
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

    const result = await service.importModule(JSON.stringify(minimalValidImportModuleJson()), {
      courseId: FIXTURE_COURSE_ID,
    });

    expect(result).toEqual({
      ok: true,
      courseId: FIXTURE_COURSE_ID,
      moduleId: appendModuleId,
      action: 'appended',
    });

    const course = await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID);
    expect(course?.modules).toHaveLength(2);
    expect(course?.modules[1]?.moduleId).toBe(appendModuleId);
    expect(await progressRepo.listByCourseId(FIXTURE_COURSE_ID)).toHaveLength(1);
  });

  it('returns target stage when course is missing for module import', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']);

    const result = await service.importModule(JSON.stringify(minimalValidImportModuleJson()), {
      courseId: FIXTURE_COURSE_ID,
    });

    expect(result).toEqual({ ok: false, stage: 'target', courseId: FIXTURE_COURSE_ID });
  });

  it('returns target before semantic when course is missing', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']);

    const badQuizModule = {
      schemaVersion: 1,
      title: 'Bad quiz',
      steps: [
        {
          type: 'quiz',
          title: 'Q',
          content: {
            question: 'Q',
            options: ['A', 'B'],
            correctIndices: [2],
          },
        },
      ],
    };

    const result = await service.importModule(JSON.stringify(badQuizModule), {
      courseId: FIXTURE_COURSE_ID,
    });

    expect(result).toEqual({ ok: false, stage: 'target', courseId: FIXTURE_COURSE_ID });
  });

  it('returns semantic for invalid quiz indices when course exists', async () => {
    db = createTestVibetestDb();
    const service = CourseImportService.forDb(db);
    stubImportUuids(IMPORT_UUIDS, [
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    ]);

    await service.importCourse(JSON.stringify(minimalValidImportJson()), { regenerateIds: false });

    const badQuizModule = {
      schemaVersion: 1,
      title: 'Bad quiz',
      steps: [
        {
          type: 'quiz',
          title: 'Q',
          content: {
            question: 'Q',
            options: ['A', 'B'],
            correctIndices: [2],
          },
        },
      ],
    };

    const result = await service.importModule(JSON.stringify(badQuizModule), {
      courseId: FIXTURE_COURSE_ID,
    });

    expect(result).toEqual({
      ok: false,
      stage: 'semantic',
      issues: [
        {
          path: 'steps[0].content.correctIndices[0]',
          message: 'Index 2 is out of range for 2 option(s)',
        },
      ],
    });
    expect((await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID))?.modules).toHaveLength(1);
  });

  it('remaps practice issues to steps[i] paths for module import', async () => {
    db = createTestVibetestDb();
    const practiceDeps = mockPracticeDeps({
      runJavascriptStep: vi.fn().mockResolvedValue({
        ok: false,
        failedTestIndex: 0,
        message: 'broken',
      }),
    });
    const service = CourseImportService.forDb(db, { practiceValidationDeps: practiceDeps });
    stubImportUuids(IMPORT_UUIDS, [
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    ]);

    await service.importCourse(JSON.stringify(minimalValidImportJson()), { regenerateIds: false });

    const moduleJson = {
      schemaVersion: 1,
      title: 'Practice module',
      steps: [
        {
          type: 'javascript',
          title: 'Add',
          content: {
            description: 'd',
            starterCode: 'const add = () => 0;',
            referenceSolution: 'const add = () => 1;',
            setup: '',
            functionName: 'add',
            timeoutMs: 2000,
            tests: [{ args: [] }],
          },
        },
      ],
    };

    const result = await service.importModule(JSON.stringify(moduleJson), {
      courseId: FIXTURE_COURSE_ID,
      validatePracticeSteps: true,
    });

    expect(result).toEqual({
      ok: false,
      stage: 'practice',
      issues: [{ path: 'steps[0]', message: 'test 0: broken' }],
    });
    expect((await CourseRepository.forDb(db).get(FIXTURE_COURSE_ID))?.modules).toHaveLength(1);
  });
});
