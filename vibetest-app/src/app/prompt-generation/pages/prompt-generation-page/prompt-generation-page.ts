import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { CourseOutline } from '../../../course-generation/course-outline.model';
import {
  buildGenerationStageViews,
  generationStepLabel,
  type GenerationStageStatus,
  type GenerationStageView,
} from '../../../course-generation/generation-stage-view';
import { findOutlineStepTypeGaps } from '../../../course-generation/parse-course-outline';
import type { AttemptOutcome } from '../../../course-generation/run-with-retry';
import type { GenerationStep } from '../../../course-generation/staged-course-generator.service';
import {
  StagedStepAcceptor,
  extractModelJson,
} from '../../../course-generation/staged-step-acceptor.service';
import { formatImportIssue } from '../../../courses/import-issue-view';
import type { ImportIssue } from '../../../courses/import-types';
import {
  loadBundledCourseImportSchema,
  loadBundledCourseOutlineSchema,
  loadBundledModuleImportSchema,
  prettyPrintJson,
} from '../../../info/bundled-course-schema';
import {
  copyTextToClipboard,
  type CopyTextToClipboardResult,
} from '../../../shared/clipboard/copy-text-to-clipboard';
import { SettingsRepository } from '../../../storage/settings-repository';
import { buildCourseGenerationPrompt } from '../../build-course-generation-prompt';
import {
  buildFirstModuleCourseMessages,
  buildModuleMessages,
  buildOutlineMessages,
  formatOutlineForPrompt,
  joinStagedMessages,
} from '../../build-staged-generation-messages';
import {
  EMPTY_MANUAL_STAGED_PROGRESS,
  shouldPersistManualStagedProgress,
  type ManualStagedProgress,
} from '../../manual-staged-progress';
import { parseOutlineResponse } from '../../parse-outline-response';
import { ManualStagePanel } from '../../ui/manual-stage-panel/manual-stage-panel';

export type PromptGenerationMode = 'single' | 'staged';

type StagedSchemas = {
  readonly moduleImport: string;
  readonly courseOutline: string;
};

type CopyFeedback = {
  readonly key: string;
  readonly result: CopyTextToClipboardResult;
};

type ModuleStep = Extract<GenerationStep, { readonly kind: 'module' }>;

const STAGE_STATUS_LABELS: Readonly<Record<GenerationStageStatus, string>> = {
  pending: 'ожидание',
  running: 'ожидание',
  done: 'готово',
  failed: 'ошибка',
};

const SINGLE_COPY_KEY = 'single';
const OUTLINE_COPY_KEY = 'outline';
const STAGE_COPY_KEY = 'stage';

@Component({
  selector: 'app-prompt-generation-page',
  imports: [NgTemplateOutlet, RouterLink, ManualStagePanel],
  templateUrl: './prompt-generation-page.html',
  styleUrl: './prompt-generation-page.scss',
})
export class PromptGenerationPage {
  private readonly settings = inject(SettingsRepository);
  private readonly acceptor = inject(StagedStepAcceptor);

  protected readonly singleCopyKey = SINGLE_COPY_KEY;
  protected readonly outlineCopyKey = OUTLINE_COPY_KEY;
  protected readonly stageCopyKey = STAGE_COPY_KEY;
  protected readonly stageStatusLabels = STAGE_STATUS_LABELS;

  protected readonly loading = signal(true);
  protected readonly courseImportSchema = signal<string | null>(null);
  protected readonly stagedSchemas = signal<StagedSchemas | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly stagedErrorMessage = signal<string | null>(null);
  protected readonly mode = signal<PromptGenerationMode>('single');
  protected readonly courseDescription = signal('');
  protected readonly outlineResponse = signal('');
  protected readonly copyFeedback = signal<CopyFeedback | null>(null);

