import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { minimalValidImportJson } from '../__fixtures__/course-fixtures';
import { ImportCourseSchema } from '../import-course-zod-schema';

import {
  buildAllBundledCoursesFromDocs,
  buildBundledCourseFromImportText,
  contentHashFromImportDto,
  listDocsCourseJsonPaths,
} from './build-bundled-courses.spec-helper';
import { BUNDLED_COURSES } from './generated-bundled-courses';

const docsCoursesDir = join(process.cwd(), '..', 'docs', 'courses');

describe('build bundled courses', () => {
  it('produces stable courseId for the same import text', () => {
    const text = `${JSON.stringify(minimalValidImportJson(), null, 2)}\n`;
    const a = buildBundledCourseFromImportText(text, 'test.json');
    const b = buildBundledCourseFromImportText(text, 'test.json');
    expect(a.entry.courseId).toBe(b.entry.courseId);
    expect(a.course.modules[0]?.moduleId).toBe(b.course.modules[0]?.moduleId);
  });

  it('changes courseId when import content changes', () => {
    const base = `${JSON.stringify(minimalValidImportJson(), null, 2)}\n`;
    const changed = `${JSON.stringify({ ...minimalValidImportJson(), title: 'Other title' }, null, 2)}\n`;
    expect(buildBundledCourseFromImportText(base, 'a.json').entry.courseId).not.toBe(
      buildBundledCourseFromImportText(changed, 'b.json').entry.courseId,
    );
  });

  it('content hash ignores JSON formatting when DTO is unchanged', () => {
    const parsed = ImportCourseSchema.parse(minimalValidImportJson());
    const compact = ImportCourseSchema.parse(JSON.parse(JSON.stringify(parsed)));
    const pretty = ImportCourseSchema.parse(JSON.parse(JSON.stringify(parsed, null, 2)));
    expect(contentHashFromImportDto(parsed)).toBe(contentHashFromImportDto(compact));
    expect(contentHashFromImportDto(pretty)).toBe(contentHashFromImportDto(compact));
  });

  it('committed manifest matches docs/courses build', () => {
    const built = buildAllBundledCoursesFromDocs(docsCoursesDir).map((r) => r.entry);
    expect(built).toEqual([...BUNDLED_COURSES]);
  });

  it('each docs course bundled output parses as Course', () => {
    for (const path of listDocsCourseJsonPaths(docsCoursesDir)) {
      const fileName = path.split(/[/\\]/).pop() ?? 'course.json';
      const text = readFileSync(path, 'utf8');
      const { course } = buildBundledCourseFromImportText(text, fileName);
      expect(course.modules.length).toBeGreaterThan(0);
    }
  });
});
