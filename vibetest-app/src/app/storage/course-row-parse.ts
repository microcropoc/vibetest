import { parseCourse } from '../courses/parse-course';
import type { Course } from '../courses/course.model';

import type { CourseRow } from './storage-row-types';

export function courseFromRow(row: CourseRow): Course {
  return parseCourse(row.course);
}

export function courseToRow(course: Course): CourseRow {
  return { courseId: course.courseId, course };
}
