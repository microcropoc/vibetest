import type { ZodError } from 'zod';

import type { Course } from './course.model';
import type { ImportCourse } from './import-course-zod-schema';
import { ImportCourseSchema } from './import-course-zod-schema';
import { importDtoToCourse, type ImportDtoToCourseDeps } from './import-dto-to-course';
import type { ImportIssue, ImportValidationStage } from './import-types';
import { validateCourseSemantics } from './semantic-validation';
import {
  UnwrapJsonImportTextError,
  unwrapJsonImportText,
} from './unwrap-json-import-text';

export type ImportParseSuccess = { readonly ok: true; readonly course: Course };

export type ImportParseFailure = {
  readonly ok: false;
  readonly stage: ImportValidationStage;
  readonly issues: readonly ImportIssue[];
};

export type ImportParseResult = ImportParseSuccess | ImportParseFailure;

export type ImportCourseDtoParseResult =
  | { readonly ok: true; readonly dto: ImportCourse }
  | ImportParseFailure;

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

export function formatImportParseIssues(
  label: string,
  stage: ImportValidationStage,
  issues: readonly ImportIssue[],
): string {
  const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
  return `${label}: ${stage}: ${detail}`;
}

/** Parse import text through JSON + Zod only (no UUID assignment). */
export function parseImportCourseDtoText(text: string): ImportCourseDtoParseResult {
  let jsonText: string;
  try {
    jsonText = unwrapJsonImportText(text);
  } catch (error: unknown) {
    const message =
      error instanceof UnwrapJsonImportTextError
        ? error.message
        : 'Некорректный формат импорта.';
    return { ok: false, stage: 'json', issues: [{ path: 'json', message }] };
  }

  let jsonValue: unknown;
  try {
    jsonValue = JSON.parse(jsonText);
  } catch (error: unknown) {
    return { ok: false, stage: 'json', issues: [jsonParseIssue(error)] };
  }

  const zodResult = ImportCourseSchema.safeParse(jsonValue);
  if (!zodResult.success) {
    return { ok: false, stage: 'zod', issues: zodIssues(zodResult.error) };
  }

  return { ok: true, dto: zodResult.data };
}

export function parseImportCourseText(
  text: string,
  dtoDeps: ImportDtoToCourseDeps = {},
): ImportParseResult {
  const dtoResult = parseImportCourseDtoText(text);
  if (!dtoResult.ok) {
    return dtoResult;
  }

  const course = importDtoToCourse(dtoResult.dto, dtoDeps);
  const semanticIssues = validateCourseSemantics(course);
  if (semanticIssues.length > 0) {
    return { ok: false, stage: 'semantic', issues: semanticIssues };
  }

  return { ok: true, course };
}
