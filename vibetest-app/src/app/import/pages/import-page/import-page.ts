import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import {
  formatImportIssue,
  importStageLabel,
} from '../../../courses/import-issue-view';
import type { ImportIssue, ImportValidationStage } from '../../../courses/import-types';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-import-page',
  imports: [ConfirmDialogComponent],
  templateUrl: './import-page.html',
  styleUrl: './import-page.scss',
})
export class ImportPage {
  private readonly importService = inject(CourseImportService);
  private readonly router = inject(Router);

  protected readonly jsonText = signal('');
  protected readonly regenerateIds = signal(true);
  protected readonly validatePracticeSteps = signal(false);
  protected readonly issues = signal<readonly ImportIssue[]>([]);
  protected readonly issueStage = signal<ImportValidationStage | 'replace-required' | null>(
    null,
  );
  protected readonly clipboardMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly importing = signal(false);
  protected readonly replaceDialogOpen = signal(false);
  protected readonly replaceCourseId = signal<string | null>(null);

  private pendingImportText = '';

  protected readonly formatIssue = formatImportIssue;

  protected readonly stageHeading = computed((): string => {
    const stage = this.issueStage();
    if (!stage) {
      return '';
    }
    return importStageLabel(stage);
  });

  protected readonly replaceDialogMessage = computed((): string => {
    const courseId = this.replaceCourseId();
    if (!courseId) {
      return '';
    }
    return `Курс «${courseId}» уже есть. Заменить документ и удалить весь прогресс?`;
  });

  protected onJsonInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.jsonText.set(target.value);
  }

  protected onRegenerateIdsChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.regenerateIds.set(target.checked);
  }

  protected onValidatePracticeStepsChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.validatePracticeSteps.set(target.checked);
  }

  protected async onPasteFromClipboard(): Promise<void> {
    this.clipboardMessage.set(null);
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      this.clipboardMessage.set('Буфер обмена недоступен в этом браузере.');
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      this.jsonText.set(text);
    } catch {
      this.clipboardMessage.set('Нет доступа к буферу обмена. Вставьте JSON вручную.');
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.runImport(false);
  }

  protected onReplaceCancelled(): void {
    this.replaceDialogOpen.set(false);
    this.replaceCourseId.set(null);
    this.pendingImportText = '';
  }

  protected onReplaceConfirmed(): void {
    this.replaceDialogOpen.set(false);
    this.replaceCourseId.set(null);
    void this.runImport(true);
  }

  private async runImport(confirmReplace: boolean): Promise<void> {
    const text = confirmReplace ? this.pendingImportText : this.jsonText();
    if (!confirmReplace) {
      this.pendingImportText = text;
    }

    this.importing.set(true);
    this.issues.set([]);
    this.issueStage.set(null);
    this.successMessage.set(null);
    this.clipboardMessage.set(null);

    try {
      const result = await this.importService.importCourse(text, {
        regenerateIds: confirmReplace ? false : this.regenerateIds(),
        validatePracticeSteps: this.validatePracticeSteps(),
        confirmReplace: confirmReplace ? true : undefined,
      });

      if (result.ok) {
        const action =
          result.action === 'replaced' ? 'Курс заменён.' : 'Курс импортирован.';
        this.successMessage.set(`${action} Переход к модулям…`);
        await this.router.navigate(['/courses', result.courseId]);
        return;
      }

      if (result.stage === 'replace-required') {
        this.pendingImportText = text;
        this.replaceCourseId.set(result.courseId);
        this.replaceDialogOpen.set(true);
        this.issues.set([
          {
            path: 'courseId',
            message: `Курс с ID «${result.courseId}» уже существует. Подтвердите замену или включите «Заменить все ID».`,
          },
        ]);
        this.issueStage.set('replace-required');
        return;
      }

      this.issueStage.set(result.stage);
      this.issues.set(result.issues);
    } finally {
      this.importing.set(false);
    }
  }
}
