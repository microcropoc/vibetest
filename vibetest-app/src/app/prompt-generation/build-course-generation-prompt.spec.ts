import { describe, expect, it } from 'vitest';

import { buildCourseGenerationPrompt } from './build-course-generation-prompt';

describe('buildCourseGenerationPrompt', () => {
  const schemaSnippet = '{\n  "schemaVersion": 1\n}';

  it('includes author description, Russian rules, per-module step types, and schema', () => {
    const prompt = buildCourseGenerationPrompt('Курс про HTML', schemaSnippet);

    expect(prompt).toContain('Курс про HTML');
    expect(prompt).toContain('русском языке');
    expect(prompt).toContain('theory');
    expect(prompt).toContain('svg');
    expect(prompt).toContain('quiz');
    expect(prompt).toContain('в каждом модуле');
    expect(prompt).toContain('import-DTO');
    expect(prompt).toContain('courseId');
    expect(prompt).toContain(schemaSnippet);
  });

  it('includes JSON escaping, parse, schema check, and forbidden syntax rules', () => {
    const prompt = buildCourseGenerationPrompt('Тест', schemaSnippet);

    expect(prompt).toContain('экранируй');
    expect(prompt).toContain('\\n');
    expect(prompt).toContain('starterCode');
    expect(prompt).toContain('JSON.parse');
    expect(prompt).toContain('JSON Schema');
    expect(prompt).toContain('trailing commas');
    expect(prompt).toMatch(/markdown|обратных кавычек/i);
  });

  it('uses placeholder when description is empty', () => {
    const prompt = buildCourseGenerationPrompt('   ', schemaSnippet);

    expect(prompt).toContain('описание не указано');
    expect(prompt).toContain(schemaSnippet);
  });
});
