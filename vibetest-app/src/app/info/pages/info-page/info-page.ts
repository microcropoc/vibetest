import { Component, signal } from '@angular/core';

import {
  loadBundledCourseImportSchema,
  loadBundledModuleImportSchema,
  prettyPrintJson,
} from '../../bundled-course-schema';
import {
  copyTextToClipboard,
  type CopyTextToClipboardResult,
} from '../../../shared/clipboard/copy-text-to-clipboard';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.html',
  styleUrl: './info-page.scss',
})
export class InfoPage {
  protected readonly loading = signal(true);
  protected readonly courseSchemaText = signal('');
  protected readonly moduleSchemaText = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly courseCopyFeedback = signal<CopyTextToClipboardResult | null>(null);
  protected readonly moduleCopyFeedback = signal<CopyTextToClipboardResult | null>(null);

  constructor() {
    void this.loadSchemas();
  }

  protected async onCopyCourseSchema(): Promise<void> {
    await this.copySchema(this.courseSchemaText(), (result) =>
      this.courseCopyFeedback.set(result),
    );
  }

  protected async onCopyModuleSchema(): Promise<void> {
    await this.copySchema(this.moduleSchemaText(), (result) =>
      this.moduleCopyFeedback.set(result),
    );
  }

  private async copySchema(
    text: string,
    setFeedback: (result: CopyTextToClipboardResult) => void,
  ): Promise<void> {
    if (!text) {
      return;
    }
    const result = await copyTextToClipboard(text);
    setFeedback(result);
  }

  private async loadSchemas(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.courseSchemaText.set('');
    this.moduleSchemaText.set('');
    this.courseCopyFeedback.set(null);
    this.moduleCopyFeedback.set(null);

    try {
      const [courseSchema, moduleSchema] = await Promise.all([
        loadBundledCourseImportSchema(),
        loadBundledModuleImportSchema(),
      ]);
      this.courseSchemaText.set(prettyPrintJson(courseSchema));
      this.moduleSchemaText.set(prettyPrintJson(moduleSchema));
    } catch {
      this.errorMessage.set('Не удалось загрузить схемы импорта.');
    } finally {
      this.loading.set(false);
    }
  }
}
