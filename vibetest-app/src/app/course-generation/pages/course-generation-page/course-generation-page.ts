import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatImportIssue, importStageLabel } from '../../../courses/import-issue-view';
import type { ImportIssue, ImportValidationStage } from '../../../courses/import-types';
import { isPlainObject } from '../../../execution/is-plain-object';
import {
  loadBundledCourseImportSchema,
  loadBundledCourseOutlineSchema,
  loadBundledModuleImportSchema,
  prettyPrintJson,
} from '../../../info/bundled-course-schema';
import {
  buildFirstModuleCourseMessages,
  buildOutlineMessages,
} from '../../../prompt-generation/build-staged-generation-messages';
import {
  emptyLlmProfileFieldsValue,
  llmProfileFieldsError,
  type LlmProfileFieldsValue,
} from '../../../settings/llm-profile-fields-value';
import type { LlmProfile } from '../../../settings/llm-profile.model';
import { LlmProfileFieldsComponent } from '../../../settings/ui/llm-profile-fields/llm-profile-fields';
import { profileFromFields, upsertLlmProfile } from '../../../settings/upsert-llm-profile';
import { SettingsRepository } from '../../../storage/settings-repository';
import type { CourseOutline } from '../../course-outline.model';
import { estimatePromptTokens } from '../../estimate-prompt-tokens';
import {
  buildGenerationStageViews,
  generationStepLabel,
  type GenerationAttempt,
} from '../../generation-stage-view';
import {
  INITIAL_STAGED_GENERATION_STATE,
  StagedCourseGenerator,
  type GenerationSchema,
  type GenerationStep,
  type StagedGenerationOutcome,
  type StagedGenerationState,
} from '../../staged-course-generator.service';
import { GenerationStages } from '../../ui/generation-stages/generation-stages';

type ProfileMode = 'saved' | 'new';

type ProfileResolution =
  | { readonly ok: true; readonly profile: LlmProfile }
  | { readonly ok: false; readonly message: string };

type GenerationSchemas = {
  readonly outline: GenerationSchema;
  readonly courseImport: GenerationSchema;
  readonly moduleImport: GenerationSchema;
};

type GenerationFailure = {
  readonly step: GenerationStep;
  readonly message: string;
  readonly stage: ImportValidationStage | null;
  readonly issues: readonly ImportIssue[];
  readonly rawResponse: string | null;
};

/** Stand-in plan for the token estimate before stage 1 has produced the real one. */
const ESTIMATE_OUTLINE: CourseOutline = {
  schemaVersion: 1,
  title: '',
  description: '',
  modules: [{ title: '', summary: '', steps: [] }],
};

function generationSchema(schema: unknown): GenerationSchema {
  return { text: prettyPrintJson(schema), record: isPlainObject(schema) ? schema : null };
}

@Component({
  selector: 'app-course-generation-page',
  imports: [RouterLink, LlmProfileFieldsComponent, GenerationStages],
  templateUrl: './course-generation-page.html',
  styleUrl: './course-generation-page.scss',
})
export class CourseGenerationPage {
  private readonly settings = inject(SettingsRepository);
  private readonly generator = inject(StagedCourseGenerator);

  protected readonly schemaLoading = signal(true);
  protected readonly schemas = signal<GenerationSchemas | null>(null);
  protected readonly schemaError = signal<string | null>(null);
  protected readonly lastPromptTokens = signal<number | null>(null);

  protected readonly profiles = signal<readonly LlmProfile[]>([]);
  protected readonly profileMode = signal<ProfileMode>('saved');
  protected readonly selectedProfileId = signal('');
  protected readonly newProfileFields = signal<LlmProfileFieldsValue>(emptyLlmProfileFieldsValue());
  protected readonly saveNewProfile = signal(true);

  protected readonly courseDescription = signal('');
  protected readonly generating = signal(false);
  protected readonly generationState = signal<StagedGenerationState>(
    INITIAL_STAGED_GENERATION_STATE,
  );
  protected readonly runningStep = signal<GenerationStep | null>(null);
  protected readonly runningAttempt = signal<GenerationAttempt | null>(null);
  protected readonly failure = signal<GenerationFailure | null>(null);
  protected readonly apiError = signal<string | null>(null);
  protected readonly completed = signal(false);

  protected readonly formatIssue = formatImportIssue;

  protected readonly hasDescription = computed(
    () => this.courseDescription().trim().length > 0,
  );

  protected readonly canGenerate = computed(
    () => !this.generating() && this.schemas() !== null && this.hasDescription(),
  );

  protected readonly canResume = computed(() => this.canGenerate() && this.failure() !== null);

  protected readonly started = computed(
    () => this.generating() || this.failure() !== null || this.generationState().outline !== null,
  );

  protected readonly stageViews = computed(() =>
    buildGenerationStageViews(
      this.generationState(),
      this.runningStep(),
      this.runningAttempt(),
      this.failure()?.step ?? null,
    ),
  );