  protected readonly courseId = signal<string | null>(null);
  protected readonly nextModuleIndex = signal(0);
  protected readonly stageAnswer = signal('');
  /** Problems of the last rejected answer of the current stage; the next prompt includes them. */
  protected readonly stageIssues = signal<readonly ImportIssue[]>([]);
  protected readonly stageError = signal<string | null>(null);
  protected readonly accepting = signal(false);
  /** Stored progress is applied before the form is shown or anything is written back. */
  protected readonly progressRestored = signal(false);
  protected readonly progressError = signal<string | null>(null);
  /** Stage already imported, but its progress is not stored yet; the wizard advances only after the write. */
  protected readonly pendingProgress = signal<ManualStagedProgress | null>(null);

  protected readonly hasDescription = computed(() => this.courseDescription().trim().length > 0);
  protected readonly courseSaved = computed(() => this.courseId() !== null);
  /** Description and plan must match the saved course, including one saved but not yet recorded. */
  protected readonly inputsLocked = computed(
    () => this.courseSaved() || this.pendingProgress() !== null,
  );
  protected readonly outlineResult = computed(() => parseOutlineResponse(this.outlineResponse()));
  protected readonly outline = computed<CourseOutline | null>(() => {
    const result = this.outlineResult();
    return result.kind === 'valid' ? result.outline : null;
  });
  protected readonly outlineIssues = computed<readonly ImportIssue[]>(() => {
    const result = this.outlineResult();
    return result.kind === 'invalid' ? result.issues : [];
  });
  protected readonly outlineWarnings = computed<readonly ImportIssue[]>(() => {
    const outline = this.outline();
    return outline === null ? [] : findOutlineStepTypeGaps(outline);
  });
  protected readonly outlineText = computed(() => {
    const outline = this.outline();
    return outline === null ? '' : formatOutlineForPrompt(outline);
  });

  /** Stage waiting for an answer: the course with module 1, then each next module; null when done. */
  protected readonly currentStep = computed<ModuleStep | null>(() => {
    const outline = this.outline();
    if (outline === null) {
      return null;
    }
    const index = this.courseSaved() ? this.nextModuleIndex() : 0;
    return index < outline.modules.length ? { kind: 'module', index } : null;
  });
  protected readonly currentStepLabel = computed(() => {
    const step = this.currentStep();
    return step === null ? '' : generationStepLabel(step, this.outline());
  });
  protected readonly courseDone = computed(
    () => this.courseSaved() && this.outline() !== null && this.currentStep() === null,
  );
  protected readonly moduleStages = computed<readonly GenerationStageView[]>(() => {
    const outline = this.outline();
    if (outline === null) {
      return [];
    }
    const failed =
      this.stageIssues().length > 0 || this.stageError() !== null ? this.currentStep() : null;
    return buildGenerationStageViews(
      { outline, courseId: this.courseId(), nextModuleIndex: this.nextModuleIndex() },
      null,
      null,
      failed,
    ).filter((stage) => stage.id !== 'outline');
  });
  private readonly progress = computed<ManualStagedProgress>(() => ({
    description: this.courseDescription(),
    outlineResponse: this.outlineResponse(),
    courseId: this.courseId(),
    nextModuleIndex: this.nextModuleIndex(),
  }));
  protected readonly hasProgress = computed(() =>
    shouldPersistManualStagedProgress(this.progress()),
  );
  protected readonly pageReady = computed(() => !this.loading() && this.progressRestored());

  constructor() {
    void this.initializePage();
  }

  private async initializePage(): Promise<void> {
    await Promise.all([this.loadSchemas(), this.restoreProgress()]);
  }

  protected copyResultFor(key: string): CopyTextToClipboardResult | null {
    const feedback = this.copyFeedback();
    return feedback?.key === key ? feedback.result : null;
  }

  protected formatIssue(issue: ImportIssue): string {
    return formatImportIssue(issue);
  }

  protected onModeChange(mode: PromptGenerationMode): void {
    this.mode.set(mode);
    this.copyFeedback.set(null);
  }

