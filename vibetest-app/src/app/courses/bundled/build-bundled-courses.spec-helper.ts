import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { Course } from '../course.model';
import type { ImportCourse } from '../import-course-zod-schema';
import {
  formatImportParseIssues,
  parseImportCourseDtoText,
  parseImportCourseText,
} from '../import-parse';
import { parseCourse } from '../parse-course';

import type { BundledCourseEntry } from './generated-bundled-courses';

export type BundledCourseBuildResult = {
  readonly entry: BundledCourseEntry;
  readonly course: Course;
};

const BUNDLED_CREATED_AT = '2020-01-01T00:00:00.000Z';

function normalizeEol(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/** SHA-256 hex of canonical import DTO JSON — identity of bundled course content. */
export function contentHashFromImportDto(dto: ImportCourse): string {
  return createHash('sha256').update(JSON.stringify(dto), 'utf8').digest('hex');
}

/** Deterministic UUID v4 (lowercase) from seed string. */
export function uuidFromHash(seed: string): string {
  const hash = createHash('sha256').update(seed, 'utf8').digest();
  const bytes = Uint8Array.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function buildBundledCourseFromImportText(
  text: string,
  fileName: string,
): BundledCourseBuildResult {
  const normalized = normalizeEol(text);
  const dtoResult = parseImportCourseDtoText(normalized);
  if (!dtoResult.ok) {
    throw new Error(formatImportParseIssues(fileName, dtoResult.stage, dtoResult.issues));
  }
  const contentHash = contentHashFromImportDto(dtoResult.dto);
  let seq = 0;
  const parsed = parseImportCourseText(normalized, {
    randomUuid: () => uuidFromHash(`${contentHash}:${seq++}`),
    now: () => new Date(BUNDLED_CREATED_AT),
  });
  if (!parsed.ok) {
    throw new Error(formatImportParseIssues(fileName, parsed.stage, parsed.issues));
  }
  parseCourse(parsed.course);
  return {
    entry: {
      courseId: parsed.course.courseId,
      file: fileName,
      title: parsed.course.title,
    },
    course: parsed.course,
  };
}

export function listDocsCourseJsonPaths(coursesRoot: string): readonly string[] {
  return readdirSync(coursesRoot)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => join(coursesRoot, name));
}

export function buildAllBundledCoursesFromDocs(coursesRoot: string): readonly BundledCourseBuildResult[] {
  return listDocsCourseJsonPaths(coursesRoot).map((path) => {
    const fileName = path.split(/[/\\]/).pop() ?? 'course.json';
    const text = readFileSync(path, 'utf8');
    return buildBundledCourseFromImportText(text, fileName);
  });
}
