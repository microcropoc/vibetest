import { Injectable, inject } from '@angular/core';

import { ExecutionWorkerWrapperService } from '../execution/execution-worker-wrapper.service';
import { CourseRepository } from '../storage/course-repository';
import { courseToRow } from '../storage/course-row-parse';
import { ProgressRepository } from '../storage/progress-repository';
import type { VibetestDb } from '../storage/vibetest-db';
import { VibetestDbProvider, vibetestDbProviderFor } from '../storage/vibetest-db-provider';

import type {
  ImportCourseOptions,
  ImportCourseResult,
  ImportModuleOptions,
  ImportModuleResult,
} from './import-types';
import { parseImportCourseText } from './import-parse';
import { parseImportModuleText } from './import-module-parse';
import { regenerateCourseIds } from './regenerate-course-ids';
import {
  courseWithAppendedModule,
  remapSingleModuleIssuePath,
  validateAppendModuleToCourse,
} from './semantic-validation';
import type { PracticeReferenceValidationDeps } from './validate-practice-references';
import {
  createWorkerPracticeReferenceValidationDeps,
  validatePracticeReferences,
} from './validate-practice-references';

@Injectable({ providedIn: 'root' })
export class CourseImportService {
  private readonly db: VibetestDb;
  private readonly courses: CourseRepository;
  private readonly progress: ProgressRepository;
  private readonly executionWrapper: ExecutionWorkerWrapperService;
  private practiceValidationDepsOverride: PracticeReferenceValidationDeps | undefined;

  constructor(
    dbProvider: VibetestDbProvider = inject(VibetestDbProvider),
    courses: CourseRepository = inject(CourseRepository),
    progress: ProgressRepository = inject(ProgressRepository),
    executionWrapper: ExecutionWorkerWrapperService = inject(ExecutionWorkerWrapperService),
  ) {
    this.db = dbProvider.db;
    this.courses = courses;
    this.progress = progress;
    this.executionWrapper = executionWrapper;
  }

  static forDb(
    db: VibetestDb,
    options?: {
      readonly executionWrapper?: ExecutionWorkerWrapperService;
      readonly practiceValidationDeps?: PracticeReferenceValidationDeps;
    },
  ): CourseImportService {
    const provider = vibetestDbProviderFor(db);
    const service = new CourseImportService(
      provider,
      CourseRepository.forDb(db),
      ProgressRepository.forDb(db),
      options?.executionWrapper ?? new ExecutionWorkerWrapperService(),
    );
    if (options?.practiceValidationDeps !== undefined) {
      service.practiceValidationDepsOverride = options.practiceValidationDeps;
    }
    return service;
  }

  private practiceValidationDeps(): PracticeReferenceValidationDeps {
    return (
      this.practiceValidationDepsOverride ??
      createWorkerPracticeReferenceValidationDeps(this.executionWrapper)
    );
  }

  async importCourse(text: string, options: ImportCourseOptions): Promise<ImportCourseResult> {
    const parsed = parseImportCourseText(text);
    if (!parsed.ok) {
      return parsed;
    }

    let course = parsed.course;

    if (options.validatePracticeSteps === true) {
      const practiceIssues = await validatePracticeReferences(
        course,
        this.practiceValidationDeps(),
      );
      if (practiceIssues.length > 0) {
        return { ok: false, stage: 'practice', issues: practiceIssues };
      }
    }

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

  async importModule(text: string, options: ImportModuleOptions): Promise<ImportModuleResult> {
    const parsed = parseImportModuleText(text);
    if (!parsed.ok) {
      return parsed;
    }

    const existing = await this.courses.get(options.courseId);
    if (existing === undefined) {
      return { ok: false, stage: 'target', courseId: options.courseId };
    }

    const module = parsed.module;
    const appendIssues = validateAppendModuleToCourse(existing, module);
    if (appendIssues.length > 0) {
      return { ok: false, stage: 'semantic', issues: appendIssues };
    }

    if (options.validatePracticeSteps === true) {
      const practiceCourse = courseWithAppendedModule(existing, module);
      const moduleIndex = practiceCourse.modules.length - 1;
      const practiceIssues = await validatePracticeReferences(
        {
          ...practiceCourse,
          modules: [practiceCourse.modules[moduleIndex]!],
        },
        this.practiceValidationDeps(),
      );
      if (practiceIssues.length > 0) {
        const remapped = practiceIssues.map((issue) => ({
          ...issue,
          path: remapSingleModuleIssuePath(issue.path),
        }));
        return { ok: false, stage: 'practice', issues: remapped };
      }
    }

    const updated = courseWithAppendedModule(existing, module);
    await this.courses.put(updated);

    return {
      ok: true,
      courseId: options.courseId,
      moduleId: module.moduleId,
      action: 'appended',
    };
  }
}
