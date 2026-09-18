import { Component, computed, inject, input } from '@angular/core';

import type { Step } from '../../../courses/course.model';
import {
  isPracticeStep,
  practiceDraftFromSnapshot,
} from '../../practice-step-view';
import { PlayerOrchestratorService } from '../../player-orchestrator.service';
import type { StepProgressSnapshot } from '../../step-engine/step-progress-snapshot';
import { PracticeStepShellComponent } from '../practice-step-shell/practice-step-shell';
import { QuizStepUiComponent } from '../quiz-step-ui/quiz-step-ui';
import { SvgStepUiComponent } from '../svg-step-ui/svg-step-ui';
import { TheoryStepUiComponent } from '../theory-step-ui/theory-step-ui';

@Component({
  selector: 'app-player-shell',
  imports: [
    TheoryStepUiComponent,
    SvgStepUiComponent,
    QuizStepUiComponent,
    PracticeStepShellComponent,
  ],
  templateUrl: './player-shell.html',
  styleUrl: './player-shell.scss',
})
export class PlayerShellComponent {
  readonly courseTitle = input('');
  readonly moduleTitle = input('');
  readonly step = input<Step | undefined>(undefined);
  readonly snapshot = input<StepProgressSnapshot | undefined>(undefined);

  protected readonly orchestrator = inject(PlayerOrchestratorService);

  protected readonly isPracticeStep = isPracticeStep;

  protected readonly quizSelectedIndices = computed((): readonly number[] => {
    const snapshot = this.snapshot();
    if (snapshot?.type === 'quiz') {
      return snapshot.draft?.selectedIndices ?? [];
    }
    return [];
  });

  protected readonly quizShowFailure = computed(() => this.snapshot()?.lastCheckFailed ?? false);

  protected readonly practiceDraft = computed((): string => {
    const step = this.step();
    if (!step || !isPracticeStep(step)) {
      return '';
    }
    return practiceDraftFromSnapshot(step, this.snapshot());
  });

  protected readonly practiceShowFailure = computed(() => this.snapshot()?.lastCheckFailed ?? false);

  protected onQuizSelection(selectedIndices: readonly number[]): void {
    void this.orchestrator.dispatch({ kind: 'setSelection', selectedIndices });
  }

  protected onQuizSubmit(): void {
    void this.orchestrator.dispatch({ kind: 'submitAnswer' });
  }

  protected onPracticeDraft(value: string): void {
    void this.orchestrator.setPracticeDraft(value);
  }

  protected onPracticeRun(): void {
    void this.orchestrator.runPractice();
  }
}
