import type { Course } from './course.model';
import { CourseSchema } from './course-zod-schema';

export function parseCourse(value: unknown): Course {
  return CourseSchema.parse(value);
}

export function isCourse(value: unknown): value is Course {
  return CourseSchema.safeParse(value).success;
}
