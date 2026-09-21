import type { Course } from './course.model';
import { formatCourseCreatedAt } from './format-course-created-at';
import { courseModuleProgress } from '../progress/progress-aggregation';
import { stepProgressLookupFromSnapshots } from '../progress/progress-lookup';
import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

export interface CourseListItemView {
  readonly courseId: string;
  readonly title: string;
  readonly completedModules: number;
  readonly totalModules: number;
  readonly completedSteps: number;
  readonly totalSteps: number;
  readonly createdAt: string;
  readonly createdAtLabel: string;
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
    completedSteps: progress.steps.completed,
    totalSteps: progress.steps.total,
    createdAt: course.createdAt,
    createdAtLabel: formatCourseCreatedAt(course.createdAt),
  };
}
