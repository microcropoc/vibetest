import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { CourseSchema } from './course-zod-schema';

function loadJsonSchema(): Record<string, unknown> {
  const path = join(process.cwd(), '..', 'docs', 'schemas', 'course.schema.json');
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function zodAccepts(value: unknown): boolean {
  return CourseSchema.safeParse(value).success;
}

describe('Zod vs JSON Schema (Ajv 2020-12)', () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(loadJsonSchema());

  const matrix: { label: string; value: Record<string, unknown> }[] = [
    { label: 'valid minimal', value: minimalValidCourseJson() },
    {
      label: 'invalid schemaVersion',
      value: { ...minimalValidCourseJson(), schemaVersion: 0 },
    },
    {
      label: 'theory step wrong content shape',
      value: (() => {
        const v = minimalValidCourseJson();
        const modules = v['modules'] as Record<string, unknown>[];
        const steps = modules[0]['steps'] as Record<string, unknown>[];
        steps[0] = { ...steps[0], content: { bad: true } };
        return v;
      })(),
    },
    {
      label: 'javascript step missing args',
      value: (() => {
        const v = minimalValidCourseJson();
        const modules = v['modules'] as Record<string, unknown>[];
        const steps = modules[0]['steps'] as Record<string, unknown>[];
        steps.push({
          stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          type: 'javascript',
          title: 'JS',
          content: {
            description: 'd',
            starterCode: '',
            referenceSolution: 'return 1',
            setup: '',
            functionName: 'fn',
            timeoutMs: 1000,
            tests: [{}],
          },
        });
        return v;
      })(),
    },
  ];

  it.each(matrix)('$label — same pass/fail as Ajv', ({ value }) => {
    const ajvOk = validate(value) === true;
    const zodOk = zodAccepts(value);
    expect(zodOk).toBe(ajvOk);
  });
});
