import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { JavascriptContentWithTargetSchema } from './javascript-content-target';

function loadImportSchema(): Record<string, unknown> {
  const path = join(process.cwd(), '..', 'docs', 'schemas', 'course-import.schema.json');
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

const jsContentWithoutTarget = {
  description: 'd',
  starterCode: '',
  referenceSolution: 'function x() {}',
  setup: '',
  timeoutMs: 1000,
  tests: [{ args: [] }],
};

describe('course-import.schema.json javascriptContent', () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  it('Zod rejects javascript content without functionName or construct', () => {
    expect(JavascriptContentWithTargetSchema.safeParse(jsContentWithoutTarget).success).toBe(false);
  });

  it('AJV on javascriptContent $def rejects invalid functionName pattern', () => {
    const root = loadImportSchema();
    const defs = root['$defs'] as Record<string, unknown>;
    const validate = ajv.compile({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      ...(defs['javascriptContent'] as object),
    });
    const invalid = { ...jsContentWithoutTarget, functionName: 'bad-name' };
    expect(validate(invalid)).toBe(false);
  });
});
