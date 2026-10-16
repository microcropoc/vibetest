import { describe, expect, it } from 'vitest';

import {
  buildCourseGenerationPrompt,
  INSTRUCTION_PRACTICE_RELEVANCE,
  INSTRUCTION_REGEX_PRACTICE,
  INSTRUCTION_SQLITE_PRACTICE,
} from './build-course-generation-prompt';

describe('buildCourseGenerationPrompt', () => {
  const schemaSnippet = '{\n  "schemaVersion": 1\n}';

  it('includes author description, Russian rules, per-module step types, and schema', () => {
    const prompt = buildCourseGenerationPrompt('Курс про HTML', schemaSnippet);

    expect(prompt).toContain('description');
    expect(prompt).toContain('основной источник');
    expect(prompt).toContain('Не выдумывай');
    expect(prompt).toContain('при конфликте');
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
    expect(prompt).not.toContain('обёртка markdown вокруг всего ответа');
  });

  it('requires ```json fenced output and Markdown in step text fields', () => {
    const prompt = buildCourseGenerationPrompt('Тест', schemaSnippet);

    expect(prompt).toContain('Формат вывода');
    expect(prompt).toContain('```json');
    expect(prompt).toContain('Markdown в текстовых полях');
    expect(prompt).toContain('content.description');
    expect(prompt).toContain('content.question');
    expect(prompt).toContain('content.options[]');
    expect(prompt).toContain('content.caption');
    expect(prompt).toContain('inline code');
    expect(prompt).toContain('отдельный уровень');
    expect(prompt).toContain('сырой HTML');
    expect(prompt).toContain('Regex-паттерны');
  });

  it('requires $js tags for non-JSON values in javascript args', () => {
    const prompt = buildCourseGenerationPrompt('Тест', schemaSnippet);
    expect(prompt).toContain('"$js"');
    expect(prompt).toContain('resultMode: "args"');
  });

  it('uses placeholder when description is empty', () => {
    const prompt = buildCourseGenerationPrompt('   ', schemaSnippet);

    expect(prompt).toContain('описание не указано');
    expect(prompt).toContain(schemaSnippet);
  });

  it('includes practice relevance rules and conditional practice engine instructions', () => {
    const prompt = buildCourseGenerationPrompt('Курс про историю', schemaSnippet);

    expect(prompt).toContain(INSTRUCTION_PRACTICE_RELEVANCE);
    expect(prompt).toContain('строго по теме запроса');
    expect(prompt).toContain('Не используй javascript для других языков');
    expect(prompt).toContain(INSTRUCTION_SQLITE_PRACTICE);
    expect(prompt).toContain(INSTRUCTION_REGEX_PRACTICE);
    expect(INSTRUCTION_SQLITE_PRACTICE).toContain('ТОЛЬКО если в курсе или плане модуля есть шаги sqlite');
    expect(INSTRUCTION_REGEX_PRACTICE).toContain('ТОЛЬКО если в курсе или плане модуля есть шаги regex');
  });
});
