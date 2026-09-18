import type { StepStatus } from '../player/step-engine/step-status';

export type StepIndicatorState = 'current' | 'failed' | 'completed' | 'untouched';

export interface StepProgressEntry {
  readonly status: StepStatus;
  readonly lastCheckFailed: boolean;
}

export type StepProgressByStepId = Readonly<Record<string, StepProgressEntry>>;

export type StepProgressLookup = (stepId: string) => StepProgressEntry | undefined;

export interface StepCountProgress {
  readonly completed: number;
  readonly total: number;
}

export interface ModuleCountProgress {
  readonly completedModules: number;
  readonly totalModules: number;
  readonly steps: StepCountProgress;
}
