import { Injectable, inject } from '@angular/core';

import type { ManualStagedProgress } from '../prompt-generation/manual-staged-progress';
import type { LlmProfile } from '../settings/llm-profile.model';
import type { Theme } from '../settings/theme.model';

import {
  llmProfilesFromSettingsRow,
  manualStagedProgressFromSettingsRow,
  settingsRowForLlmProfiles,
  settingsRowForManualStagedProgress,
  settingsRowForTheme,
  themeFromSettingsRow,
} from './settings-row-parse';
import { SETTINGS_LLM_PROFILES_KEY } from './settings-llm-profiles-key';
import { SETTINGS_MANUAL_STAGED_PROGRESS_KEY } from './settings-manual-staged-progress-key';
import { SETTINGS_THEME_KEY } from './settings-theme-key';
import type { VibetestDb } from './vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from './vibetest-db-provider';

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  private readonly db: VibetestDb;

  constructor(dbProvider: VibetestDbProvider = inject(VibetestDbProvider)) {
    this.db = dbProvider.db;
  }

  /** For unit tests without TestBed. */
  static forDb(db: VibetestDb): SettingsRepository {
    return new SettingsRepository(vibetestDbProviderFor(db));
  }

  /** Undefined when the user has not chosen a theme yet. */
  async getStoredTheme(): Promise<Theme | undefined> {
    const row = await this.db.settings.get(SETTINGS_THEME_KEY);
    return themeFromSettingsRow(row);
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.db.settings.put(settingsRowForTheme(theme));
  }

  async getLlmProfiles(): Promise<readonly LlmProfile[]> {
    const row = await this.db.settings.get(SETTINGS_LLM_PROFILES_KEY);
    return llmProfilesFromSettingsRow(row);
  }

  async setLlmProfiles(profiles: readonly LlmProfile[]): Promise<void> {
    await this.db.settings.put(settingsRowForLlmProfiles(profiles));
  }

  /** Undefined when nothing is saved or the stored row is broken. */
  async getManualStagedProgress(): Promise<ManualStagedProgress | undefined> {
    const row = await this.db.settings.get(SETTINGS_MANUAL_STAGED_PROGRESS_KEY);
    return manualStagedProgressFromSettingsRow(row);
  }

  async setManualStagedProgress(progress: ManualStagedProgress): Promise<void> {
    await this.db.settings.put(settingsRowForManualStagedProgress(progress));
  }

  async clearManualStagedProgress(): Promise<void> {
    await this.db.settings.delete(SETTINGS_MANUAL_STAGED_PROGRESS_KEY);
  }
}