  protected onDescriptionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.inputsLocked()) {
      return;
    }
    this.courseDescription.set(target.value);
    this.copyFeedback.set(null);
    void this.persistProgressIfNeeded();
  }

  protected onOutlineResponseInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.inputsLocked()) {
      return;
    }
    this.outlineResponse.set(target.value);
    this.copyFeedback.set(null);
    this.resetStageAttempt();
    void this.persistProgressIfNeeded();
  }

  protected onStageAnswerChange(answer: string): void {
    this.stageAnswer.set(answer);
  }

  protected async onCopyPrompt(): Promise<void> {
    const courseImport = this.courseImportSchema();
    if (courseImport === null) {
      return;
    }
    await this.copy(
      SINGLE_COPY_KEY,
      buildCourseGenerationPrompt(this.courseDescription(), courseImport),
    );
  }

  protected async onCopyOutlinePrompt(): Promise<void> {
    const staged = this.stagedSchemas();
    if (staged === null || !this.hasDescription()) {
      return;
    }
    await this.copy(
      OUTLINE_COPY_KEY,
      joinStagedMessages(buildOutlineMessages(this.courseDescription(), staged.courseOutline)),
    );
  }

  protected async onCopyStagePrompt(): Promise<void> {
    const courseImport = this.courseImportSchema();
    const staged = this.stagedSchemas();
    const outline = this.outline();
    const step = this.currentStep();
    if (courseImport === null || staged === null || outline === null || step === null) {
      return;
    }
    const issues = this.stageIssues();
    const options = { retryIssues: issues.length > 0 ? issues : undefined };
    const messages =
      step.index === 0
        ? buildFirstModuleCourseMessages(this.courseDescription(), outline, courseImport, options)
        : buildModuleMessages(outline, step.index, staged.moduleImport, options);
    await this.copy(STAGE_COPY_KEY, joinStagedMessages(messages));
  }

  protected async onAcceptStage(): Promise<void> {
    const step = this.currentStep();
    const answer = this.stageAnswer();
    if (
      step === null ||
      this.accepting() ||
      this.pendingProgress() !== null ||
      answer.trim().length === 0
    ) {
      return;
    }

    this.accepting.set(true);
    this.stageError.set(null);
    try {
      const outcome = await this.acceptAnswer(step, answer);
      if (outcome.kind === 'ok') {
        this.stageAnswer.set('');
        this.resetStageAttempt();
        await this.commitProgress({
          ...this.progress(),
          courseId: step.index === 0 ? outcome.value : this.courseId(),
          nextModuleIndex: step.index + 1,
        });
      } else if (outcome.kind === 'invalid') {
        this.stageIssues.set(outcome.issues);
      } else {
        this.stageIssues.set([]);
        this.stageError.set(outcome.message);
      }
    } finally {
      this.accepting.set(false);
    }
  }

  protected async onRetryProgress(): Promise<void> {
    const pending = this.pendingProgress();
    if (pending === null || this.accepting()) {
      return;
    }
    this.accepting.set(true);
    try {
      await this.commitProgress(pending);
    } finally {
      this.accepting.set(false);
    }
  }

  protected async onStartOver(): Promise<void> {
    this.pendingProgress.set(null);
    this.courseDescription.set(EMPTY_MANUAL_STAGED_PROGRESS.description);
    this.outlineResponse.set(EMPTY_MANUAL_STAGED_PROGRESS.outlineResponse);
    this.courseId.set(EMPTY_MANUAL_STAGED_PROGRESS.courseId);
    this.nextModuleIndex.set(EMPTY_MANUAL_STAGED_PROGRESS.nextModuleIndex);
    this.stageAnswer.set('');
    this.copyFeedback.set(null);
    this.resetStageAttempt();
    try {
      await this.settings.clearManualStagedProgress();
      this.progressError.set(null);
    } catch {
      this.progressError.set('Не удалось очистить сохранённый прогресс.');
    }
  }

  private acceptAnswer(step: ModuleStep, answer: string): Promise<AttemptOutcome<string>> {
    const extracted = extractModelJson(answer, null);
    if (extracted.kind !== 'text') {
      return Promise.resolve(extracted);
    }
    const courseId = this.courseId();
    if (step.index === 0) {
      if (courseId !== null) {
        return Promise.resolve({
          kind: 'fatal',
          message: 'Курс уже сохранён. Продолжите со следующего модуля или начните заново.',
        });
      }
      return this.acceptor.acceptFirstModule(extracted.text, extracted.rawResponse);
    }
    if (courseId === null) {
      return Promise.resolve({
        kind: 'fatal',
        message: 'Сначала сохраните курс с первым модулем.',
      });
    }
    return this.acceptor.acceptModule(extracted.text, courseId, extracted.rawResponse);
  }

  private resetStageAttempt(): void {
    this.stageIssues.set([]);
    this.stageError.set(null);
  }

  private async copy(key: string, text: string): Promise<void> {
    const result = await copyTextToClipboard(text);
    this.copyFeedback.set({ key, result });
  }

  /**
   * Stores the progress after a stage was imported, then advances the wizard.
   * On failure the stage stays pending: retry writes the same progress without importing again.
   */
  private async commitProgress(next: ManualStagedProgress): Promise<void> {
    try {
      await this.settings.setManualStagedProgress(next);
    } catch {
      this.pendingProgress.set(next);
      this.progressError.set(
        'Этап сохранён в курсе, но прогресс не записан в браузере. Нажмите «Повторить запись прогресса»; иначе после перезагрузки этап придётся пройти снова.',
      );
      return;
    }
    this.pendingProgress.set(null);
    this.progressError.set(null);
    this.courseId.set(next.courseId);
    this.nextModuleIndex.set(next.nextModuleIndex);
  }

  private async persistProgressIfNeeded(): Promise<void> {
    if (!this.progressRestored()) {
      return;
    }
    try {
      await this.persistProgressOrThrow();
    } catch {
      this.progressError.set('Не удалось сохранить прогресс в браузере.');
    }
  }

  private async persistProgressOrThrow(): Promise<void> {
    const progress = this.progress();
    if (shouldPersistManualStagedProgress(progress)) {
      await this.settings.setManualStagedProgress(progress);
    } else {
      await this.settings.clearManualStagedProgress();
    }
    this.progressError.set(null);
  }

  private async restoreProgress(): Promise<void> {
    try {
      const progress = await this.settings.getManualStagedProgress();
      if (progress !== undefined) {
        this.courseDescription.set(progress.description);
        this.outlineResponse.set(progress.outlineResponse);
        this.courseId.set(progress.courseId);
        this.nextModuleIndex.set(progress.nextModuleIndex);
        if (progress.outlineResponse.length > 0 || progress.courseId !== null) {
          this.mode.set('staged');
        }
      }
    } catch {
      // Unreadable storage: start with an empty form.
    } finally {
      this.progressRestored.set(true);
    }
  }

  /** Independent loads: the single prompt needs only course-import; staged mode needs all three. */
  private async loadSchemas(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.stagedErrorMessage.set(null);
    this.courseImportSchema.set(null);
    this.stagedSchemas.set(null);
    this.copyFeedback.set(null);

    const [courseImport, moduleImport, courseOutline] = await Promise.allSettled([
      loadBundledCourseImportSchema(),
      loadBundledModuleImportSchema(),
      loadBundledCourseOutlineSchema(),
    ]);

    if (courseImport.status === 'fulfilled') {
      this.courseImportSchema.set(prettyPrintJson(courseImport.value));
    } else {
      this.errorMessage.set('Не удалось загрузить course-import.schema.json.');
    }

    if (moduleImport.status === 'fulfilled' && courseOutline.status === 'fulfilled') {
      this.stagedSchemas.set({
        moduleImport: prettyPrintJson(moduleImport.value),
        courseOutline: prettyPrintJson(courseOutline.value),
      });
    } else {
      const failed = [
        moduleImport.status === 'rejected' ? 'module-import.schema.json' : null,
        courseOutline.status === 'rejected' ? 'course-outline.schema.json' : null,
      ].filter((name): name is string => name !== null);
      this.stagedErrorMessage.set(
        `Поэтапный режим недоступен: не удалось загрузить ${failed.join(', ')}.`,
      );
    }

    this.loading.set(false);
  }
}
