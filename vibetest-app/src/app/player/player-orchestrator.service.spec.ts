import { TestBed } from '@angular/core/testing';

import type { Course } from '../courses/course.model';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from '../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../courses/parse-course';
import { ExecutionWorkerWrapperService } from '../execution/execution-worker-wrapper.service';
import { CourseRepository } from '../storage/course-repository';
import { ProgressRepository } from '../storage/progress-repository';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

import { PlayerOrchestratorService } from './player-orchestrator.service';

describe('PlayerOrchestratorService', () => {
  const course = parseCourse(minimalValidCourseJson());
  const theoryCompleted: StepProgressSnapshot = {
    stepId: FIXTURE_STEP_THEORY_ID,
    type: 'theory',
    status: 'completed',
    lastCheckFailed: false,
    draft: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        PlayerOrchestratorService,
        {
          provide: CourseRepository,
          useValue: {
            get: vi.fn().mockImplementation(async (id: string) =>
              id === FIXTURE_COURSE_ID ? (course as Course) : undefined,
            ),
          },
        },
        {
          provide: ProgressRepository,
          useValue: {
            listByCourseId: vi.fn().mockResolvedValue([theoryCompleted]),
            put: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compileComponents();
  });

  it('opens first incomplete step when earlier steps are completed', async () => {
    const orchestrator = TestBed.inject(PlayerOrchestratorService);
    await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);
    expect(orchestrator.currentStep()?.stepId).toBe(FIXTURE_STEP_QUIZ_ID);
  });

  describe('with empty progress', () => {
    beforeEach(async () => {
      TestBed.overrideProvider(ProgressRepository, {
        useValue: {
          listByCourseId: vi.fn().mockResolvedValue([]),
          put: vi.fn().mockResolvedValue(undefined),
        },
      });
    });

    it('goNext completes theory step and moves to quiz', async () => {
      const orchestrator = TestBed.inject(PlayerOrchestratorService);
      await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);
      expect(orchestrator.currentStep()?.stepId).toBe(FIXTURE_STEP_THEORY_ID);
      await orchestrator.goNext();
      expect(orchestrator.currentStep()?.stepId).toBe(FIXTURE_STEP_QUIZ_ID);
      expect(orchestrator.snapshotsByStepId()[FIXTURE_STEP_THEORY_ID]?.status).toBe('completed');
    });
  });

  it('retry dispatches retry command', async () => {
    const orchestrator = TestBed.inject(PlayerOrchestratorService);
    const progress = TestBed.inject(ProgressRepository);
    await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);
    await orchestrator.selectStep(1);
    await orchestrator.retry();
    expect(progress.put).toHaveBeenCalled();
  });

  function regexCourse(): Course {
    const json = minimalValidCourseJson();
    return parseCourse({
      ...json,
      modules: [
        {
          moduleId: FIXTURE_MODULE_ID,
          title: 'Module 1',
          steps: [
            {
              stepId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
              type: 'regex',
              title: 'Digits',
              content: {
                description: 'Digits only',
                starterCode: '',
                referenceSolution: '^\\d+$',
                timeoutMs: 1000,
                tests: [{ input: '123' }, { input: 'abc' }],
              },
            },
          ],
        },
      ],
    });
  }

  it('shows a runtime error instead of failing silently when the practice run throws', async () => {
    TestBed.overrideProvider(CourseRepository, {
      useValue: { get: vi.fn().mockResolvedValue(regexCourse()) },
    });
    const orchestrator = TestBed.inject(PlayerOrchestratorService);
    await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);

    await orchestrator.runPractice();

    expect(orchestrator.practiceRunning()).toBe(false);
    expect(orchestrator.practiceFeedback()).toEqual({
      kind: 'error',
      message: expect.stringMatching(/^Ошибка выполнения: /),
      tests: { passed: 0, total: 2 },
    });
  });

  describe('when saving progress fails after a run', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('shows the run result and does not report it as a runtime error', async () => {
      vi.stubGlobal(
        'Worker',
        class {
          terminate(): void {}
        },
      );
      TestBed.overrideProvider(CourseRepository, {
        useValue: { get: vi.fn().mockResolvedValue(regexCourse()) },
      });
      TestBed.overrideProvider(ProgressRepository, {
        useValue: {
          listByCourseId: vi.fn().mockResolvedValue([]),
          put: vi.fn().mockRejectedValue(new Error('QuotaExceededError')),
        },
      });
      TestBed.overrideProvider(ExecutionWorkerWrapperService, {
        useValue: {
          runRequest: vi.fn(async (_worker: Worker, request: { type: string; id: string }) =>
            request.type === 'regexInit'
              ? { type: 'regexInited', id: request.id }
              : { type: 'regexCaseResult', id: request.id, pass: true, userMs: 1, referenceMs: 1 },
          ),
        },
      });
      const orchestrator = TestBed.inject(PlayerOrchestratorService);
      await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);

      await expect(orchestrator.runPractice()).rejects.toThrow('QuotaExceededError');

      expect(orchestrator.practiceRunning()).toBe(false);
      expect(orchestrator.practiceFeedback()).toEqual({
        kind: 'success',
        message: 'Все проверки пройдены.',
        tests: { passed: 2, total: 2 },
        timing: { userMs: 2, referenceMs: 2 },
      });
    });
  });

  it('persists snapshot on dispatch', async () => {
    const orchestrator = TestBed.inject(PlayerOrchestratorService);
    const progress = TestBed.inject(ProgressRepository);
    await orchestrator.load(FIXTURE_COURSE_ID, FIXTURE_MODULE_ID);
    await orchestrator.dispatch({ kind: 'setSelection', selectedIndices: [1] });
    await orchestrator.dispatch({ kind: 'submitAnswer' });
    expect(progress.put).toHaveBeenCalled();
    expect(orchestrator.currentSnapshot()?.lastCheckFailed).toBe(true);
  });
});
