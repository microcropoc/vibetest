import type { Course, Module } from '../courses/course.model';
import { isStepCompleted } from '../player/step-engine/step-status';

import { resolveStepProgress } from './progress-lookup';
import type { ModuleCountProgress, StepCountProgress, StepProgressLookup } from './progress-types';

export function moduleStepProgress(
  module: Module,
  lookup: StepProgressLookup,
): StepCountProgress {
  const total = module.steps.length;
  let completed = 0;
  for (const step of module.steps) {
    if (isStepCompleted(resolveStepProgress(lookup, step.stepId).status)) {
      completed += 1;
    }
  }
  return { completed, total };
}

export function isModuleCompleted(module: Module, lookup: StepProgressLookup): boolean {
  const { completed, total } = moduleStepProgress(module, lookup);
  return total > 0 && completed === total;
}

export function courseModuleProgress(
  course: Course,
  lookup: StepProgressLookup,
): ModuleCountProgress {
  const totalModules = course.modules.length;
  let completedModules = 0;
  let stepsCompleted = 0;
  let stepsTotal = 0;

  for (const module of course.modules) {
    const stepCounts = moduleStepProgress(module, lookup);
    stepsCompleted += stepCounts.completed;
    stepsTotal += stepCounts.total;
    if (isModuleCompleted(module, lookup)) {
      completedModules += 1;
    }
  }

  return {
    completedModules,
    totalModules,
    steps: { completed: stepsCompleted, total: stepsTotal },
  };
}

/**
 * Index of the first step that is not `completed`; if all completed, returns `0`.
 */
export function firstIncompleteStepIndex(module: Module, lookup: StepProgressLookup): number {
  if (module.steps.length === 0) {
    return 0;
  }
  const index = module.steps.findIndex(
    (step) => !isStepCompleted(resolveStepProgress(lookup, step.stepId).status),
  );
  return index === -1 ? 0 : index;
}
