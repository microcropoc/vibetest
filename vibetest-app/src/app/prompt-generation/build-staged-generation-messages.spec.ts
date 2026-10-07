import { describe, expect, it } from 'vitest';

import { outlineWithModules } from '../course-generation/__fixtures__/outline-fixtures';

import {
  buildCourseGenerationPrompt,
  finalUserReminder,
  INSTRUCTION_SQLITE_PRACTICE,
} from './build-course-generation-prompt';
import {
  OUTLINE_MODULE_EXAMPLE,
  OUTLINE_SELF_CHECK,
  RETRY_NOTE_MAX_ISSUES,
  buildFirstModuleCourseMessages,
  buildModuleMessages,
  buildOutlineMessages,
  formatOutlineForPrompt,
  joinStagedMessages,
  retryNote,
} from './build-staged-generation-messages';

const SCHEMA = '{\n  "schemaVersion": 1\n}';
const OUTLINE = outlineWithModules('Основы', 'Квантификаторы', 'Группы');

describe('buildOutlineMessages', () => {
  it('puts plan rules and outline schema in system, description and reminder in user', () => {
    const messages = buildOutlineMessages('Курс про regex', SCHEMA);

    expect(messages.system).toContain('course-outline.schema.json');
    expect(messages.system).toContain('theory, svg и quiz');
    expect(messages.system).toContain('3–8 модулей и 4–10 шагов');
    expect(messages.system).toContain(SCHEMA);
    expect(messages.system).not.toContain('Курс про regex');
    expect(messages.user).toContain('Курс про regex');
    expect(messages.user.endsWith(finalUserReminder('плана курса', false))).toBe(true);
  });

  it('shows a module example in system and a self-check before the reminder in user', () => {
    const messages = buildOutlineMessages('Курс про regex', SCHEMA, {
      retryIssues: [{ path: 'modules', message: 'Required' }],
    });

    expect(messages.system).toContain(OUTLINE_MODULE_EXAMPLE);
    expect(messages.system).toContain('{"type": "svg", "title": "…", "summary": "…"}');
    const checkAt = messages.user.indexOf(OUTLINE_SELF_CHECK);
    const retryAt = messages.user.indexOf('Предыдущий ответ отклонён');
    const reminderAt = messages.user.indexOf(finalUserReminder('плана курса', false));
    expect(checkAt).toBeGreaterThan(messages.user.indexOf('Курс про regex'));
    expect(checkAt).toBeLessThan(retryAt);
    expect(retryAt).toBeLessThan(reminderAt);
    expect(messages.user).not.toContain('шагов не меньше');
  });

  it('asks for raw JSON without a fence when structured output is on', () => {
    const messages = buildOutlineMessages('Курс', SCHEMA, { structuredOutput: true });

    expect(messages.system).not.toContain('Первая строка ответа');
    expect(messages.system).toContain('без fenced-блока');
    expect(messages.user.endsWith(finalUserReminder('плана курса', true))).toBe(true);
  });
});

describe('buildFirstModuleCourseMessages', () => {
  it('requests a course with only the first outline module', () => {
    const messages = buildFirstModuleCourseMessages('Курс про regex', OUTLINE, SCHEMA);

    expect(messages.system).toContain('course-import.schema.json');
    expect(messages.system).toContain('ровно один модуль');
    expect(messages.user).toContain('Курс про regex');
    expect(messages.user).toContain(formatOutlineForPrompt(OUTLINE));
    expect(messages.user).toContain('модуль 1 из 3: «Основы»');
    expect(messages.user).toContain('[svg] Основы: схема');
    expect(messages.user.endsWith(finalUserReminder('import-DTO', false))).toBe(true);
  });
});

describe('buildModuleMessages', () => {
  it('names the module number and title and passes the whole outline', () => {
    const messages = buildModuleMessages(OUTLINE, 1, SCHEMA);

    expect(messages.system).toContain('module-import.schema.json');
    expect(messages.system).toContain(SCHEMA);
    expect(messages.user).toContain('Сгенерируй модуль 2 из 3: «Квантификаторы»');
    expect(messages.user).toContain('«Группы»');
    expect(messages.user).toContain('[quiz] Квантификаторы: тест');
    expect(messages.user.endsWith(finalUserReminder('module-import DTO', false))).toBe(true);
  });

  it('carries the SQL practice rules into course and module generation, not the outline', () => {
    expect(buildModuleMessages(OUTLINE, 1, SCHEMA).system).toContain(INSTRUCTION_SQLITE_PRACTICE);
    expect(buildFirstModuleCourseMessages('Курс', OUTLINE, SCHEMA).system).toContain(
      INSTRUCTION_SQLITE_PRACTICE,
    );
    expect(buildOutlineMessages('Курс', SCHEMA).system).not.toContain(INSTRUCTION_SQLITE_PRACTICE);
    expect(buildCourseGenerationPrompt('Курс', SCHEMA)).toContain(INSTRUCTION_SQLITE_PRACTICE);
    expect(INSTRUCTION_SQLITE_PRACTICE).toContain('checkQuery');
    expect(INSTRUCTION_SQLITE_PRACTICE).toContain('params');
  });

  it('adds retry issues before the final reminder', () => {
    const messages = buildModuleMessages(OUTLINE, 2, SCHEMA, {
      retryIssues: [{ path: 'steps.0.title', message: 'Required' }],
    });

    const retryAt = messages.user.indexOf('Предыдущий ответ отклонён');
    const reminderAt = messages.user.indexOf(finalUserReminder('module-import DTO', false));
    expect(retryAt).toBeGreaterThan(0);
    expect(retryAt).toBeLessThan(reminderAt);
    expect(messages.user).toContain('- steps.0.title: Required');
  });
});

describe('joinStagedMessages', () => {
  it('puts system first and ends with the user reminder', () => {
    const messages = buildOutlineMessages('Курс про regex', SCHEMA);
    const text = joinStagedMessages(messages);

    expect(text.startsWith(messages.system)).toBe(true);
    expect(text.endsWith(messages.user)).toBe(true);
    expect(text.endsWith(finalUserReminder('плана курса', false))).toBe(true);
  });
});

describe('retryNote', () => {
  it(`lists at most ${RETRY_NOTE_MAX_ISSUES} issues and counts the rest`, () => {
    const issues = Array.from({ length: 13 }, (_, index) => ({
      path: `p${index}`,
      message: 'bad',
    }));
    const note = retryNote(issues);

    expect(note).toContain('- p9: bad');
    expect(note).not.toContain('- p10: bad');
    expect(note).toContain('… и ещё 3');
  });
});
