import type { Course } from './course.model';

export function regenerateCourseIds(course: Course): Course {
  return {
    ...course,
    courseId: crypto.randomUUID(),
    modules: course.modules.map((module) => ({
      ...module,
      moduleId: crypto.randomUUID(),
      steps: module.steps.map((step) => ({
        ...step,
        stepId: crypto.randomUUID(),
      })),
    })),
  };
}
