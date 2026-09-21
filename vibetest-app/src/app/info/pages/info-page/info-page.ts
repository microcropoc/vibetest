import { Component, signal } from '@angular/core';

import {
  loadBundledCourseImportSchema,
  prettyPrintJson,
} from '../../bundled-course-schema';
import { copyTextToClipboard, type CopyTextToClipboardResult } from '../../copy-text-to-clipboard';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.html',
  styleUrl: './info-page.scss',
})
export class InfoPage {
  protected readonly loading = signal(true);
  protected readonly schemaText = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly copyFeedback = signal<CopyTextToClipboardResult | null>(null);

  constructor() {
    void this.loadSchema();
  }

  protected async onCopySchema(): Promise<void> {
    const text = this.schemaText();
    if (!text) {
      return;
    }
    const result = await copyTextToClipboard(text);
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
