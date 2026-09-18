import { Injectable, inject } from '@angular/core';

import type { Course } from '../courses/course.model';

import { courseFromRow, courseToRow } from './course-row-parse';
import { deleteStepProgressByCourseId } from './delete-step-progress-by-course-id';
import type { VibetestDb } from './vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from './vibetest-db-provider';

@Injectable({ providedIn: 'root' })
export class CourseRepository {
  private readonly db: VibetestDb;

  constructor(dbProvider: VibetestDbProvider = inject(VibetestDbProvider)) {
    this.db = dbProvider.db;
  }

  /** For unit tests without TestBed. */
  static forDb(db: VibetestDb): CourseRepository {
    return new CourseRepository(vibetestDbProviderFor(db));
  }

  async list(): Promise<readonly Course[]> {
    const rows = await this.db.courses.toArray();
    return rows.map((row) => courseFromRow(row));
  }

  async get(courseId: string): Promise<Course | undefined> {
    const row = await this.db.courses.get(courseId);
    return row ? courseFromRow(row) : undefined;
  }

  /** Upsert course document; does not modify step progress. */
  async put(course: Course): Promise<void> {
    await this.db.courses.put(courseToRow(course));
  }

  async replace(course: Course): Promise<void> {
    await this.put(course);
  }

  async delete(courseId: string): Promise<void> {
    await this.db.transaction('rw', this.db.courses, this.db.stepProgress, async () => {
      await deleteStepProgressByCourseId(this.db.stepProgress, courseId);
      await this.db.courses.delete(courseId);
    });
  }
}
