import { z } from 'zod';

/** Manual staged generation on the prompt page; the outline is re-parsed from `outlineResponse`. */
export type ManualStagedProgress = {
  readonly description: string;
  readonly outlineResponse: string;
  /** Course saved from the "course with module 1" answer; null before that. */
  readonly courseId: string | null;
  /** Next outline module to add (0-based); 1 right after the course is saved. */
  readonly nextModuleIndex: number;
};

export const EMPTY_MANUAL_STAGED_PROGRESS: ManualStagedProgress = {
  description: '',
  outlineResponse: '',
  courseId: null,
  nextModuleIndex: 0,
};

const ManualStagedProgressSchema = z.object({
  description: z.string(),
  outlineResponse: z.string(),
  courseId: z.uuid().nullable(),
  nextModuleIndex: z.number().int().nonnegative(),
});

export function parseManualStagedProgress(value: unknown): ManualStagedProgress {
  return ManualStagedProgressSchema.parse(value);
}

/** Undefined when the stored value does not match (e.g. a row from another version). */
export function tryParseManualStagedProgress(value: unknown): ManualStagedProgress | undefined {
  const result = ManualStagedProgressSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function isManualStagedProgressEmpty(progress: ManualStagedProgress): boolean {
  return (
    progress.description.length === 0 &&
    progress.outlineResponse.length === 0 &&
    progress.courseId === null
  );
}

/** Staged wizard progress is stored only after a plan or a saved course exists. */
export function shouldPersistManualStagedProgress(progress: ManualStagedProgress): boolean {
  return progress.outlineResponse.trim().length > 0 || progress.courseId !== null;
}
