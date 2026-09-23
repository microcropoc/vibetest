import { parseTheme } from '../settings/parse-theme';
import type { Theme } from '../settings/theme.model';

import type { SettingsRow } from './storage-row-types';
import { SETTINGS_THEME_KEY } from './settings-theme-key';

export function themeFromSettingsRow(row: SettingsRow | undefined): Theme | undefined {
  if (row === undefined || row.key !== SETTINGS_THEME_KEY) {
    return undefined;
  }
  return parseTheme(row.value);
}

export function settingsRowForTheme(theme: Theme): SettingsRow {
  return { key: SETTINGS_THEME_KEY, value: theme };
}
