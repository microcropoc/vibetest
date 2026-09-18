import type { Course } from './course.model';

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
