import { Component, signal } from '@angular/core';

import {
  loadBundledCourseImportSchema,
  prettyPrintJson,
} from '../../../info/bundled-course-schema';
import { buildCourseGenerationPrompt } from '../../build-course-generation-prompt';
import {
  copyTextToClipboard,
  type CopyTextToClipboardResult,
} from '../../../shared/clipboard/copy-text-to-clipboard';

@Component({
  selector: 'app-prompt-generation-page',
  templateUrl: './prompt-generation-page.html',
  styleUrl: './prompt-generation-page.scss',
})
export class PromptGenerationPage {
  protected readonly loading = signal(true);
  protected readonly schemaText = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly courseDescription = signal('');
  protected readonly copyFeedback = signal<CopyTextToClipboardResult | null>(null);

  constructor() {
    void this.loadSchema();
  }

  protected onDescriptionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.courseDescription.set(target.value);
    this.copyFeedback.set(null);
  }

  protected async onCopyPrompt(): Promise<void> {
    const schema = this.schemaText();
    if (!schema) {
      return;
    }
    const prompt = buildCourseGenerationPrompt(this.courseDescription(), schema);
    const result = await copyTextToClipboard(prompt);
    this.copyFeedback.set(result);
  }

  private async loadSchema(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.schemaText.set('');
    this.copyFeedback.set(null);

    try {
      const schema = await loadBundledCourseImportSchema();
      this.schemaText.set(prettyPrintJson(schema));
    } catch {
      this.errorMessage.set('Не удалось загрузить course-import.schema.json.');
    } finally {
      this.loading.set(false);
    }
  }
}
