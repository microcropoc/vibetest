import type { Module } from './course.model';
import { moduleStepProgress } from '../progress/progress-aggregation';
import type { StepProgressLookup } from '../progress/progress-types';

export interface ModuleListItemView {
  readonly moduleId: string;
  readonly title: string;
  readonly completedSteps: number;
  readonly totalSteps: number;
}

export function moduleListItemView(
  module: Module,
  lookup: StepProgressLookup,
): ModuleListItemView {
  const { completed, total } = moduleStepProgress(module, lookup);
  return {
    moduleId: module.moduleId,
    title: module.title,
    completedSteps: completed,
    totalSteps: total,
  };
}
