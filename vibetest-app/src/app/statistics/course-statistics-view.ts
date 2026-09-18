import type { Course } from '../courses/course.model';
import { courseModuleProgress } from '../progress/progress-aggregation';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';
import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

export interface CourseStatisticsView {
  readonly courseId: string;
  readonly title: string;
  readonly completedModules: number;
  readonly totalModules: number;
  readonly completedSteps: number;
  readonly totalSteps: number;
}

export function courseStatisticsView(
  course: Course,
  snapshots: readonly StepProgressSnapshot[],
): CourseStatisticsView {
  const lookup = stepProgressLookupFromSnapshots(snapshots);
  const progress = courseModuleProgress(course, lookup);
  return {
    courseId: course.courseId,
    title: course.title,
    completedModules: progress.completedModules,
    totalModules: progress.totalModules,
    completedSteps: progress.steps.completed,
    totalSteps: progress.steps.total,
  };
}
