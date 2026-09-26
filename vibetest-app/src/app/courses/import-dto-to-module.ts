import type { Module } from './course.model';
import type { ImportModuleDocument } from './import-course-zod-schema';

export interface ImportDtoToModuleDeps {
  readonly randomUuid?: () => string;
}

const defaultRandomUuid = (): string => crypto.randomUUID();

export function importDtoToModule(
  dto: ImportModuleDocument,
  deps: ImportDtoToModuleDeps = {},
): Module {
  const randomUuid = deps.randomUuid ?? defaultRandomUuid;

  return {
    moduleId: randomUuid(),
    title: dto.title,
    steps: dto.steps.map((step) => ({
      ...step,
      stepId: randomUuid(),
    })),
  };
}
