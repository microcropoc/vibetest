import type { ZodError } from 'zod';

import type { Course } from './course.model';
import { importDtoToCourse } from './import-dto-to-course';
import { ImportCourseSchema } from './import-course-zod-schema';
import type { ImportIssue, ImportValidationStage } from './import-types';
import { validateCourseSemantics } from './semantic-validation';

export type ImportParseSuccess = { readonly ok: true; readonly course: Course };

export type ImportParseFailure = {
  readonly ok: false;
  readonly stage: ImportValidationStage;
  readonly issues: readonly ImportIssue[];
};

export type ImportParseResult = ImportParseSuccess | ImportParseFailure;

function jsonParseIssue(error: unknown): ImportIssue {
  const message = error instanceof SyntaxError ? error.message : 'Invalid JSON';
  return { path: 'json', message };
}

function zodIssues(error: ZodError): readonly ImportIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : '(root)',
    message: issue.message,
  }));
}

export function parseImportCourseText(text: string): ImportParseResult {
  let jsonValue: unknown;
  try {
    jsonValue = JSON.parse(text);
  } catch (error: unknown) {
    return { ok: false, stage: 'json', issues: [jsonParseIssue(error)] };
  }

  const zodResult = ImportCourseSchema.safeParse(jsonValue);
  if (!zodResult.success) {
    return { ok: false, stage: 'zod', issues: zodIssues(zodResult.error) };
  }

  const course = importDtoToCourse(zodResult.data);
  const semanticIssues = validateCourseSemantics(course);
  if (semanticIssues.length > 0) {
    return { ok: false, stage: 'semantic', issues: semanticIssues };
  }

  return { ok: true, course };
}