  protected readonly generatedCourseId = computed(() => this.generationState().courseId);

  protected readonly failureStageHeading = computed((): string => {
    const stage = this.failure()?.stage;
    return stage ? importStageLabel(stage) : '';
  });

  /** Largest stage prompt: stage 1 or stage 2 with the course-import schema. */
  protected readonly estimatedPromptTokens = computed(() => {
    const schemas = this.schemas();
    if (schemas === null) {
      return 0;
    }
    const description = this.courseDescription();
    return Math.max(
      estimatePromptTokens(buildOutlineMessages(description, schemas.outline.text)),
      estimatePromptTokens(
        buildFirstModuleCourseMessages(
          description,
          this.generationState().outline ?? ESTIMATE_OUTLINE,
          schemas.courseImport.text,
        ),
      ),
    );
  });

  private abortController: AbortController | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.abortController?.abort());
    void this.loadSchemas();
    void this.loadProfiles();
  }

  protected onDescriptionInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement) || this.generating()) {
      return;
    }
    this.courseDescription.set(target.value);
    this.resetGeneration();
  }

  protected onProfileModeChange(mode: ProfileMode): void {
    this.profileMode.set(mode);
    this.apiError.set(null);
  }

  protected onSelectedProfileChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    this.selectedProfileId.set(target.value);
    this.apiError.set(null);
  }

  protected onNewProfileFieldsChange(value: LlmProfileFieldsValue): void {
    this.newProfileFields.set(value);
    this.apiError.set(null);
  }

  protected onSaveNewProfileChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.saveNewProfile.set(target.checked);
  }

  protected onGenerate(): Promise<void> {
    return this.runGeneration(true);
  }

  protected onResume(): Promise<void> {
    return this.runGeneration(false);
  }

  protected onCancelGenerate(): void {
    this.abortController?.abort();
  }

  private async runGeneration(fromScratch: boolean): Promise<void> {
    const schemas = this.schemas();
    if (!this.canGenerate() || schemas === null) {
      return;
    }

    if (fromScratch) {
      this.resetGeneration();
    }
    this.apiError.set(null);
    this.failure.set(null);
    this.generating.set(true);
    const controller = new AbortController();
    this.abortController = controller;

    try {
      const profileResult = await this.resolveProfileForRequest();
      if (!profileResult.ok) {
        this.apiError.set(profileResult.message);
        return;
      }

      const result = await this.generator.run(
        this.generationState(),
        { profile: profileResult.profile, description: this.courseDescription(), schemas },
        {
          signal: controller.signal,
          callbacks: {
            onAttempt: (step, attempt, maxAttempts) => {
              this.runningStep.set(step);
              this.runningAttempt.set({ attempt, maxAttempts });
            },
            onStateChange: (state) => this.generationState.set(state),
            onPromptTokens: (promptTokens) => this.lastPromptTokens.set(promptTokens),
          },
        },
      );
      this.generationState.set(result.state);
      this.applyOutcome(result.outcome, result.state);
    } catch {
      this.apiError.set('Генерация прервана из-за непредвиденной ошибки.');
    } finally {
      this.generating.set(false);
      this.runningStep.set(null);
      this.runningAttempt.set(null);
      if (this.abortController === controller) {
        this.abortController = undefined;
      }
    }
  }

  private applyOutcome(outcome: StagedGenerationOutcome, state: StagedGenerationState): void {
    if (outcome.kind === 'done') {
      this.completed.set(true);
      return;
    }
    const label = generationStepLabel(outcome.step, state.outline);
    if (outcome.kind === 'exhausted') {
      this.failure.set({
        step: outcome.step,
        message: `Этап «${label}» не прошёл проверку после всех попыток.`,
        stage: outcome.last.stage,
        issues: outcome.last.issues,
        rawResponse: outcome.last.rawResponse ?? null,
      });
      return;
    }
    this.failure.set({
      step: outcome.step,
      message: outcome.failure.message,
      stage: null,
      issues: [],
      rawResponse: outcome.failure.rawResponse ?? null,
    });
  }

  private resetGeneration(): void {
    this.generationState.set(INITIAL_STAGED_GENERATION_STATE);
    this.failure.set(null);
    this.apiError.set(null);
    this.completed.set(false);
    this.lastPromptTokens.set(null);
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

  private async loadSchemas(): Promise<void> {
    this.schemaLoading.set(true);
    this.schemaError.set(null);
    this.schemas.set(null);

    try {
      const [outline, courseImport, moduleImport] = await Promise.all([
        loadBundledCourseOutlineSchema(),
        loadBundledCourseImportSchema(),
        loadBundledModuleImportSchema(),
      ]);
      this.schemas.set({
        outline: generationSchema(outline),
        courseImport: generationSchema(courseImport),
        moduleImport: generationSchema(moduleImport),
      });
    } catch {
      this.schemaError.set(
        'Не удалось загрузить схемы генерации (course-outline, course-import, module-import).',
      );
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
