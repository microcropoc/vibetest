import { Component, computed, input, output } from '@angular/core';

import { formatImportIssue } from '../../../courses/import-issue-view';
import type { ImportIssue } from '../../../courses/import-types';
import type { CopyTextToClipboardResult } from '../../../shared/clipboard/copy-text-to-clipboard';

/** Current manual stage: copy the prompt, paste the LLM answer, check and save it. */
@Component({
  imports: [],
  selector: 'app-manual-stage-panel',
  styleUrl: './manual-stage-panel.scss',
  templateUrl: './manual-stage-panel.html',
})
export class ManualStagePanel {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly answer = input.required<string>();
  /** Problems of the last checked answer; the next prompt asks the model to fix them. */
  readonly issues = input<readonly ImportIssue[]>([]);
  readonly error = input<string | null>(null);
  readonly busy = input(false);
  readonly copyResult = input<CopyTextToClipboardResult | null>(null);

  readonly copyPrompt = output<void>();
  readonly answerChange = output<string>();
  readonly accept = output<void>();

  protected readonly formatIssue = formatImportIssue;
  protected readonly hasAnswer = computed(() => this.answer().trim().length > 0);
  protected readonly retry = computed(() => this.issues().length > 0);

  protected onAnswerInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      this.answerChange.emit(target.value);
    }
  }
}
