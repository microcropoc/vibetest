import { Component, signal } from '@angular/core';

import { loadBundledCourseSchema, prettyPrintJson } from '../../bundled-course-schema';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.html',
  styleUrl: './info-page.scss',
})
export class InfoPage {
  protected readonly loading = signal(true);
  protected readonly schemaText = signal('');
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    void this.loadSchema();
  }

  private async loadSchema(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.schemaText.set('');

    try {
      const schema = await loadBundledCourseSchema();
      this.schemaText.set(prettyPrintJson(schema));
    } catch {
      this.errorMessage.set('Не удалось загрузить course.schema.json.');
    } finally {
      this.loading.set(false);
    }
  }
}
