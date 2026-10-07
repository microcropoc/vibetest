import { computed, Injectable, inject, signal, type OnDestroy } from '@angular/core';

import type { Step } from '../courses/course.model';
import { ExecutionWorkerWrapperService } from '../execution/execution-worker-wrapper.service';
import { ReusableWorkerSource } from '../execution/practice-worker-source';
import { firstIncompleteStepIndex } from '../progress/progress-aggregation';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';
import { CourseRepository } from '../storage/course-repository';
import { ProgressRepository } from '../storage/progress-repository';

import {
  isPracticeStep,
  practiceFeedbackFromResult,
  practiceRuntimeErrorFeedback,
  type PracticeFeedback,
  type PracticeStep,
} from './practice-step-view';
import type { PlayerStepCommand } from './player-step-command';
import { applyPracticeResultToStep, reducePlayerStep } from './player-step-reducer';
import type { PracticeRunResult } from './step-engine/practice-run-result';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';
import {
  createJavascriptPracticeWorker,
  runJavascriptPractice,
  type JavascriptStep,
} from './step-engine/javascript';
import {
  createRegexPracticeWorker,
  runRegexPractice,
  type RegexStep,
} from './step-engine/regex';
import {
  runSqlitePractice,
  sqliteWasmAssetUrl,
  warmUpSqlitePractice,
  type SqliteStep,
} from './step-engine/sqlite';
import { stepEnginesByType } from './step-engine/step-engine-registry';

@Injectable()
export class PlayerOrchestratorService implements OnDestroy {
  private readonly courses = inject(CourseRepository);
  private readonly progress = inject(ProgressRepository);
  private readonly execution = inject(ExecutionWorkerWrapperService);
  private sqliteWorkers: Promise<ReusableWorkerSource> | undefined;
  private sqliteWarmUp: Promise<void> | undefined;
  private destroyed = false;

  readonly sessionCourseId = signal('');
  readonly sessionModuleId = signal('');

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly courseTitle = signal('');
  readonly moduleTitle = signal('');
  readonly steps = signal<readonly Step[]>([]);
  readonly currentStepIndex = signal(0);
  readonly snapshotsByStepId = signal<Readonly<Record<string, StepProgressSnapshot>>>({});
  readonly practiceRunning = signal(false);
  readonly practiceFeedback = signal<PracticeFeedback | null>(null);

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
    this.warmUpSqliteIfNeeded();
  }

  selectStep(index: number): void {
    const steps = this.steps();
    if (steps.length === 0) {
      return;
    }
    const clamped = Math.min(Math.max(index, 0), steps.length - 1);
    this.currentStepIndex.set(clamped);
    this.practiceFeedback.set(null);
    this.warmUpSqliteIfNeeded();
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
    this.practiceFeedback.set(null);
    await this.dispatch({ kind: 'retry' });
  }

  async setPracticeDraft(text: string): Promise<void> {
    const step = this.currentStep();
    if (!step) {
      return;
    }
    if (step.type === 'regex') {
      await this.dispatch({ kind: 'setDraftPattern', pattern: text });
      return;
    }
    if (step.type === 'javascript' || step.type === 'sqlite') {
      await this.dispatch({ kind: 'setDraftCode', draftCode: text });
    }
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
    if (!isPracticeStep(step)) {
      return;
    }
    this.practiceRunning.set(true);
    this.practiceFeedback.set(null);

    try {
      const saved = this.snapshotsByStepId()[step.stepId];
      let result: PracticeRunResult;
      try {
        result = await this.runStepPractice(step, saved);
      } catch (error: unknown) {
        this.practiceFeedback.set(practiceRuntimeErrorFeedback(error, step.content.tests.length));
        return;
      }

      this.practiceFeedback.set(practiceFeedbackFromResult(result));
      await this.persistStepSnapshot(step, applyPracticeResultToStep(step, saved, result));
    } finally {
      this.practiceRunning.set(false);
    }
  }

  private async runStepPractice(
    step: PracticeStep,
    saved: StepProgressSnapshot | undefined,
  ): Promise<PracticeRunResult> {
    switch (step.type) {
      case 'javascript': {
        const state = stepEnginesByType.javascript.createInitial(step, saved);
        return runJavascriptPractice(step as JavascriptStep, state.draft.draftCode, {
          wrapper: this.execution,
          createWorker: createJavascriptPracticeWorker,
        });
      }
      case 'sqlite': {
        const workers = await this.sqliteWorkerSource();
        const state = stepEnginesByType.sqlite.createInitial(step, saved);
        return runSqlitePractice(step as SqliteStep, state.draft.draftCode, {
          wrapper: this.execution,
          workers,
          wasmUrl: sqliteWasmAssetUrl(),
        });
      }
      case 'regex': {
        const state = stepEnginesByType.regex.createInitial(step, saved);
        return runRegexPractice(step as RegexStep, state.draft.pattern, {
          wrapper: this.execution,
          createWorker: createRegexPracticeWorker,
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    void this.sqliteWorkers?.then((workers) => workers.dispose());
  }

  private sqliteWorkerSource(): Promise<ReusableWorkerSource> {
    this.sqliteWorkers ??= import('./step-engine/sqlite/sqlite-practice-worker.bootstrap').then(
      ({ createSqlitePracticeWorker }) => new ReusableWorkerSource(createSqlitePracticeWorker),
    );
    return this.sqliteWorkers;
  }

  /**
   * Loads sql.js in the background when a SQL step opens, so the first run does not wait for it.
   * At most one warm-up in flight; a run started meanwhile waits for the shared worker.
   */
  private warmUpSqliteIfNeeded(): void {
    if (
      this.currentStep()?.type !== 'sqlite' ||
      typeof Worker === 'undefined' ||
      this.sqliteWarmUp !== undefined
    ) {
      return;
    }
    this.sqliteWarmUp = this.sqliteWorkerSource()
      .then((workers) => {
        if (this.destroyed) {
          return;
        }
        return warmUpSqlitePractice({
          wrapper: this.execution,
          workers,
          wasmUrl: sqliteWasmAssetUrl(),
        });
      })
      .catch(() => undefined)
      .finally(() => {
        this.sqliteWarmUp = undefined;
      });
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
    this.practiceRunning.set(false);
    this.practiceFeedback.set(null);
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
