import type { CourseOutline } from './course-outline.model';
import type { GenerationStep, StagedGenerationState } from './staged-course-generator.service';

export type GenerationStageStatus = 'pending' | 'running' | 'done' | 'failed';

export type GenerationStageView = {
  readonly id: string;
  readonly label: string;
  readonly status: GenerationStageStatus;
  /** E.g. «попытка 2 из 3»; only for the running stage after the first attempt. */
  readonly attemptLabel: string | null;
};

export type GenerationAttempt = {
  readonly attempt: number;
  readonly maxAttempts: number;
};

function sameStep(a: GenerationStep | null, b: GenerationStep): boolean {
  if (a === null || a.kind !== b.kind) {
    return false;
  }
  return a.kind === 'outline' || (b.kind === 'module' && a.index === b.index);
}

export function generationStepLabel(step: GenerationStep, outline: CourseOutline | null): string {
  if (step.kind === 'outline') {
    return 'План курса';
  }
  const title = outline?.modules[step.index]?.title;
  const suffix = title === undefined ? '' : `: «${title}»`;
  if (step.index === 0) {
    return `Курс и модуль 1${suffix}`;
  }
  return `Модуль ${step.index + 1} из ${outline?.modules.length ?? '?'}${suffix}`;
}

function isStepDone(step: GenerationStep, state: StagedGenerationState): boolean {
  if (step.kind === 'outline') {
    return state.outline !== null;
  }
  return state.courseId !== null && state.nextModuleIndex > step.index;
}

/** Outline, course with module 1, then one stage per remaining outline module. */
export function buildGenerationStageViews(
  state: StagedGenerationState,
  runningStep: GenerationStep | null,
  attempt: GenerationAttempt | null,
  failedStep: GenerationStep | null,
): readonly GenerationStageView[] {
  const moduleCount = state.outline?.modules.length ?? 1;
  const steps: GenerationStep[] = [
    { kind: 'outline' },
    ...Array.from({ length: moduleCount }, (_, index): GenerationStep => ({
      kind: 'module',
      index,
    })),
  ];

  return steps.map((step) => {
    const running = sameStep(runningStep, step);
    const status: GenerationStageStatus = isStepDone(step, state)
      ? 'done'
      : running
        ? 'running'
        : sameStep(failedStep, step)
          ? 'failed'
          : 'pending';
    return {
      id: step.kind === 'outline' ? 'outline' : `module-${step.index}`,
      label: generationStepLabel(step, state.outline),
      status,
      attemptLabel:
        status === 'running' && attempt !== null && attempt.attempt > 1
          ? `попытка ${attempt.attempt} из ${attempt.maxAttempts}`
          : null,
    };
  });
}
