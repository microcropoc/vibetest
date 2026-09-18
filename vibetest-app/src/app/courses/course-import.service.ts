import { Injectable, inject } from '@angular/core';

import { CourseRepository } from '../storage/course-repository';
import { courseToRow } from '../storage/course-row-parse';
import { ProgressRepository } from '../storage/progress-repository';
import type { VibetestDb } from '../storage/vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from '../storage/vibetest-db-provider';

import type { ImportCourseOptions, ImportCourseResult } from './import-types';
import { parseImportCourseText } from './import-parse';
import { regenerateCourseIds } from './regenerate-course-ids';

@Injectable({ providedIn: 'root' })
export class CourseImportService {
  private readonly db: VibetestDb;
  private readonly courses: CourseRepository;
  private readonly progress: ProgressRepository;

  constructor(
    dbProvider: VibetestDbProvider = inject(VibetestDbProvider),
    courses: CourseRepository = inject(CourseRepository),
    progress: ProgressRepository = inject(ProgressRepository),
  ) {
    this.db = dbProvider.db;
    this.courses = courses;
    this.progress = progress;
  }

  static forDb(db: VibetestDb): CourseImportService {
    const provider = vibetestDbProviderFor(db);
    return new CourseImportService(provider, CourseRepository.forDb(db), ProgressRepository.forDb(db));
  }

  async importCourse(text: string, options: ImportCourseOptions): Promise<ImportCourseResult> {
    const parsed = parseImportCourseText(text);
    if (!parsed.ok) {
      return parsed;
    }

    let course = parsed.course;

    if (options.regenerateIds) {
      course = regenerateCourseIds(course);
      await this.courses.put(course);
      return { ok: true, courseId: course.courseId, action: 'created' };
    }

    const existing = await this.courses.get(course.courseId);
    if (existing === undefined) {
      await this.courses.put(course);
      return { ok: true, courseId: course.courseId, action: 'created' };
    }

    if (options.confirmReplace !== true) {
      return { ok: false, stage: 'replace-required', courseId: course.courseId };
    }

    await this.db.transaction('rw', this.db.courses, this.db.stepProgress, async () => {
      await this.progress.deleteAllByCourseId(course.courseId);
      await this.db.courses.put(courseToRow(course));
    });

    return { ok: true, courseId: course.courseId, action: 'replaced' };
  }
}
