import { Injectable, inject } from '@angular/core';

import type { LlmProfile } from '../settings/llm-profile.model';
import type { Theme } from '../settings/theme.model';

import {
  llmProfilesFromSettingsRow,
  settingsRowForLlmProfiles,
  settingsRowForTheme,
  themeFromSettingsRow,
} from './settings-row-parse';
import { SETTINGS_LLM_PROFILES_KEY } from './settings-llm-profiles-key';
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
}
