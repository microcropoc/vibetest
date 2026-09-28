import { Injectable, inject } from '@angular/core';

import { bundledCoursesSeenFromRow, settingsRowForBundledCoursesSeen } from './bundled-courses-seen-row';
import { SETTINGS_BUNDLED_COURSES_SEEN_KEY } from './settings-bundled-courses-key';
import type { VibetestDb } from './vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from './vibetest-db-provider';

/**
 * Separate from `SettingsRepository` (eager via theme init): UUID parsing pulls generated Zod schemas,
 * which must stay out of the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class BundledCoursesSeenRepository {
  private readonly db: VibetestDb;

  constructor(dbProvider: VibetestDbProvider = inject(VibetestDbProvider)) {
    this.db = dbProvider.db;
  }

  /** For unit tests without TestBed. */
  static forDb(db: VibetestDb): BundledCoursesSeenRepository {
    return new BundledCoursesSeenRepository(vibetestDbProviderFor(db));
  }

  async get(): Promise<readonly string[]> {
    const row = await this.db.settings.get(SETTINGS_BUNDLED_COURSES_SEEN_KEY);
    return bundledCoursesSeenFromRow(row);
  }

  async add(courseIds: readonly string[]): Promise<void> {
    if (courseIds.length === 0) {
      return;
    }
    const merged = [...(await this.get())];
    for (const id of courseIds) {
      if (!merged.includes(id)) {
        merged.push(id);
      }
    }
    await this.db.settings.put(settingsRowForBundledCoursesSeen(merged));
  }
}
