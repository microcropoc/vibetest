import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import type { CourseOutline } from '../../../course-generation/course-outline.model';
import { generationStepLabel } from '../../../course-generation/generation-stage-view';
import { formatImportIssue } from '../../../courses/import-issue-view';
import type { ImportIssue } from '../../../courses/import-types';
import {
  loadBundledCourseImportSchema,
  loadBundledCourseOutlineSchema,
  loadBundledModuleImportSchema,
  prettyPrintJson,
} from '../../../info/bundled-course-schema';
import { buildCourseGenerationPrompt } from '../../build-course-generation-prompt';
import {
  buildFirstModuleCourseMessages,
  buildModuleMessages,
  buildOutlineMessages,
  formatOutlineForPrompt,
  joinStagedMessages,
} from '../../build-staged-generation-messages';
import { parseOutlineResponse } from '../../parse-outline-response';
import {
  copyTextToClipboard,
  type CopyTextToClipboardResult,
} from '../../../shared/clipboard/copy-text-to-clipboard';

export type PromptGenerationMode = 'single' | 'staged';

type StagedSchemas = {
  readonly moduleImport: string;
  readonly courseOutline: string;
};

type CopyFeedback = {
  readonly key: string;
  readonly result: CopyTextToClipboardResult;
};

type ModulePromptView = {
  readonly key: string;
  readonly index: number;
  readonly label: string;
  readonly hint: string;
};

const SINGLE_COPY_KEY = 'single';
const OUTLINE_COPY_KEY = 'outline';

@Component({
  selector: 'app-prompt-generation-page',
  imports: [NgTemplateOutlet],
  templateUrl: './prompt-generation-page.html',
  styleUrl: './prompt-generation-page.scss',
})
export class PromptGenerationPage {
  protected readonly singleCopyKey = SINGLE_COPY_KEY;
  protected readonly outlineCopyKey = OUTLINE_COPY_KEY;

  protected readonly loading = signal(true);
  protected readonly courseImportSchema = signal<string | null>(null);
  protected readonly stagedSchemas = signal<StagedSchemas | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly stagedErrorMessage = signal<string | null>(null);
  protected readonly mode = signal<PromptGenerationMode>('single');
  protected readonly courseDescription = signal('');
  protected readonly outlineResponse = signal('');
  protected readonly copyFeedback = signal<CopyFeedback | null>(null);

  protected readonly hasDescription = computed(() => this.courseDescription().trim().length > 0);
  protected readonly outlineResult = computed(() => parseOutlineResponse(this.outlineResponse()));
  protected readonly outline = computed<CourseOutline | null>(() => {
    const result = this.outlineResult();
    return result.kind === 'valid' ? result.outline : null;
  });
  protected readonly outlineIssues = computed<readonly ImportIssue[]>(() => {
    const result = this.outlineResult();
    return result.kind === 'invalid' ? result.issues : [];
  });
  protected readonly outlineText = computed(() => {
    const outline = this.outline();
    return outline === null ? '' : formatOutlineForPrompt(outline);
  });
  protected readonly modulePrompts = computed<readonly ModulePromptView[]>(() => {
    const outline = this.outline();
    if (outline === null) {
      return [];
    }
    return outline.modules.map((_, index) => ({
      key: `module-${index}`,
      index,
      label: generationStepLabel({ kind: 'module', index }, outline),
      hint:
        index === 0
          ? 'Ответ импортируйте как курс на вкладке «Импорт».'
          : 'Ответ импортируйте как модуль в этот курс на вкладке «Импорт».',
    }));
  });

  constructor() {
    void this.loadSchemas();
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
    this.courseDescription.set(target.value);
    this.copyFeedback.set(null);
  }

  protected onOutlineResponseInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.outlineResponse.set(target.value);
    this.copyFeedback.set(null);
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

  protected async onCopyModulePrompt(prompt: ModulePromptView): Promise<void> {
    const courseImport = this.courseImportSchema();
    const staged = this.stagedSchemas();
    const outline = this.outline();
    if (courseImport === null || staged === null || outline === null) {
      return;
    }
    const messages =
      prompt.index === 0
        ? buildFirstModuleCourseMessages(this.courseDescription(), outline, courseImport)
        : buildModuleMessages(outline, prompt.index, staged.moduleImport);
    await this.copy(prompt.key, joinStagedMessages(messages));
  }

  private async copy(key: string, text: string): Promise<void> {
    const result = await copyTextToClipboard(text);
    this.copyFeedback.set({ key, result });
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
