import type { Course } from './course.model';

export function compareCoursesByCreatedAtDesc(a: Course, b: Course): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function sortCoursesByCreatedAtDesc(
  courses: readonly Course[],
): readonly Course[] {
  return [...courses].sort(compareCoursesByCreatedAtDesc);
}
