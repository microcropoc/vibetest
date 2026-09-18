import type { Step } from '../courses/course.model';

import type { JavascriptPracticeResult } from './step-engine/javascript';
import type { RegexPracticeResult } from './step-engine/regex';
import type { SqlitePracticeResult } from './step-engine/sqlite';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

export type PracticeStep = Extract<Step, { type: 'javascript' | 'sqlite' | 'regex' }>;

export type PracticeFeedback = {
  readonly kind: 'success' | 'error';
  readonly message: string;
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

export type PracticeRunResult =
  | JavascriptPracticeResult
  | SqlitePracticeResult
  | RegexPracticeResult;

export function practiceSuccessMessage(): string {
  return 'Все проверки пройдены.';
}

export function practiceFailureMessage(result: Extract<PracticeRunResult, { ok: false }>): string {
  const index = result.failedTestIndex + 1;
  return `Проверка ${index} не пройдена: ${result.message}`;
}
