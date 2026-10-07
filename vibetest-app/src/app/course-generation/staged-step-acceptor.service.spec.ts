import { TestBed } from '@angular/core/testing';

import { CourseImportService } from '../courses/course-import.service';
import {
  minimalValidImportJson,
  minimalValidImportModuleJson,
} from '../courses/__fixtures__/course-fixtures';
import { CourseRepository } from '../storage/course-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import { extractModelJson, StagedStepAcceptor } from './staged-step-acceptor.service';

const MISSING_COURSE_ID = '11111111-1111-4111-8111-111111111111';

describe('extractModelJson', () => {
  it('unwraps a ```json fence', () => {
    const raw = 'Вот курс:\n```json\n{"a":1}\n```';
    expect(extractModelJson(raw, null)).toEqual({ kind: 'text', text: '{"a":1}', rawResponse: raw });
  });

  it('reports a missing JSON without the Context Length hint for external chats', () => {
    const result = extractModelJson('Не знаю', null);
    expect(result).toEqual({
      kind: 'invalid',
      stage: 'json',
      issues: [{ path: 'json', message: 'Ответ не содержит JSON для импорта.' }],
      rawResponse: 'Не знаю',
    });
  });

  it('adds the Context Length hint by default', () => {
    const result = extractModelJson('Не знаю');
    expect(result.kind === 'invalid' && result.issues[0]?.message).toContain('Context Length');
  });
});

describe('StagedStepAcceptor', () => {
  let db: VibetestDb;
  let acceptor: StagedStepAcceptor;

  beforeEach(() => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      providers: [{ provide: CourseImportService, useValue: CourseImportService.forDb(db) }],
    });
    acceptor = TestBed.inject(StagedStepAcceptor);
  });

  afterEach(async () => {
    await destroyTestVibetestDb(db);
  });

  it('saves a course with exactly one module', async () => {
    const text = JSON.stringify(minimalValidImportJson());
    const result = await acceptor.acceptFirstModule(text, text);

    expect(result.kind).toBe('ok');
    const courseId = result.kind === 'ok' ? result.value : '';
    const course = await CourseRepository.forDb(db).get(courseId);
    expect(course?.modules).toHaveLength(1);
  });

  it('rejects a course with two modules without saving it', async () => {
    const dto = minimalValidImportJson();
    const modules: unknown = dto['modules'];
    const first = Array.isArray(modules) ? modules[0] : undefined;
    const text = JSON.stringify({ ...dto, modules: [first, first] });
    const result = await acceptor.acceptFirstModule(text, text);

    expect(result).toEqual({
      kind: 'invalid',
      stage: 'semantic',
      issues: [{ path: 'modules', message: 'Нужен ровно один модуль (первый из плана), получено 2.' }],
      rawResponse: text,
    });
    expect(await CourseRepository.forDb(db).list()).toEqual([]);
  });

  it('reports schema problems of a course as invalid', async () => {
    const text = JSON.stringify({ schemaVersion: 1, title: 'Курс' });
    const result = await acceptor.acceptFirstModule(text, text);
    expect(result.kind).toBe('invalid');
  });

  it('appends a module to the course', async () => {
    const courseText = JSON.stringify(minimalValidImportJson());
    const course = await acceptor.acceptFirstModule(courseText, courseText);
    const courseId = course.kind === 'ok' ? course.value : '';
    const moduleText = JSON.stringify({ ...minimalValidImportModuleJson(), title: 'Второй' });

    const result = await acceptor.acceptModule(moduleText, courseId, moduleText);

    expect(result.kind).toBe('ok');
    const stored = await CourseRepository.forDb(db).get(courseId);
    expect(stored?.modules.map((module) => module.title)).toEqual(['Module 1', 'Второй']);
  });

  it('treats a missing course as fatal', async () => {
    const moduleText = JSON.stringify(minimalValidImportModuleJson());
    const result = await acceptor.acceptModule(moduleText, MISSING_COURSE_ID, moduleText);
    expect(result).toEqual({
      kind: 'fatal',
      message: 'Курс не найден — возможно, он удалён. Начните генерацию заново.',
      rawResponse: moduleText,
    });
  });
});
