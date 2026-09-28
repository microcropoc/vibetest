import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCourseFromSources,
  listCourseSourceSlugs,
} from '../src/app/courses/build-course-from-sources.spec-helper.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const coursesRoot = join(repoRoot, 'docs', 'courses');

for (const slug of listCourseSourceSlugs(coursesRoot)) {
  const json = buildCourseFromSources({ coursesRoot, slug });
  const outPath = join(coursesRoot, `${slug}.json`);
  writeFileSync(outPath, json, 'utf8');
  const moduleCount = (JSON.parse(json) as { modules: unknown[] }).modules.length;
  console.log(`Wrote ${outPath} (${moduleCount} modules)`);
}
