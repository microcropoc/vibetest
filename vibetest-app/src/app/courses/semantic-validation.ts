import type { Course, Module } from './course.model';

export interface SemanticIssue {
  readonly path: string;
  readonly message: string;
}

const SQLITE_RESET_FORBIDDEN_TOKENS = [/\bINSERT\b/i, /\bINTO\b/i] as const;

function collectDuplicateIds(ids: readonly { id: string; path: string }[]): SemanticIssue[] {
  const seen = new Map<string, string>();
  const issues: SemanticIssue[] = [];

  for (const { id, path } of ids) {
    const first = seen.get(id);
    if (first !== undefined) {
      issues.push({
        path,
        message: `Duplicate id ${id} (also at ${first})`,
      });
    } else {
      seen.set(id, path);
    }
  }

  return issues;
}

function validateQuizIndices(course: Course): SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  course.modules.forEach((module, moduleIndex) => {
    module.steps.forEach((step, stepIndex) => {
      if (step.type !== 'quiz') {
        return;
      }
      const { options, correctIndices } = step.content;
      correctIndices.forEach((index, i) => {
        if (index >= options.length) {
          issues.push({
            path: `modules[${moduleIndex}].steps[${stepIndex}].content.correctIndices[${i}]`,
            message: `Index ${index} is out of range for ${options.length} option(s)`,
          });
        }
      });
    });
  });

  return issues;
}

function validateSqliteReset(course: Course): SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  course.modules.forEach((module, moduleIndex) => {
    module.steps.forEach((step, stepIndex) => {
      if (step.type !== 'sqlite') {
        return;
      }
      const reset = step.content.reset;
      if (reset === undefined || reset.trim() === '') {
        return;
      }
      for (const pattern of SQLITE_RESET_FORBIDDEN_TOKENS) {
        if (pattern.test(reset)) {
          issues.push({
            path: `modules[${moduleIndex}].steps[${stepIndex}].content.reset`,
            message: 'SQLite reset must not contain seed DML (INSERT/INTO tokens)',
          });
          break;
        }
      }
    });
  });

  return issues;
}

const MODULE_SEMANTICS_PLACEHOLDER_COURSE_ID = '00000000-0000-4000-8000-000000000001';

/** Maps paths from a one-module temp course (`modules[0]…`) to module-document paths (`steps[i]…`). */
export function remapSingleModuleIssuePath(path: string): string {
  if (path === 'modules[0]') {
    return '(root)';
  }
  return path.replace(/^modules\[0\]\./, '');
}

/** Semantic rules for one canonical module (quiz indices, sqlite reset, duplicate step ids). */
export function validateModuleSemantics(module: Module): readonly SemanticIssue[] {
  const tempCourse: Course = {
    schemaVersion: 1,
    courseId: MODULE_SEMANTICS_PLACEHOLDER_COURSE_ID,
    createdAt: '2020-01-01T00:00:00.000Z',
    title: 'temp',
    description: 'temp',
    modules: [module],
  };

  return validateCourseSemantics(tempCourse).map((issue) => ({
    ...issue,
    path: remapSingleModuleIssuePath(issue.path),
  }));
}

/** Checks append constraints against an existing course document. */
export function validateAppendModuleToCourse(
  course: Course,
  module: Module,
): readonly SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  if (course.modules.length >= 100) {
    issues.push({
      path: 'course',
      message: 'Course already has the maximum of 100 modules',
    });
  }

  const existingIds = new Set<string>([course.courseId]);
  for (const existingModule of course.modules) {
    existingIds.add(existingModule.moduleId);
    for (const step of existingModule.steps) {
      existingIds.add(step.stepId);
    }
  }

  if (existingIds.has(module.moduleId)) {
    issues.push({
      path: 'moduleId',
      message: `Duplicate moduleId ${module.moduleId}`,
    });
  }

  module.steps.forEach((step, stepIndex) => {
    if (existingIds.has(step.stepId)) {
      issues.push({
        path: `steps[${stepIndex}].stepId`,
        message: `Duplicate stepId ${step.stepId}`,
      });
    }
  });

  return [...issues, ...validateModuleSemantics(module)];
}

export function courseWithAppendedModule(course: Course, module: Module): Course {
  return {
    ...course,
    modules: [...course.modules, module],
  };
}

export function validateCourseSemantics(course: Course): readonly SemanticIssue[] {
  const idEntries: { id: string; path: string }[] = [
    { id: course.courseId, path: 'courseId' },
  ];

  course.modules.forEach((module, moduleIndex) => {
    idEntries.push({ id: module.moduleId, path: `modules[${moduleIndex}].moduleId` });
    module.steps.forEach((step, stepIndex) => {
      idEntries.push({
        id: step.stepId,
        path: `modules[${moduleIndex}].steps[${stepIndex}].stepId`,
      });
    });
  });

  return [
    ...collectDuplicateIds(idEntries),
    ...validateQuizIndices(course),
    ...validateSqliteReset(course),
  ];
}
