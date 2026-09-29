import { describe, expect, it } from 'vitest';

import {
  buildCourseGenerationMessages,
  buildCourseGenerationPrompt,
  FINAL_USER_REMINDER,
  FINAL_USER_REMINDER_STRUCTURED,
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
});

describe('buildCourseGenerationMessages', () => {
  const schemaSnippet = '{\n  "schemaVersion": 1\n}';

  it('puts rules and schema in system and description plus reminder in user', () => {
    const messages = buildCourseGenerationMessages('Курс про SQL', schemaSnippet);

    expect(messages.system).toContain('import-DTO');
    expect(messages.system).toContain(schemaSnippet);
    expect(messages.system).not.toContain('Курс про SQL');
    expect(messages.user).toContain('Курс про SQL');
    expect(messages.user.endsWith(FINAL_USER_REMINDER)).toBe(true);
  });

  it('matches legacy single-string prompt content order', () => {
    const legacy = buildCourseGenerationPrompt('Курс', schemaSnippet);
    const messages = buildCourseGenerationMessages('Курс', schemaSnippet);
    expect(`${messages.system}\n\n${messages.user}`).not.toEqual(legacy);
    expect(legacy).toContain(messages.system.split('\n\nJSON Schema')[0]);
  });

  it('asks for raw JSON without a fence when structured output is on', () => {
    const messages = buildCourseGenerationMessages('Курс', schemaSnippet, {
      structuredOutput: true,
    });

    expect(messages.system).not.toContain('Первая строка ответа');
    expect(messages.system).not.toContain('единственного ```json-блока');
    expect(messages.system).not.toContain('в том же формате (```json');
    expect(messages.system).toContain('без fenced-блока');
    expect(messages.system).toContain('"$js"');
    expect(messages.system).toContain(schemaSnippet);
    expect(messages.user.endsWith(FINAL_USER_REMINDER_STRUCTURED)).toBe(true);
  });
});
