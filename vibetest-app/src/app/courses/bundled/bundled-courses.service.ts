import { inject, Injectable } from '@angular/core';

import { BundledCoursesSeenRepository } from '../../storage/bundled-courses-seen-repository';
import { CourseRepository } from '../../storage/course-repository';
import type { VibetestDb } from '../../storage/vibetest-db';

import { bundledCoursesFetchWithTimeout } from './bundled-courses-fetch';
import {
  restoreMissingBundledCourses,
  syncBundledCoursesOnStartup,
  type BundledCoursesFetch,
  type BundledCoursesRestoreResult,
  type BundledCoursesSyncDeps,
} from './bundled-courses-sync';
import { BUNDLED_COURSES, type BundledCourseEntry } from './generated-bundled-courses';

export type { BundledCoursesFetch, BundledCoursesRestoreResult };

/** Import only lazily (settings page, app initializer via `import()`) to keep the parser out of `main`. */
@Injectable({ providedIn: 'root', useFactory: () => BundledCoursesService.createRoot() })
export class BundledCoursesService {
  private readonly deps: BundledCoursesSyncDeps;

  private constructor(deps: BundledCoursesSyncDeps) {
    this.deps = deps;
  }

  static createRoot(): BundledCoursesService {
    return new BundledCoursesService({
      courses: inject(CourseRepository),
      seen: inject(BundledCoursesSeenRepository),
      manifest: BUNDLED_COURSES,
      fetchFn: bundledCoursesFetchWithTimeout,
    });
  }

  /** For unit tests without TestBed. */
  static forDb(
    db: VibetestDb,
    options: {
      readonly fetchFn: BundledCoursesFetch;
      readonly manifest?: readonly BundledCourseEntry[];
    },
  ): BundledCoursesService {
    return new BundledCoursesService({
      courses: CourseRepository.forDb(db),
      seen: BundledCoursesSeenRepository.forDb(db),
      manifest: options.manifest ?? BUNDLED_COURSES,
      fetchFn: options.fetchFn,
    });
  }

  async syncOnStartup(): Promise<void> {
    await syncBundledCoursesOnStartup(this.deps);
  }

  async restoreMissing(): Promise<BundledCoursesRestoreResult> {
    return restoreMissingBundledCourses(this.deps);
  }
}
