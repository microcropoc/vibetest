import type { Step } from '../../courses/course.model';

import type { StepProgressSnapshot } from './step-progress-snapshot';

/**
 * Step engine contract: pure functions, no classes, no central registry (vt-19).
 */
export interface StepEngine<S, C> {
  readonly createInitial: (step: Step, saved?: StepProgressSnapshot) => S;
  readonly reduce: (state: S, command: C) => S;
  readonly toSnapshot: (state: S) => StepProgressSnapshot;
}
