import { Component, computed, input, output } from '@angular/core';

import { CodeEditor } from '../code-editor/code-editor';
import { MarkdownContentComponent } from '../markdown-content/markdown-content';
import { SqlResultDiffComponent } from '../sql-result-diff/sql-result-diff';
import type { PracticeCodeEditorLanguage } from '../code-editor/practice-code-editor-language';
import {
  formatPracticeDurationMs,
  practiceStepShellLabels,
  practiceTimingComparison,
  type PracticeFeedback,
  type PracticeStep,
} from '../../practice-step-view';

@Component({
  selector: 'app-practice-step-shell',
  imports: [CodeEditor, MarkdownContentComponent, SqlResultDiffComponent],
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

  protected readonly editorLabelId = computed(() => `practice-editor-label-${this.step().stepId}`);

  protected readonly editorLanguage = computed((): PracticeCodeEditorLanguage => {
    switch (this.step().type) {
      case 'javascript':
        return 'javascript';
      case 'sqlite':
        return 'sql';
      case 'regex':
        return 'plain';
    }
  });

  protected readonly timingLabels = computed(() => {
    const timing = this.feedback()?.timing;
    if (timing === undefined) {
      return null;
    }
    return {
      user: formatPracticeDurationMs(timing.userMs),
      reference: formatPracticeDurationMs(timing.referenceMs),
      comparison: practiceTimingComparison(timing.userMs, timing.referenceMs),
    };
  });

  protected onDraftChange(value: string): void {
    this.draftChange.emit(value);
  }

  protected onRun(): void {
    if (this.running()) {
      return;
    }
    this.run.emit();
  }
}
