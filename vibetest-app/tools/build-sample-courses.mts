import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildJavascriptForCsharpCourse } from '../src/app/courses/build-javascript-for-csharp-course.spec-helper.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const coursesRoot = join(repoRoot, 'docs', 'courses');
const json = buildJavascriptForCsharpCourse({ coursesRoot });
const outPath = join(coursesRoot, 'javascript-for-csharp.json');
writeFileSync(outPath, json, 'utf8');
const moduleCount = (JSON.parse(json) as { modules: unknown[] }).modules.length;
console.log(`Wrote ${outPath} (${moduleCount} modules)`);
