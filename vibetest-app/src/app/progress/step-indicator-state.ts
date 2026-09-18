import type { StepProgressEntry, StepIndicatorState } from './progress-types';
import { isStepCompleted } from '../player/step-engine/step-status';

export function stepIndicatorState(
  progress: StepProgressEntry,
  isCurrentStep: boolean,
): StepIndicatorState {
  if (isCurrentStep) {
    return 'current';
  }
  if (progress.lastCheckFailed) {
    return 'failed';
  }
  if (isStepCompleted(progress.status)) {
    return 'completed';
  }
  return 'untouched';
}
