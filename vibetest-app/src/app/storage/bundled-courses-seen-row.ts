import { parseBundledCoursesSeen } from './parse-bundled-courses-seen';
import { SETTINGS_BUNDLED_COURSES_SEEN_KEY } from './settings-bundled-courses-key';
import type { SettingsRow } from './storage-row-types';

export function bundledCoursesSeenFromRow(row: SettingsRow | undefined): readonly string[] {
  if (row === undefined || row.key !== SETTINGS_BUNDLED_COURSES_SEEN_KEY) {
    return [];
  }
  return parseBundledCoursesSeen(row.value);
}

export function settingsRowForBundledCoursesSeen(courseIds: readonly string[]): SettingsRow {
  return { key: SETTINGS_BUNDLED_COURSES_SEEN_KEY, value: [...courseIds] };
}
