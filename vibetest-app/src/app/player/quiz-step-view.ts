import { quizAnswersMatch } from './step-engine/quiz/quiz-answer';
import type { QuizStep } from './step-engine/quiz/quiz-step-engine';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

/**
 * Success message only while the checked correct answer is still selected:
 * `completed` survives retry (draft cleared) and later selection changes.
 */
export function quizShowsSuccess(
  step: QuizStep,
  snapshot: StepProgressSnapshot | undefined,
): boolean {
  if (snapshot?.type !== 'quiz' || snapshot.status !== 'completed' || snapshot.lastCheckFailed) {
    return false;
  }
  const selected = snapshot.draft?.selectedIndices ?? [];
  return selected.length > 0 && quizAnswersMatch(selected, step.content.correctIndices);
}
