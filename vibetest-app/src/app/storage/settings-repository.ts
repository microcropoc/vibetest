import { Injectable, inject } from '@angular/core';

import type { Theme } from '../settings/theme.model';

import {
  settingsRowForTheme,
  themeFromSettingsRow,
} from './settings-row-parse';
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
}
