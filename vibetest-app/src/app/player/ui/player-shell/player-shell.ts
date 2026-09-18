import { Component, computed, inject, input } from '@angular/core';

import type { Step } from '../../../courses/course.model';
import { PlayerOrchestratorService } from '../../player-orchestrator.service';
import type { StepProgressSnapshot } from '../../step-engine/step-progress-snapshot';
import { QuizStepUiComponent } from '../quiz-step-ui/quiz-step-ui';
import { SvgStepUiComponent } from '../svg-step-ui/svg-step-ui';
import { TheoryStepUiComponent } from '../theory-step-ui/theory-step-ui';

@Component({
  selector: 'app-player-shell',
  imports: [TheoryStepUiComponent, SvgStepUiComponent, QuizStepUiComponent],
  templateUrl: './player-shell.html',
  styleUrl: './player-shell.scss',
})
export class PlayerShellComponent {
  readonly courseTitle = input('');
  readonly moduleTitle = input('');
  readonly step = input<Step | undefined>(undefined);
  readonly snapshot = input<StepProgressSnapshot | undefined>(undefined);

  private readonly orchestrator = inject(PlayerOrchestratorService);

  protected readonly quizSelectedIndices = computed((): readonly number[] => {
    const snapshot = this.snapshot();
    if (snapshot?.type === 'quiz') {
      return snapshot.draft?.selectedIndices ?? [];
    }
    return [];
  });

  protected readonly quizShowFailure = computed(() => this.snapshot()?.lastCheckFailed ?? false);

  protected onQuizSelection(selectedIndices: readonly number[]): void {
    void this.orchestrator.dispatch({ kind: 'setSelection', selectedIndices });
  }

  protected onQuizSubmit(): void {
    void this.orchestrator.dispatch({ kind: 'submitAnswer' });
  }
}
