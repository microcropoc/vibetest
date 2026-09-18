import { computed, Injectable, inject, signal } from '@angular/core';

import type { Step } from '../courses/course.model';
import { defaultWorkerFactory } from '../execution/worker-factory';
import { ExecutionWorkerWrapperService } from '../execution/execution-worker-wrapper.service';
import { firstIncompleteStepIndex } from '../progress/progress-aggregation';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';
import { CourseRepository } from '../storage/course-repository';
import { ProgressRepository } from '../storage/progress-repository';

import type { PlayerStepCommand } from './player-step-command';
import { applyPracticeResultToStep, reducePlayerStep } from './player-step-reducer';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';
import {
  javascriptPracticeWorkerUrl,
  runJavascriptPractice,
  type JavascriptStep,
} from './step-engine/javascript';
import {
  regexPracticeWorkerUrl,
  runRegexPractice,
  type RegexStep,
} from './step-engine/regex';
import {
  runSqlitePractice,
  sqlitePracticeWorkerUrl,
  sqliteWasmAssetUrl,
  type SqliteStep,
} from './step-engine/sqlite';
import { stepEnginesByType } from './step-engine/step-engine-registry';

@Injectable()
export class PlayerOrchestratorService {
  private readonly courses = inject(CourseRepository);
  private readonly progress = inject(ProgressRepository);
  private readonly execution = inject(ExecutionWorkerWrapperService);

  readonly sessionCourseId = signal('');
  readonly sessionModuleId = signal('');

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly courseTitle = signal('');
  readonly moduleTitle = signal('');
  readonly steps = signal<readonly Step[]>([]);
  readonly currentStepIndex = signal(0);
  readonly snapshotsByStepId = signal<Readonly<Record<string, StepProgressSnapshot>>>({});

  readonly currentStep = computed((): Step | undefined => {
    const steps = this.steps();
    const index = this.currentStepIndex();
    return steps[index];
  });

  readonly currentSnapshot = computed((): StepProgressSnapshot | undefined => {
    const step = this.currentStep();
    if (!step) {
      return undefined;
    }
    return this.snapshotsByStepId()[step.stepId];
  });

  readonly isFirstStep = computed(() => this.currentStepIndex() <= 0);

  readonly isLastStep = computed(() => {
    const steps = this.steps();
    if (steps.length === 0) {
      return false;
    }
    return this.currentStepIndex() >= steps.length - 1;
  });

  async load(courseId: string, moduleId: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    this.sessionCourseId.set(courseId);
    this.sessionModuleId.set(moduleId);

    const course = await this.courses.get(courseId);
    const module = course?.modules.find((item) => item.moduleId === moduleId);
    if (!course || !module) {
      this.resetSession();
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    const snapshots = await this.progress.listByCourseId(courseId);
    const lookup = stepProgressLookupFromSnapshots(snapshots);
    const initialIndex = firstIncompleteStepIndex(module, lookup);

    this.courseTitle.set(course.title);
    this.moduleTitle.set(module.title);
    this.steps.set(module.steps);
    this.snapshotsByStepId.set(snapshotsToRecord(snapshots));
    this.currentStepIndex.set(initialIndex);
    this.loading.set(false);
  }

  selectStep(index: number): void {
    const steps = this.steps();
    if (steps.length === 0) {
      return;
    }
    const clamped = Math.min(Math.max(index, 0), steps.length - 1);
    this.currentStepIndex.set(clamped);
  }

  goBack(): void {
    this.selectStep(this.currentStepIndex() - 1);
  }

  async goNext(): Promise<void> {
    const step = this.currentStep();
    const index = this.currentStepIndex();
    const steps = this.steps();
    if (!step || index >= steps.length - 1) {
      return;
    }
    if (step.type === 'theory' || step.type === 'svg') {
      await this.dispatch({ kind: 'advance' });
    }
    this.selectStep(index + 1);
  }

  async retry(): Promise<void> {
    await this.dispatch({ kind: 'retry' });
  }

  async dispatch(command: PlayerStepCommand): Promise<void> {
    const step = this.currentStep();
    if (!step) {
      return;
    }
    const saved = this.snapshotsByStepId()[step.stepId];
    const snapshot = reducePlayerStep(step, saved, command);
    await this.persistStepSnapshot(step, snapshot);
  }

  async runPractice(): Promise<void> {
    const step = this.currentStep();
    if (!step) {
      return;
    }
    const saved = this.snapshotsByStepId()[step.stepId];
    const deps = {
      wrapper: this.execution,
      createWorker: defaultWorkerFactory,
    };

    let result;
    switch (step.type) {
      case 'javascript': {
        const state = stepEnginesByType.javascript.createInitial(step, saved);
        result = await runJavascriptPractice(step as JavascriptStep, state.draft.draftCode, {
          ...deps,
          workerScriptUrl: javascriptPracticeWorkerUrl(),
        });
        break;
      }
      case 'sqlite': {
        const state = stepEnginesByType.sqlite.createInitial(step, saved);
        result = await runSqlitePractice(step as SqliteStep, state.draft.draftCode, {
          ...deps,
          workerScriptUrl: sqlitePracticeWorkerUrl(),
          wasmUrl: sqliteWasmAssetUrl(),
        });
        break;
      }
      case 'regex': {
        const state = stepEnginesByType.regex.createInitial(step, saved);
        result = await runRegexPractice(step as RegexStep, state.draft.pattern, {
          ...deps,
          workerScriptUrl: regexPracticeWorkerUrl(),
        });
        break;
      }
      default:
        return;
    }

    const snapshot = applyPracticeResultToStep(step, saved, result);
    await this.persistStepSnapshot(step, snapshot);
  }

  private async persistStepSnapshot(step: Step, snapshot: StepProgressSnapshot): Promise<void> {
    await this.progress.put(
      {
        courseId: this.sessionCourseId(),
        moduleId: this.sessionModuleId(),
        stepId: step.stepId,
      },
      snapshot,
    );
    this.snapshotsByStepId.update((map) => ({
      ...map,
      [step.stepId]: snapshot,
    }));
  }

  private resetSession(): void {
    this.sessionCourseId.set('');
    this.sessionModuleId.set('');
    this.courseTitle.set('');
    this.moduleTitle.set('');
    this.steps.set([]);
    this.currentStepIndex.set(0);
    this.snapshotsByStepId.set({});
  }
}

function snapshotsToRecord(
  snapshots: readonly StepProgressSnapshot[],
): Readonly<Record<string, StepProgressSnapshot>> {
  const map: Record<string, StepProgressSnapshot> = {};
  for (const snapshot of snapshots) {
    map[snapshot.stepId] = snapshot;
  }
  return map;
}
