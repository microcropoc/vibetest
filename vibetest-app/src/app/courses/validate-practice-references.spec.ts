import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseImportCourseText } from './import-parse';
import type { Course } from './course.model';
import { createInProcessPracticeReferenceValidationDeps } from './practice-reference-in-process-runners.spec-helper';
import { validatePracticeReferences } from './validate-practice-references';

const practiceCheckRoot = join(process.cwd(), 'src', 'app', 'courses', '__fixtures__', 'practice-check');

/** Sample courses mirrored into practice-check/pass — keep byte-identical with docs/courses/. */
const MIRRORED_SAMPLE_COURSES: ReadonlyArray<readonly [string, string]> = [
  [
    join(process.cwd(), '..', 'docs', 'courses', 'algorithms-start.json'),
    join(practiceCheckRoot, 'pass', 'algorithms-start.json'),
  ],
];

function listJsonFixtures(kind: 'pass' | 'fail'): ReadonlyArray<readonly [string, string]> {
  const dir = join(practiceCheckRoot, kind);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => [join(kind, name).replace(/\\/g, '/'), join(dir, name)] as const);
}

function courseFromFixturePath(path: string): Course {
  const parsed = parseImportCourseText(readFileSync(path, 'utf8'));
  if (!parsed.ok) {
    throw new Error(`Fixture ${path} failed parse: ${parsed.stage}`);
  }
  return parsed.course;
}

describe('validatePracticeReferences', () => {
  const deps = createInProcessPracticeReferenceValidationDeps();

  it.each(MIRRORED_SAMPLE_COURSES)(
    'keeps mirrored sample course in sync: %s',
    (docsPath, fixturePath) => {
      expect(readFileSync(fixturePath, 'utf8')).toBe(readFileSync(docsPath, 'utf8'));
    },
  );

  it('skips theory and quiz steps', async () => {
    const parsed = parseImportCourseText(JSON.stringify({
      schemaVersion: 1,
      title: 'T',
      description: 'D',
      modules: [{
        title: 'M',
        steps: [
          { type: 'theory', title: 'T', content: 'x' },
          {
            type: 'quiz',
            title: 'Q',
            content: {
              question: 'Q?',
              options: ['a', 'b'],
              correctIndices: [0],
            },
          },
        ],
      }],
    }));
    if (!parsed.ok) {
      throw new Error(`parse failed: ${parsed.stage}`);
    }
    const issues = await validatePracticeReferences(parsed.course, deps);
    expect(issues).toEqual([]);
  });

  it.each(listJsonFixtures('pass'))('passes fixture %s', async (_label, path) => {
    const issues = await validatePracticeReferences(courseFromFixturePath(path), deps);
    expect(issues).toEqual([]);
  }, 60_000);

  it.each(listJsonFixtures('fail'))('reports failure for fixture %s', async (label, path) => {
    const issues = await validatePracticeReferences(courseFromFixturePath(path), deps);
    expect(issues.length, `expected issues for ${label}`).toBeGreaterThan(0);
  }, 60_000);

  it('collects multiple step failures without stopping early', async () => {
    const parsed = parseImportCourseText(JSON.stringify({
      schemaVersion: 1,
      title: 'Multi fail',
      description: 'D',
      modules: [{
        title: 'M',
        steps: [
          {
            type: 'javascript',
            title: 'A',
            content: {
              description: 'd',
              starterCode: 'const a = () => 0;',
              referenceSolution: 'const a = () => { throw new Error("a"); };',
              setup: '',
              functionName: 'a',
              timeoutMs: 2000,
              tests: [{ args: [] }],
            },
          },
          {
            type: 'javascript',
            title: 'B',
            content: {
              description: 'd',
              starterCode: 'const b = () => 0;',
              referenceSolution: 'const b = () => { throw new Error("b"); };',
              setup: '',
              functionName: 'b',
              timeoutMs: 2000,
              tests: [{ args: [] }],
            },
          },
        ],
      }],
    }));
    if (!parsed.ok) {
      throw new Error('parse failed');
    }
    const issues = await validatePracticeReferences(parsed.course, deps);
    expect(issues).toHaveLength(2);
    expect(issues.map((i) => i.path)).toEqual(['modules[0].steps[0]', 'modules[0].steps[1]']);
  }, 30_000);
});
