import type { Course } from './course.model';
import { courseModuleProgress } from '../progress/progress-aggregation';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';
import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

export interface CourseListItemView {
  readonly courseId: string;
  readonly title: string;
  readonly completedModules: number;
  readonly totalModules: number;
}

export function courseListItemView(
  course: Course,
  snapshots: readonly StepProgressSnapshot[],
): CourseListItemView {
  const lookup = stepProgressLookupFromSnapshots(snapshots);
  const progress = courseModuleProgress(course, lookup);
  return {
    courseId: course.courseId,
    title: course.title,
    completedModules: progress.completedModules,
    totalModules: progress.totalModules,
  };
}
