import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parseImportCourseText } from './import-parse';
import { parseImportModuleText } from './import-module-parse';

export type BuildCourseFromSourcesPaths = {
  readonly coursesRoot: string;
  readonly slug: string;
};

function assertCourseHeader(
  value: unknown,
  fileName: string,
): { readonly schemaVersion: 1; readonly title: string; readonly description: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${fileName}: expected an object`);
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key !== 'schemaVersion' && key !== 'title' && key !== 'description') {
      throw new Error(`${fileName}: unexpected property "${key}"`);
    }
  }
  if (record['schemaVersion'] !== 1) {
    throw new Error(`${fileName}: schemaVersion must be 1`);
  }
  const title = record['title'];
  if (typeof title !== 'string') {
    throw new Error(`${fileName}: title must be a string`);
  }
  const description = record['description'];
  if (typeof description !== 'string') {
    throw new Error(`${fileName}: description must be a string`);
  }
  return { schemaVersion: 1, title, description };
}

function formatParseIssues(
  fileName: string,
  stage: string,
  issues: readonly { readonly path: string; readonly message: string }[],
): string {
  const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
  return `${fileName}: ${stage}: ${detail}`;
}

/** Directories under coursesRoot that contain course.json (assembled course sources). */
export function listCourseSourceSlugs(coursesRoot: string): readonly string[] {
  return readdirSync(coursesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(coursesRoot, name, 'course.json')))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Assemble course JSON (LF, trailing newline) without writing a file. */
export function buildCourseFromSources(paths: BuildCourseFromSourcesPaths): string {
  const sourceDir = join(paths.coursesRoot, paths.slug);
  const headerPath = join(sourceDir, 'course.json');
  const header = assertCourseHeader(JSON.parse(readFileSync(headerPath, 'utf8')), 'course.json');

  const moduleFiles = readdirSync(sourceDir)
    .filter((name) => /^\d{2}-.+\.module\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (moduleFiles.length === 0) {
    throw new Error(`No module files found in ${paths.slug}/`);
  }

  const modules = moduleFiles.map((fileName) => {
    const text = readFileSync(join(sourceDir, fileName), 'utf8');
    const parsed = parseImportModuleText(text);
    if (!parsed.ok) {
      throw new Error(formatParseIssues(fileName, parsed.stage, parsed.issues));
    }
    const raw = JSON.parse(text) as { title: string; steps: unknown[] };
    return { title: raw.title, steps: raw.steps };
  });

  const course = {
    schemaVersion: header.schemaVersion,
    title: header.title,
    description: header.description,
    modules,
  };
  const json = `${JSON.stringify(course, null, 2)}\n`;
  const outLabel = `${paths.slug}.json`;
  const courseParsed = parseImportCourseText(json);
  if (!courseParsed.ok) {
    throw new Error(formatParseIssues(outLabel, courseParsed.stage, courseParsed.issues));
  }
  return json;
}
