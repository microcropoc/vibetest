import type { Step } from '../../courses/course.model';

import type { StepStatus } from './step-status';

/** Draft payloads per step type (IndexedDB / read-model; extended in vt-4+). */
export type StepDraftByType = {
  readonly theory: Readonly<Record<string, never>>;
  readonly svg: Readonly<Record<string, never>>;
  readonly quiz: { readonly selectedIndices: readonly number[] };
  readonly javascript: { readonly draftCode: string };
  readonly sqlite: { readonly draftCode: string };
  readonly regex: { readonly pattern: string };
};

export type StepType = Step['type'];

interface StepProgressSnapshotBase {
  readonly stepId: string;
  readonly status: StepStatus;
  readonly lastCheckFailed: boolean;
}

export type StepProgressSnapshot = {
  [K in StepType]: StepProgressSnapshotBase & {
    readonly type: K;
    readonly draft?: StepDraftByType[K];
  };
}[StepType];

export function emptyDraftForType<T extends StepType>(type: T): StepDraftByType[T] {
  switch (type) {
    case 'theory':
    case 'svg':
      return {} as unknown as StepDraftByType[T];
    case 'quiz':
      return { selectedIndices: [] } as unknown as StepDraftByType[T];
    case 'javascript':
    case 'sqlite':
      return { draftCode: '' } as unknown as StepDraftByType[T];
    case 'regex':
      return { pattern: '' } as unknown as StepDraftByType[T];
  }
}

export function defaultStepProgressSnapshot(step: Step): StepProgressSnapshot {
  const type = step.type;
  return {
    stepId: step.stepId,
    type,
    status: 'not-started',
    lastCheckFailed: false,
    draft: emptyDraftForType(type),
  } as StepProgressSnapshot;
}
