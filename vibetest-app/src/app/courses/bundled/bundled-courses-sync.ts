import { BundledCoursesSeenRepository } from '../../storage/bundled-courses-seen-repository';
import { CourseRepository } from '../../storage/course-repository';
import { parseCourse } from '../parse-course';

import { bundledCourseFileUrl } from './bundled-course-file-url';
import type { BundledCourseEntry } from './generated-bundled-courses';

export type BundledCoursesFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type BundledCoursesSyncDeps = {
  readonly courses: CourseRepository;
  readonly seen: BundledCoursesSeenRepository;
  readonly manifest: readonly BundledCourseEntry[];
  readonly fetchFn: BundledCoursesFetch;
};

export type BundledCoursesRestoreResult = {
  readonly added: number;
  readonly failed: readonly string[];
};

export async function syncBundledCoursesOnStartup(deps: BundledCoursesSyncDeps): Promise<void> {
  const seen = new Set(await deps.seen.get());
  const pending = deps.manifest.filter((entry) => !seen.has(entry.courseId));
  const { installed } = await installBundledEntries(deps, pending);
  await deps.seen.add(installed.map((entry) => entry.courseId));
}

export async function restoreMissingBundledCourses(
  deps: BundledCoursesSyncDeps,
): Promise<BundledCoursesRestoreResult> {
  const existing = new Set((await deps.courses.list()).map((c) => c.courseId));
  const missing = deps.manifest.filter((entry) => !existing.has(entry.courseId));
  const { installed, failed } = await installBundledEntries(deps, missing);
  await deps.seen.add(installed.map((entry) => entry.courseId));
  return { added: installed.length, failed: failed.map((entry) => entry.title) };
}

/** Entries are fetched in parallel, so total wait is bounded by one fetch timeout. */
async function installBundledEntries(
  deps: BundledCoursesSyncDeps,
  entries: readonly BundledCourseEntry[],
): Promise<{
  readonly installed: readonly BundledCourseEntry[];
  readonly failed: readonly BundledCourseEntry[];
}> {
  const results = await Promise.all(entries.map((entry) => tryInstallBundledEntry(deps, entry)));
  return {
    installed: entries.filter((_, i) => results[i]),
    failed: entries.filter((_, i) => !results[i]),
  };
}

async function tryInstallBundledEntry(
  deps: BundledCoursesSyncDeps,
  entry: BundledCourseEntry,
): Promise<boolean> {
  try {
    const response = await deps.fetchFn(bundledCourseFileUrl(entry.file));
    if (!response.ok) {
      console.error(`Bundled course fetch failed (${entry.file}): ${response.status}`);
      return false;
    }
    const json: unknown = await response.json();
    const course = parseCourse(json);
    if (course.courseId !== entry.courseId) {
      console.error(`Bundled course ID mismatch for ${entry.file}`);
      return false;
    }
    const existing = await deps.courses.get(course.courseId);
    if (existing !== undefined) {
      return true;
    }
    await deps.courses.put({
      ...course,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error: unknown) {
    console.error(`Bundled course install failed (${entry.file})`, error);
    return false;
  }
}
