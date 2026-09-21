import type { Course } from './course.model';
import type { ImportCourse } from './import-course-zod-schema';

export interface ImportDtoToCourseDeps {
  readonly randomUuid?: () => string;
  readonly now?: () => Date;
}

const defaultRandomUuid = (): string => crypto.randomUUID();

const defaultNow = (): Date => new Date();

export function importDtoToCourse(dto: ImportCourse, deps: ImportDtoToCourseDeps = {}): Course {
  const randomUuid = deps.randomUuid ?? defaultRandomUuid;
  const now = deps.now ?? defaultNow;

  return {
    schemaVersion: dto.schemaVersion,
    courseId: randomUuid(),
    createdAt: now().toISOString(),
    title: dto.title,
    description: dto.description,
    modules: dto.modules.map((module) => ({
      moduleId: randomUuid(),
      title: module.title,
      steps: module.steps.map((step) => ({
        ...step,
        stepId: randomUuid(),
      })),
    })),
  };
}
