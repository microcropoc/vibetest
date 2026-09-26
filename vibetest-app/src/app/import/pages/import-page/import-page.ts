import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import {
  formatImportIssue,
  importStageLabel,
} from '../../../courses/import-issue-view';
import type { ImportIssue, ImportValidationStage } from '../../../courses/import-types';
import { sortCoursesByCreatedAtDesc } from '../../../courses/sort-courses-by-created-at';
import { CourseRepository } from '../../../storage/course-repository';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';

type CourseSelectOption = {
  readonly courseId: string;
  readonly title: string;
};

@Component({
  selector: 'app-import-page',
  imports: [ConfirmDialogComponent],
  templateUrl: './import-page.html',
  styleUrl: './import-page.scss',
})
export class ImportPage {
  private readonly importService = inject(CourseImportService);
  private readonly courseRepository = inject(CourseRepository);
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

  protected readonly courseOptions = signal<readonly CourseSelectOption[]>([]);
  protected readonly selectedCourseId = signal('');
  protected readonly moduleJsonText = signal('');
  protected readonly moduleValidatePracticeSteps = signal(false);
  protected readonly moduleIssues = signal<readonly ImportIssue[]>([]);
  protected readonly moduleIssueStage = signal<
    ImportValidationStage | 'target' | null
  >(null);
  protected readonly moduleClipboardMessage = signal<string | null>(null);
  protected readonly moduleSuccessMessage = signal<string | null>(null);
  protected readonly moduleImporting = signal(false);

  private pendingImportText = '';

  protected readonly formatIssue = formatImportIssue;

  protected readonly stageHeading = computed((): string => {
    const stage = this.issueStage();
    if (!stage) {
      return '';
    }
    return importStageLabel(stage);
  });

  protected readonly moduleStageHeading = computed((): string => {
    const stage = this.moduleIssueStage();
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

  constructor() {
    void this.loadCourseOptions();
  }

  protected onJsonInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.jsonText.set(target.value);
  }

  protected onModuleJsonInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.moduleJsonText.set(target.value);
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

  protected onModuleValidatePracticeStepsChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.moduleValidatePracticeSteps.set(target.checked);
  }

  protected onCourseSelectChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    this.selectedCourseId.set(target.value);
  }

  protected async onPasteCourseFromClipboard(): Promise<void> {
    await this.pasteFromClipboard((text) => {
      this.jsonText.set(text);
      this.clipboardMessage.set(null);
    }, (message) => this.clipboardMessage.set(message));
  }

  protected async onPasteModuleFromClipboard(): Promise<void> {
    await this.pasteFromClipboard((text) => {
      this.moduleJsonText.set(text);
      this.moduleClipboardMessage.set(null);
    }, (message) => this.moduleClipboardMessage.set(message));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.runImport(false);
  }

  protected onModuleSubmit(event: Event): void {
    event.preventDefault();
    void this.runModuleImport();
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

  private async loadCourseOptions(): Promise<void> {
    const courses = sortCoursesByCreatedAtDesc(await this.courseRepository.list());
    const options = courses.map((course) => ({
      courseId: course.courseId,
      title: course.title,
    }));
    this.courseOptions.set(options);
    if (options.length > 0) {
      this.selectedCourseId.set(options[0]!.courseId);
    }
  }

  private async pasteFromClipboard(
    onText: (text: string) => void,
    onError: (message: string) => void,
  ): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      onError('Буфер обмена недоступен в этом браузере.');
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      onText(text);
    } catch {
      onError('Нет доступа к буферу обмена. Вставьте JSON вручную.');
    }
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
        await this.loadCourseOptions();
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

  private async runModuleImport(): Promise<void> {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      return;
    }

    this.moduleImporting.set(true);
    this.moduleIssues.set([]);
    this.moduleIssueStage.set(null);
    this.moduleSuccessMessage.set(null);
    this.moduleClipboardMessage.set(null);

    try {
      const result = await this.importService.importModule(this.moduleJsonText(), {
        courseId,
        validatePracticeSteps: this.moduleValidatePracticeSteps(),
      });

      if (result.ok) {
        const title =
          this.courseOptions().find((option) => option.courseId === courseId)?.title ??
          courseId;
        this.moduleSuccessMessage.set(
          `Модуль добавлен в курс «${title}». Переход к модулям…`,
        );
        await this.router.navigate(['/courses', result.courseId]);
        return;
      }

      if (result.stage === 'target') {
        this.moduleIssueStage.set('target');
        this.moduleIssues.set([
          {
            path: 'courseId',
            message: `Курс «${result.courseId}» не найден. Обновите страницу или выберите другой курс.`,
          },
        ]);
        await this.loadCourseOptions();
        return;
      }

      this.moduleIssueStage.set(result.stage);
      this.moduleIssues.set(result.issues);
    } finally {
      this.moduleImporting.set(false);
    }
  }
}
