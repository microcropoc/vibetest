import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildJavascriptForCsharpCourse } from './build-javascript-for-csharp-course.spec-helper';
import type { Course, Step } from './course.model';
import { parseImportCourseText } from './import-parse';
import {
  createInProcessPracticeReferenceValidationDeps,
  runJavascriptReferenceSelfCheck,
  runRegexReferenceSelfCheck,
} from './practice-reference-in-process-runners.spec-helper';
import { validatePracticeReferences } from './validate-practice-references';

const docsCoursesDir = join(process.cwd(), '..', 'docs', 'courses');
const flagshipCoursePath = join(docsCoursesDir, 'javascript-for-csharp.json');

function normalizeEol(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function listTopLevelCourseJsonPaths(): readonly string[] {
  return readdirSync(docsCoursesDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => join(docsCoursesDir, name));
}

function courseFromPath(path: string): Course {
  const parsed = parseImportCourseText(readFileSync(path, 'utf8'));
  if (!parsed.ok) {
    throw new Error(`${path} failed parse at ${parsed.stage}`);
  }
  return parsed.course;
}

function collectSvgIds(course: Course): readonly string[] {
  const ids: string[] = [];
  for (const mod of course.modules) {
    for (const step of mod.steps) {
      if (step.type !== 'svg') {
        continue;
      }
      const svg = step.content.svg;
      const re = /\bid="([^"]+)"/g;
      let match = re.exec(svg);
      while (match !== null) {
        ids.push(match[1]);
        match = re.exec(svg);
      }
    }
  }
  return ids;
}

function assertModuleShape(steps: readonly Step[]): void {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0]?.type).toBe('theory');
  expect(steps.some((s) => s.type === 'svg')).toBe(true);
  expect(steps.some((s) => s.type === 'javascript')).toBe(true);
  expect(steps.at(-1)?.type).toBe('quiz');
}

describe('docs/courses sample courses', () => {
  const deps = createInProcessPracticeReferenceValidationDeps();
  const coursePaths = listTopLevelCourseJsonPaths();

  it('assembled javascript-for-csharp.json matches in-memory build', () => {
    const onDisk = normalizeEol(readFileSync(flagshipCoursePath, 'utf8'));
    const built = buildJavascriptForCsharpCourse({ coursesRoot: docsCoursesDir });
    expect(onDisk).toBe(built);
  });

  it.each(coursePaths.map((p) => [p.replace(/\\/g, '/'), p] as const))(
    'parses %s',
    (_label, path) => {
      expect(courseFromPath(path).modules.length).toBeGreaterThan(0);
    },
  );

  it.each(coursePaths.map((p) => [p.replace(/\\/g, '/'), p] as const))(
    'reference solutions pass for %s',
    async (_label, path) => {
      const issues = await validatePracticeReferences(courseFromPath(path), deps);
      expect(issues).toEqual([]);
    },
    120_000,
  );

  it.each(coursePaths.map((p) => [p.replace(/\\/g, '/'), p] as const))(
    'starter code fails at least one test in %s',
    async (_label, path) => {
      const course = courseFromPath(path);
      for (const mod of course.modules) {
        for (const step of mod.steps) {
          const label = `${mod.title} / ${step.title}`;
          if (step.type === 'javascript') {
            const result = await runJavascriptReferenceSelfCheck(step, step.content.starterCode);
            expect(result.ok, label).toBe(false);
          }
          if (step.type === 'regex') {
            const result = await runRegexReferenceSelfCheck(step, step.content.starterCode);
            expect(result.ok, label).toBe(false);
          }
        }
      }
    },
    120_000,
  );

  it('javascript-for-csharp module and SVG invariants', () => {
    const course = courseFromPath(flagshipCoursePath);
    for (const mod of course.modules) {
      assertModuleShape(mod.steps);
      for (const step of mod.steps) {
        if (step.type !== 'svg') {
          continue;
        }
        expect(step.content.svg, `${mod.title} / ${step.title}`).toContain('viewBox=');
        expect(step.content.svg, `${mod.title} / ${step.title}`).toContain('role="img"');
        expect(step.content.svg, `${mod.title} / ${step.title}`).toContain('aria-label=');
      }
    }
    const ids = collectSvgIds(course);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
