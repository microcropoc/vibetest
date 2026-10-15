import { Component, inject, signal } from '@angular/core';

import { BundledCoursesService } from '../../../courses/bundled/bundled-courses.service';
import { SettingsRepository } from '../../../storage/settings-repository';
import type { LlmProfile } from '../../llm-profile.model';
import { LlmProfilesEditorComponent } from '../../ui/llm-profiles-editor/llm-profiles-editor';
import { ThemePickerComponent } from '../../ui/theme-picker/theme-picker';
import { TypographyPicker } from '../../ui/typography-picker/typography-picker';
import type { Theme } from '../../theme.model';
import { ThemeService } from '../../theme.service';
import type { CodeTypography, UiTypography } from '../../typography.model';
import { TypographyService } from '../../typography.service';
import { removeLlmProfile, upsertLlmProfile } from '../../upsert-llm-profile';

@Component({
  selector: 'app-settings-page',
  imports: [ThemePickerComponent, TypographyPicker, LlmProfilesEditorComponent],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly themeService = inject(ThemeService);
  private readonly typographyService = inject(TypographyService);
  private readonly bundledCourses = inject(BundledCoursesService);
  private readonly settings = inject(SettingsRepository);

  protected readonly theme = this.themeService.theme;
  protected readonly uiTypography = this.typographyService.ui;
  protected readonly codeTypography = this.typographyService.code;
  protected readonly bundledRestoreBusy = signal(false);
  protected readonly bundledRestoreMessage = signal<string | null>(null);

  protected readonly llmProfiles = signal<readonly LlmProfile[]>([]);
  protected readonly llmProfilesLoading = signal(true);
  protected readonly llmProfilesMessage = signal<string | null>(null);

  constructor() {
    void this.loadLlmProfiles();
  }

  protected onThemeChange(theme: Theme): void {
    void this.themeService.setTheme(theme);
  }

  protected onUiTypography(typography: UiTypography): void {
    void this.typographyService.setUi(typography);
  }

  protected onCodeTypography(typography: CodeTypography): void {
    void this.typographyService.setCode(typography);
  }

  protected onTypographyReset(): void {
    void this.typographyService.reset();
  }

  protected async onLlmProfileSave(profile: LlmProfile): Promise<void> {
    await this.persistLlmProfiles(upsertLlmProfile(this.llmProfiles(), profile), 'Профиль сохранён.');
  }

  protected async onLlmProfileDelete(profile: LlmProfile): Promise<void> {
    await this.persistLlmProfiles(removeLlmProfile(this.llmProfiles(), profile.id), 'Профиль удалён.');
  }

  protected async onRestoreBundledCourses(): Promise<void> {
    if (this.bundledRestoreBusy()) {
      return;
    }
    this.bundledRestoreBusy.set(true);
    this.bundledRestoreMessage.set(null);
    try {
      const { added, failed } = await this.bundledCourses.restoreMissing();
      if (failed.length > 0) {
        const failedText = `Не удалось загрузить: ${failed.length}`;
        this.bundledRestoreMessage.set(added > 0 ? `Добавлено: ${added}. ${failedText}` : failedText);
      } else if (added > 0) {
        this.bundledRestoreMessage.set(`Добавлено: ${added}`);
      } else {
        this.bundledRestoreMessage.set('Все встроенные курсы уже установлены');
      }
    } catch {
      this.bundledRestoreMessage.set('Не удалось проверить встроенные курсы');
    } finally {
      this.bundledRestoreBusy.set(false);
    }
  }

  private async persistLlmProfiles(
    next: readonly LlmProfile[],
    successMessage: string,
  ): Promise<void> {
    try {
      await this.settings.setLlmProfiles(next);
      this.llmProfiles.set(next);
      this.llmProfilesMessage.set(successMessage);
    } catch {
      this.llmProfilesMessage.set('Не удалось сохранить профили.');
    }
  }

  private async loadLlmProfiles(): Promise<void> {
    try {
      this.llmProfiles.set(await this.settings.getLlmProfiles());
    } catch {
      this.llmProfilesMessage.set('Не удалось загрузить профили.');
    } finally {
      this.llmProfilesLoading.set(false);
    }
  }
}
