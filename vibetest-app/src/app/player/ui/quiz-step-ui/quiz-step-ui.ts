import { Component, computed, input, output } from '@angular/core';

import type { Step } from '../../../courses/course.model';
import { isValidSelection } from '../../step-engine/quiz/quiz-answer';

type QuizStep = Extract<Step, { type: 'quiz' }>;

@Component({
  selector: 'app-quiz-step-ui',
  templateUrl: './quiz-step-ui.html',
  styleUrl: './quiz-step-ui.scss',
})
export class QuizStepUiComponent {
  readonly step = input.required<QuizStep>();
  readonly selectedIndices = input<readonly number[]>([]);
  readonly showFailure = input(false);

  readonly selectionChange = output<readonly number[]>();
  readonly submitAnswer = output<void>();

  protected readonly multipleChoice = computed(
    () => this.step().content.correctIndices.length > 1,
  );

  protected readonly canSubmit = computed(() =>
    isValidSelection(this.selectedIndices(), this.step().content.options.length),
  );

  protected isSelected(index: number): boolean {
    return this.selectedIndices().includes(index);
  }

  protected onRadioChange(index: number): void {
    this.selectionChange.emit([index]);
  }

  protected onCheckboxChange(index: number, checked: boolean): void {
    const current = this.selectedIndices();
    if (checked) {
      this.selectionChange.emit([...current, index]);
      return;
    }
    this.selectionChange.emit(current.filter((value) => value !== index));
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitAnswer.emit();
  }
}
