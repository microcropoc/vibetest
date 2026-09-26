import type { ZodError } from 'zod';

import type { Module } from './course.model';
import { importDtoToModule } from './import-dto-to-module';
import { ImportModuleDocumentSchema } from './import-course-zod-schema';
import type { ImportIssue, ImportValidationStage } from './import-types';
import {
  UnwrapJsonImportTextError,
  unwrapJsonImportText,
} from './unwrap-json-import-text';

export type ImportModuleParseSuccess = { readonly ok: true; readonly module: Module };

export type ImportModuleParseFailure = {
  readonly ok: false;
  readonly stage: ImportValidationStage;
  readonly issues: readonly ImportIssue[];
};

export type ImportModuleParseResult = ImportModuleParseSuccess | ImportModuleParseFailure;

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

/** Unwrap + Zod + assign IDs. Module semantic runs later in append (after target check). */
export function parseImportModuleText(text: string): ImportModuleParseResult {
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

  const zodResult = ImportModuleDocumentSchema.safeParse(jsonValue);
  if (!zodResult.success) {
    return { ok: false, stage: 'zod', issues: zodIssues(zodResult.error) };
  }

  return { ok: true, module: importDtoToModule(zodResult.data) };
}
