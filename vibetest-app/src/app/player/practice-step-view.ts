import type { Step } from '../courses/course.model';

import type { PracticeRunResult } from './step-engine/practice-run-result';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

export type PracticeStep = Extract<Step, { type: 'javascript' | 'sqlite' | 'regex' }>;

export type PracticeFeedbackTests = {
  readonly passed: number;
  readonly total: number;
};

export type PracticeFeedbackTiming = {
  readonly userMs: number;
  readonly referenceMs: number;
};

export type PracticeFeedback = {
  readonly kind: 'success' | 'error';
  readonly message: string;
  readonly tests: PracticeFeedbackTests;
  readonly timing?: PracticeFeedbackTiming;
};

export interface PracticeStepShellLabels {
  readonly editorLabel: string;
  readonly hint: string;
}

export function isPracticeStep(step: Step): step is PracticeStep {
  return step.type === 'javascript' || step.type === 'sqlite' || step.type === 'regex';
}

export function practiceStepShellLabels(step: PracticeStep): PracticeStepShellLabels {
  switch (step.type) {
    case 'javascript':
      return {
        editorLabel: 'Код функции',
        hint: 'Напишите тело функции и нажмите «Запустить».',
      };
    case 'sqlite':
      return {
        editorLabel: 'SQL-запрос',
        hint: 'Введите запрос и нажмите «Запустить».',
      };
    case 'regex':
      return {
        editorLabel: 'Регулярное выражение',
        hint: 'Введите pattern и нажмите «Запустить».',
      };
  }
}

export function practiceDraftFromSnapshot(
  step: PracticeStep,
  snapshot: StepProgressSnapshot | undefined,
): string {
  if (!snapshot || snapshot.type !== step.type) {
    return defaultPracticeDraft(step);
  }
  if (snapshot.type === 'regex') {
    return snapshot.draft?.pattern ?? step.content.starterCode;
  }
  if (snapshot.type === 'javascript' || snapshot.type === 'sqlite') {
    return snapshot.draft?.draftCode ?? step.content.starterCode;
  }
  return defaultPracticeDraft(step);
}

export function defaultPracticeDraft(step: PracticeStep): string {
  if (step.type === 'regex') {
    return step.content.starterCode;
  }
  return step.content.starterCode;
}

export function practiceSuccessMessage(): string {
  return 'Все проверки пройдены.';
}

export function practiceFailureMessage(result: Extract<PracticeRunResult, { ok: false }>): string {
  const index = result.failedTestIndex + 1;
  return `Проверка ${index} не пройдена: ${result.message}`;
}

export function formatPracticeDurationMs(ms: number): string {
  if (ms < 0.1) {
    return '< 0.1 мс';
  }
  const rounded = Math.round(ms * 10) / 10;
  return `${rounded} мс`;
}

/** Below this, worker timer noise dominates (see SPEC «Статистика прогона»). */
export const PRACTICE_TIMING_COMPARE_THRESHOLD_MS = 1;

export function practiceTimingComparison(userMs: number, referenceMs: number): string {
  const minMs = Math.min(userMs, referenceMs);
  const maxMs = Math.max(userMs, referenceMs);
  const diffMs = Math.abs(userMs - referenceMs);
  if (maxMs < PRACTICE_TIMING_COMPARE_THRESHOLD_MS || diffMs < PRACTICE_TIMING_COMPARE_THRESHOLD_MS) {
    return 'Время сопоставимо с эталоном.';
  }
  if (minMs < PRACTICE_TIMING_COMPARE_THRESHOLD_MS) {
    if (userMs < referenceMs) {
      return 'Быстрее эталона.';
    }
    if (userMs > referenceMs) {
      return 'Медленнее эталона.';
    }
    return 'Время сопоставимо с эталоном.';
  }
  const ratio = userMs / referenceMs;
  if (ratio >= 0.95 && ratio <= 1.05) {
    return 'Время сопоставимо с эталоном.';
  }
  if (userMs < referenceMs) {
    const speedup = referenceMs / userMs;
    const factor = Math.round(speedup * 10) / 10;
    return `Быстрее эталона (≈ в ${factor} раза).`;
  }
  const slowdown = userMs / referenceMs;
  const factor = Math.round(slowdown * 10) / 10;
  return `В ${factor} раза медленнее эталона.`;
}

export function practiceFeedbackFromResult(result: PracticeRunResult): PracticeFeedback {
  if (result.ok) {
    return {
      kind: 'success',
      message: practiceSuccessMessage(),
      tests: { passed: result.totalTests, total: result.totalTests },
      timing: { userMs: result.userMs, referenceMs: result.referenceMs },
    };
  }
  return {
    kind: 'error',
    message: practiceFailureMessage(result),
    tests: { passed: result.failedTestIndex, total: result.totalTests },
  };
}
