import {
  parseManualStagedProgress,
  tryParseManualStagedProgress,
  type ManualStagedProgress,
} from '../prompt-generation/manual-staged-progress';
import type { LlmProfile } from '../settings/llm-profile.model';
import { parseLlmProfiles, tryParseLlmProfiles } from '../settings/parse-llm-profiles';
import { parseTheme } from '../settings/parse-theme';
import type { Theme } from '../settings/theme.model';

import type { SettingsRow } from './storage-row-types';
import { SETTINGS_LLM_PROFILES_KEY } from './settings-llm-profiles-key';
import { SETTINGS_MANUAL_STAGED_PROGRESS_KEY } from './settings-manual-staged-progress-key';
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

export function llmProfilesFromSettingsRow(
  row: SettingsRow | undefined,
): readonly LlmProfile[] {
  if (row === undefined || row.key !== SETTINGS_LLM_PROFILES_KEY) {
    return [];
  }
  return tryParseLlmProfiles(row.value) ?? [];
}

export function settingsRowForLlmProfiles(
  profiles: readonly LlmProfile[],
): SettingsRow {
  return { key: SETTINGS_LLM_PROFILES_KEY, value: parseLlmProfiles(profiles) };
}

export function manualStagedProgressFromSettingsRow(
  row: SettingsRow | undefined,
): ManualStagedProgress | undefined {
  if (row === undefined || row.key !== SETTINGS_MANUAL_STAGED_PROGRESS_KEY) {
    return undefined;
  }
  return tryParseManualStagedProgress(row.value);
}

export function settingsRowForManualStagedProgress(progress: ManualStagedProgress): SettingsRow {
  return { key: SETTINGS_MANUAL_STAGED_PROGRESS_KEY, value: parseManualStagedProgress(progress) };
}
