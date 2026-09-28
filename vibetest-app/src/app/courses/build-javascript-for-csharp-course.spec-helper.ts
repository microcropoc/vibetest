import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parseImportCourseText } from './import-parse';
import { parseImportModuleText } from './import-module-parse';

export type JavascriptForCsharpCoursePaths = {
  readonly coursesRoot: string;
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
  if (typeof title !== 'string' || title.length < 1 || title.length > 120) {
    throw new Error(`${fileName}: title must be a string of length 1–120`);
  }
  const description = record['description'];
  if (typeof description !== 'string' || description.length < 1 || description.length > 2000) {
    throw new Error(`${fileName}: description must be a string of length 1–2000`);
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

/** Assemble the flagship course JSON (LF, trailing newline) without writing a file. */
export function buildJavascriptForCsharpCourse(paths: JavascriptForCsharpCoursePaths): string {
  const sourceDir = join(paths.coursesRoot, 'javascript-for-csharp');
  const headerPath = join(sourceDir, 'course.json');
  const header = assertCourseHeader(JSON.parse(readFileSync(headerPath, 'utf8')), 'course.json');

  const moduleFiles = readdirSync(sourceDir)
    .filter((name) => /^\d{2}-.+\.module\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (moduleFiles.length === 0) {
    throw new Error('No module files found in javascript-for-csharp/');
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
  const courseParsed = parseImportCourseText(json);
  if (!courseParsed.ok) {
    throw new Error(formatParseIssues('javascript-for-csharp.json', courseParsed.stage, courseParsed.issues));
  }
  return json;
}
