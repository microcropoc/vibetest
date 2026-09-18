import { Injectable, inject } from '@angular/core';

import type { StepProgressSnapshot } from '../player/step-engine/step-progress-snapshot';

import { deleteStepProgressByCourseId } from './delete-step-progress-by-course-id';
import {
  stepProgressRowFromSnapshot,
  stepProgressSnapshotFromRow,
  type StepProgressRef,
} from './step-progress-parse';
import { buildStepProgressKey } from './step-progress-key';
import type { VibetestDb } from './vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from './vibetest-db-provider';

@Injectable({ providedIn: 'root' })
export class ProgressRepository {
  private readonly db: VibetestDb;

  constructor(dbProvider: VibetestDbProvider = inject(VibetestDbProvider)) {
    this.db = dbProvider.db;
  }

  static forDb(db: VibetestDb): ProgressRepository {
    return new ProgressRepository(vibetestDbProviderFor(db));
  }

  async get(ref: StepProgressRef): Promise<StepProgressSnapshot | undefined> {
    const progressKey = buildStepProgressKey(ref.courseId, ref.moduleId, ref.stepId);
    const row = await this.db.stepProgress.get(progressKey);
    return row ? stepProgressSnapshotFromRow(row) : undefined;
  }

  async put(ref: StepProgressRef, snapshot: StepProgressSnapshot): Promise<void> {
    await this.db.stepProgress.put(stepProgressRowFromSnapshot(ref, snapshot));
  }

  async listByCourseId(courseId: string): Promise<readonly StepProgressSnapshot[]> {
    const rows = await this.db.stepProgress.where('courseId').equals(courseId).toArray();
    return rows.map((row) => stepProgressSnapshotFromRow(row));
  }

  /**
   * Removes all step progress for a course. Does not open a transaction — reuse
   * `deleteStepProgressByCourseId` (same as CourseRepository.delete progress leg).
   */
  async deleteAllByCourseId(courseId: string): Promise<number> {
    return deleteStepProgressByCourseId(this.db.stepProgress, courseId);
  }
}
