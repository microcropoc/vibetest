import type { SemanticIssue } from './semantic-validation';

export type ImportIssue = SemanticIssue;

export type ImportValidationStage = 'json' | 'zod' | 'semantic';

export type ImportCourseOptions = {
  readonly regenerateIds: boolean;
  /** Required when `regenerateIds` is false and `courseId` already exists. */
  readonly confirmReplace?: boolean;
};

export type ImportCourseSuccess = {
  readonly ok: true;
  readonly courseId: string;
  readonly action: 'created' | 'replaced';
};

export type ImportCourseValidationFailure = {
  readonly ok: false;
  readonly stage: ImportValidationStage;
  readonly issues: readonly ImportIssue[];
};

export type ImportCourseReplaceRequired = {
  readonly ok: false;
  readonly stage: 'replace-required';
  readonly courseId: string;
};

export type ImportCourseResult =
  | ImportCourseSuccess
  | ImportCourseValidationFailure
  | ImportCourseReplaceRequired;
