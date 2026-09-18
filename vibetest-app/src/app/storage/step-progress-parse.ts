import { z } from 'zod';

import type { StepProgressSnapshot, StepType } from '../player/step-engine/step-progress-snapshot';
import { emptyDraftForType } from '../player/step-engine/step-progress-snapshot';

import { buildStepProgressKey } from './step-progress-key';
import type { StepProgressRow } from './storage-row-types';

const stepTypeSchema = z.enum(['theory', 'svg', 'quiz', 'javascript', 'sqlite', 'regex']);
const stepStatusSchema = z.enum(['not-started', 'in-progress', 'completed']);

const uuidSchema = z.string().uuid();

export const stepProgressRowSchema = z
  .object({
    progressKey: z.string().min(1),
    courseId: uuidSchema,
    moduleId: uuidSchema,
    stepId: uuidSchema,
    type: stepTypeSchema,
    status: stepStatusSchema,
    lastCheckFailed: z.boolean(),
    draft: z.unknown().optional(),
  })
  .strict();

const quizDraftSchema = z.object({ selectedIndices: z.array(z.number().int().nonnegative()) }).strict();
const codeDraftSchema = z.object({ draftCode: z.string() }).strict();
const regexDraftSchema = z.object({ pattern: z.string() }).strict();
const viewableDraftSchema = z.object({}).strict();

export interface StepProgressRef {
  readonly courseId: string;
  readonly moduleId: string;
  readonly stepId: string;
}

export function parseStepProgressRow(value: unknown): StepProgressRow {
  return stepProgressRowSchema.parse(value);
}

function parseDraftForType(type: StepType, draft: unknown): StepProgressSnapshot['draft'] {
  if (draft === undefined) {
    return emptyDraftForType(type);
  }
  switch (type) {
    case 'theory':
    case 'svg':
      viewableDraftSchema.parse(draft);
      return emptyDraftForType(type);
    case 'quiz':
      return quizDraftSchema.parse(draft);
    case 'javascript':
    case 'sqlite':
      return codeDraftSchema.parse(draft);
    case 'regex':
      return regexDraftSchema.parse(draft);
  }
}

export function stepProgressSnapshotFromRow(row: StepProgressRow): StepProgressSnapshot {
  const parsed = parseStepProgressRow(row);
  const draft = parseDraftForType(parsed.type, parsed.draft);
  return {
    stepId: parsed.stepId,
    type: parsed.type,
    status: parsed.status,
    lastCheckFailed: parsed.lastCheckFailed,
    draft,
  } as StepProgressSnapshot;
}

export function stepProgressRowFromSnapshot(
  ref: StepProgressRef,
  snapshot: StepProgressSnapshot,
): StepProgressRow {
  if (snapshot.stepId !== ref.stepId) {
    throw new Error('StepProgressRef.stepId must match snapshot.stepId');
  }
  return {
    progressKey: buildStepProgressKey(ref.courseId, ref.moduleId, ref.stepId),
    courseId: ref.courseId,
    moduleId: ref.moduleId,
    stepId: ref.stepId,
    type: snapshot.type,
    status: snapshot.status,
    lastCheckFailed: snapshot.lastCheckFailed,
    draft: snapshot.draft,
  };
}
