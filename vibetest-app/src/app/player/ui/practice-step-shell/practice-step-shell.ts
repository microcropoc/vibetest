import { Component, computed, input, output } from '@angular/core';

import {
  practiceStepShellLabels,
  type PracticeFeedback,
  type PracticeStep,
} from '../../practice-step-view';

@Component({
  selector: 'app-practice-step-shell',
  templateUrl: './practice-step-shell.html',
  styleUrl: './practice-step-shell.scss',
})
export class PracticeStepShellComponent {
  readonly step = input.required<PracticeStep>();
  readonly draft = input('');
  readonly running = input(false);
  readonly feedback = input<PracticeFeedback | null>(null);
  readonly showFailure = input(false);

  readonly draftChange = output<string>();
  readonly run = output<void>();

  protected readonly labels = computed(() => practiceStepShellLabels(this.step()));

  protected readonly timeoutMs = computed(() => this.step().content.timeoutMs);

  protected onDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.draftChange.emit(value);
  }

  protected onRun(): void {
    if (this.running()) {
      return;
    }
    this.run.emit();
  }
}
