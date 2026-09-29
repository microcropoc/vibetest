import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import {
  formatImportIssue,
  importStageLabel,
} from '../../../courses/import-issue-view';
import type { ImportIssue, ImportValidationStage } from '../../../courses/import-types';
import {
  loadBundledCourseImportSchema,
  prettyPrintJson,
} from '../../../info/bundled-course-schema';
import { buildCourseGenerationPrompt } from '../../../prompt-generation/build-course-generation-prompt';
import { SettingsRepository } from '../../../storage/settings-repository';
import type { LlmProfile } from '../../../settings/llm-profile.model';
import {
  emptyLlmProfileFieldsValue,
  llmProfileFieldsError,
  type LlmProfileFieldsValue,
} from '../../../settings/llm-profile-fields-value';
import { LlmProfileFieldsComponent } from '../../../settings/ui/llm-profile-fields/llm-profile-fields';
import {
  profileFromFields,
  upsertLlmProfile,
} from '../../../settings/upsert-llm-profile';
import { LmStudioClient } from '../../lm-studio-client.service';
import { prepareLlmImportText } from '../../prepare-llm-import-text';

type ProfileMode = 'saved' | 'new';

type ProfileResolution =
  | { readonly ok: true; readonly profile: LlmProfile }
  | { readonly ok: false; readonly message: string };

@Component({
  selector: 'app-course-generation-page',
  imports: [RouterLink, LlmProfileFieldsComponent],
  templateUrl: './course-generation-page.html',
  styleUrl: './course-generation-page.scss',
})
export class CourseGenerationPage {
  private readonly settings = inject(SettingsRepository);
  private readonly lmStudio = inject(LmStudioClient);
  private readonly importService = inject(CourseImportService);

  protected readonly schemaLoading = signal(true);
  protected readonly schemaText = signal('');
  protected readonly schemaError = signal<string | null>(null);

  protected readonly profiles = signal<readonly LlmProfile[]>([]);
  protected readonly profileMode = signal<ProfileMode>('saved');
  protected readonly selectedProfileId = signal('');
  protected readonly newProfileFields = signal<LlmProfileFieldsValue>(emptyLlmProfileFieldsValue());
  protected readonly saveNewProfile = signal(true);

  protected readonly courseDescription = signal('');
  protected readonly generating = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly rawModelResponse = signal<string | null>(null);
  protected readonly importIssues = signal<readonly ImportIssue[]>([]);
  protected readonly importStage = signal<ImportValidationStage | null>(null);
  protected readonly generatedCourseId = signal<string | null>(null);

  protected readonly formatIssue = formatImportIssue;

  protected readonly hasDescription = computed(
    () => this.courseDescription().trim().length > 0,
  );

  protected readonly canGenerate = computed(
    () => !this.generating() && this.schemaText().length > 0 && this.hasDescription(),
  );

  protected readonly stageHeading = computed((): string => {
    const stage = this.importStage();
    return stage ? importStageLabel(stage) : '';
  });

  private abortController: AbortController | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.abortController?.abort());
    void this.loadSchema();
    void this.loadProfiles();
  }

  protected onDescriptionInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.courseDescription.set(target.value);
    this.clearResult();
  }

  protected onProfileModeChange(mode: ProfileMode): void {
    this.profileMode.set(mode);
    this.clearResult();
  }

  protected onSelectedProfileChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    this.selectedProfileId.set(target.value);
    this.clearResult();
  }

  protected onNewProfileFieldsChange(value: LlmProfileFieldsValue): void {
    this.newProfileFields.set(value);
    this.clearResult();
  }

  protected onSaveNewProfileChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.saveNewProfile.set(target.checked);
  }

  protected async onGenerate(): Promise<void> {
    if (!this.canGenerate()) {
      return;
    }

    this.clearResult();
    this.generating.set(true);
    const controller = new AbortController();
    this.abortController = controller;

    try {
      const profileResult = await this.resolveProfileForRequest();
      if (!profileResult.ok) {
        this.apiError.set(profileResult.message);
        return;
      }

      const prompt = buildCourseGenerationPrompt(this.courseDescription(), this.schemaText());
      const completion = await this.lmStudio.completeUserPrompt(
        profileResult.profile,
        prompt,
        controller.signal,
      );

      if (completion.kind === 'failure') {
        this.apiError.set(completion.message);
        return;
      }
      if (controller.signal.aborted) {
        this.apiError.set('Запрос отменён.');
        return;
      }

      this.rawModelResponse.set(completion.content);

      let importText: string;
      try {
        importText = prepareLlmImportText(completion.content);
      } catch (err: unknown) {
        this.apiError.set(
          err instanceof Error ? err.message : 'Не удалось извлечь JSON из ответа.',
        );
        return;
      }

      const importResult = await this.importService.importCourseWithNewIds(importText, {
        validatePracticeSteps: false,
      });

      if (!importResult.ok) {
        this.importStage.set(importResult.stage);
        this.importIssues.set(importResult.issues);
        return;
      }

      this.generatedCourseId.set(importResult.courseId);
    } catch {
      this.apiError.set('Не удалось сохранить курс.');
    } finally {
      this.generating.set(false);
      if (this.abortController === controller) {
        this.abortController = undefined;
      }
    }
  }

  protected onCancelGenerate(): void {
    this.abortController?.abort();
  }

  private async resolveProfileForRequest(): Promise<ProfileResolution> {
    if (this.profileMode() === 'saved') {
      const id = this.selectedProfileId();
      const profile = this.profiles().find((p) => p.id === id);
      if (profile === undefined) {
        return { ok: false, message: 'Выберите сохранённый профиль или добавьте новый.' };
      }
      return { ok: true, profile };
    }

    const fields = this.newProfileFields();
    const fieldsError = llmProfileFieldsError(fields);
    if (fieldsError !== null) {
      return { ok: false, message: fieldsError };
    }

    const profile = profileFromFields(fields);
    if (!this.saveNewProfile()) {
      return { ok: true, profile };
    }

    const next = upsertLlmProfile(this.profiles(), profile);
    try {
      await this.settings.setLlmProfiles(next);
    } catch {
      return { ok: false, message: 'Не удалось сохранить профиль.' };
    }
    this.profiles.set(next);
    this.selectedProfileId.set(profile.id);
    this.profileMode.set('saved');
    this.newProfileFields.set(emptyLlmProfileFieldsValue());
    return { ok: true, profile };
  }

  private clearResult(): void {
    this.apiError.set(null);
    this.rawModelResponse.set(null);
    this.importIssues.set([]);
    this.importStage.set(null);
    this.generatedCourseId.set(null);
  }

  private async loadSchema(): Promise<void> {
    this.schemaLoading.set(true);
    this.schemaError.set(null);
    this.schemaText.set('');

    try {
      const schema = await loadBundledCourseImportSchema();
      this.schemaText.set(prettyPrintJson(schema));
    } catch {
      this.schemaError.set('Не удалось загрузить course-import.schema.json.');
    } finally {
      this.schemaLoading.set(false);
    }
  }

  private async loadProfiles(): Promise<void> {
    let profiles: readonly LlmProfile[] = [];
    try {
      profiles = await this.settings.getLlmProfiles();
    } catch {
      profiles = [];
    }
    this.profiles.set(profiles);
    if (profiles.length > 0) {
      this.selectedProfileId.set(profiles[0]!.id);
      this.profileMode.set('saved');
    } else {
      this.profileMode.set('new');
    }
  }
}
