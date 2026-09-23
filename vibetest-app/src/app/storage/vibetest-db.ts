import Dexie, { type EntityTable } from 'dexie';

import { VIBETEST_DB_VERSION } from './db-version';
import type { CourseRow, SettingsRow, StepProgressRow } from './storage-row-types';

export const VIBETEST_DB_NAME = 'vibetest';

export class VibetestDb extends Dexie {
  courses!: EntityTable<CourseRow, 'courseId'>;
  stepProgress!: EntityTable<StepProgressRow, 'progressKey'>;
  settings!: EntityTable<SettingsRow, 'key'>;

  constructor(name: string = VIBETEST_DB_NAME) {
    super(name);
    this.registerSchema();
  }

  private registerSchema(): void {
    this.version(1).stores({
      courses: 'courseId',
      stepProgress: 'progressKey, courseId, [courseId+moduleId+stepId]',
    });
    this.version(VIBETEST_DB_VERSION).stores({
      courses: 'courseId',
      stepProgress: 'progressKey, courseId, [courseId+moduleId+stepId]',
      settings: 'key',
    });
  }
}

export function createVibetestDb(name?: string): VibetestDb {
  return new VibetestDb(name);
}
