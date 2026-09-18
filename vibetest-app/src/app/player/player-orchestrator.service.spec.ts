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
