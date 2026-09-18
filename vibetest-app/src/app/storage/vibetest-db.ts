import Dexie, { type EntityTable } from 'dexie';

import { VIBETEST_DB_VERSION } from './db-version';
import type { CourseRow, StepProgressRow } from './storage-row-types';

export const VIBETEST_DB_NAME = 'vibetest';

export class VibetestDb extends Dexie {
  courses!: EntityTable<CourseRow, 'courseId'>;
  stepProgress!: EntityTable<StepProgressRow, 'progressKey'>;

  constructor(name: string = VIBETEST_DB_NAME) {
    super(name);
    this.registerSchemaV1();
  }

  private registerSchemaV1(): void {
    this.version(VIBETEST_DB_VERSION).stores({
      courses: 'courseId',
      stepProgress: 'progressKey, courseId, [courseId+moduleId+stepId]',
    });
  }
}

export function createVibetestDb(name?: string): VibetestDb {
  return new VibetestDb(name);
}
