import { TestBed } from '@angular/core/testing';

import { CourseImportService } from '../courses/course-import.service';
import {
  minimalValidImportJson,
  minimalValidImportModuleJson,
} from '../courses/__fixtures__/course-fixtures';
import type { LlmProfile } from '../settings/llm-profile.model';
import { CourseRepository } from '../storage/course-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import { outlineWithModules } from './__fixtures__/outline-fixtures';
import { LmStudioClient } from './lm-studio-client.service';
import type { ChatCompletionMessage, ChatCompletionResult } from './openai-chat-completions';
import {
  INITIAL_STAGED_GENERATION_STATE,
  StagedCourseGenerator,
  type GenerationStep,
  type StagedGenerationInput,
} from './staged-course-generator.service';

const PROFILE: LlmProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: 'Local',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: 'k',
  model: 'm',
  structuredOutput: false,
};

const OUTLINE = outlineWithModules('Основы', 'Квантификаторы', 'Группы');

const INPUT: StagedGenerationInput = {
  profile: PROFILE,
  description: 'Курс про regex',
  schemas: {
    outline: { text: '{"outline":true}', record: { title: 'outline' } },
    courseImport: { text: '{"course":true}', record: { title: 'course' } },
    moduleImport: { text: '{"module":true}', record: { title: 'module' } },
  },
};

function success(value: unknown): ChatCompletionResult {
  return { kind: 'success', content: JSON.stringify(value) };
}

function moduleJson(title: string): Record<string, unknown> {
  return { ...minimalValidImportModuleJson(), title };
}

const BAD_MODULE = { schemaVersion: 1, title: 'Без шагов', steps: [] };

function userMessage(call: readonly unknown[] | undefined): string {
  const messages = call?.[1] as readonly ChatCompletionMessage[] | undefined;
  return messages?.find((message) => message.role === 'user')?.content ?? '';
}

describe('StagedCourseGenerator', () => {
  let db: VibetestDb;
  let complete: ReturnType<typeof vi.fn>;
  let generator: StagedCourseGenerator;

  beforeEach(() => {
    db = createTestVibetestDb();
    complete = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: LmStudioClient, useValue: { complete } },
        { provide: CourseImportService, useValue: CourseImportService.forDb(db) },
      ],
    });
    generator = TestBed.inject(StagedCourseGenerator);
  });

  afterEach(async () => {
    await destroyTestVibetestDb(db);
  });

  it('generates outline, course with the first module, then the remaining modules in order', async () => {
    complete
      .mockResolvedValueOnce(success(OUTLINE))
      .mockResolvedValueOnce(success(minimalValidImportJson()))
      .mockResolvedValueOnce(success(moduleJson('Квантификаторы')))
      .mockResolvedValueOnce(success(moduleJson('Группы')));
    const states: number[] = [];

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT, {
      callbacks: { onStateChange: (state) => states.push(state.nextModuleIndex) },
    });

    expect(result.outcome).toEqual({ kind: 'done' });
    expect(result.state.outline).toEqual(OUTLINE);
    expect(result.state.nextModuleIndex).toBe(3);
    expect(states).toEqual([0, 1, 2, 3]);
    expect(userMessage(complete.mock.calls[2])).toContain('модуль 2 из 3: «Квантификаторы»');
    expect(userMessage(complete.mock.calls[3])).toContain('модуль 3 из 3: «Группы»');

    const course = await CourseRepository.forDb(db).get(result.state.courseId!);
    expect(course?.modules.map((module) => module.title)).toEqual([
      'Module 1',
      'Квантификаторы',
      'Группы',
    ]);
  });

  it('accepts an outline without svg and quiz steps on the first attempt', async () => {
    const theoryOnly = {
      ...outlineWithModules('Основы'),
      modules: [
        {
          ...outlineWithModules('Основы').modules[0]!,
          steps: [{ type: 'theory', title: 'Только теория', summary: 'Без svg и quiz' }],
        },
      ],
    };
    complete
      .mockResolvedValueOnce(success(theoryOnly))
      .mockResolvedValueOnce(success(minimalValidImportJson()));
    const attempts: [GenerationStep, number][] = [];

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT, {
      callbacks: { onAttempt: (step, attempt) => attempts.push([step, attempt]) },
    });

    expect(result.outcome).toEqual({ kind: 'done' });
    expect(result.state.outline).toEqual(theoryOnly);
    expect(attempts.filter(([step]) => step.kind === 'outline')).toEqual([[{ kind: 'outline' }, 1]]);
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it('retries an invalid module with the previous issues and reports attempts', async () => {
    complete
      .mockResolvedValueOnce(success(OUTLINE))
      .mockResolvedValueOnce(success(minimalValidImportJson()))
      .mockResolvedValueOnce(success(BAD_MODULE))
      .mockResolvedValueOnce(success(moduleJson('Квантификаторы')))
      .mockResolvedValueOnce(success(moduleJson('Группы')));
    const attempts: [GenerationStep, number][] = [];

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT, {
      callbacks: { onAttempt: (step, attempt) => attempts.push([step, attempt]) },
    });

    expect(result.outcome).toEqual({ kind: 'done' });
    expect(attempts).toContainEqual([{ kind: 'module', index: 1 }, 2]);
    expect(userMessage(complete.mock.calls[2])).not.toContain('Предыдущий ответ отклонён');
    expect(userMessage(complete.mock.calls[3])).toContain('Предыдущий ответ отклонён');
    expect(userMessage(complete.mock.calls[3])).toContain('steps');
  });

  it('retries stage 2 when the course has more than one module', async () => {
    const twoModules = {
      ...minimalValidImportJson(),
      modules: [
        ...(minimalValidImportJson()['modules'] as unknown[]),
        ...(minimalValidImportJson()['modules'] as unknown[]),
      ],
    };
    complete
      .mockResolvedValueOnce(success(outlineWithModules('Основы')))
      .mockResolvedValueOnce(success(twoModules))
      .mockResolvedValueOnce(success(minimalValidImportJson()));

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT);

    expect(result.outcome).toEqual({ kind: 'done' });
    expect(userMessage(complete.mock.calls[2])).toContain('Нужен ровно один модуль');
  });

  it('stops after max attempts and resumes from the failed module', async () => {
    complete
      .mockResolvedValueOnce(success(OUTLINE))
      .mockResolvedValueOnce(success(minimalValidImportJson()))
      .mockResolvedValueOnce(success(BAD_MODULE))
      .mockResolvedValueOnce(success(BAD_MODULE))
      .mockResolvedValueOnce(success(BAD_MODULE));

    const failed = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT);

    expect(failed.outcome.kind).toBe('exhausted');
    expect(failed.outcome.kind === 'exhausted' && failed.outcome.step).toEqual({
      kind: 'module',
      index: 1,
    });
    expect(failed.state.nextModuleIndex).toBe(1);
    expect(failed.state.courseId).not.toBeNull();

    complete.mockReset();
    complete
      .mockResolvedValueOnce(success(moduleJson('Квантификаторы')))
      .mockResolvedValueOnce(success(moduleJson('Группы')));

    const resumed = await generator.run(failed.state, INPUT);

    expect(resumed.outcome).toEqual({ kind: 'done' });
    expect(complete).toHaveBeenCalledTimes(2);
    const course = await CourseRepository.forDb(db).get(failed.state.courseId!);
    expect(course?.modules).toHaveLength(3);
  });

  it('does not retry an API failure', async () => {
    complete.mockResolvedValue({ kind: 'failure', message: 'Model not loaded' });

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT);

    expect(result.outcome).toEqual({
      kind: 'fatal',
      step: { kind: 'outline' },
      failure: { kind: 'fatal', message: 'Model not loaded' },
    });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('retries a truncated answer asking the model to be more compact', async () => {
    complete
      .mockResolvedValueOnce({
        kind: 'failure',
        message: 'Уменьшите курс или увеличьте лимит токенов.',
        retryReason: 'truncated',
      })
      .mockResolvedValueOnce(success(outlineWithModules('Основы')))
      .mockResolvedValueOnce(success(minimalValidImportJson()));

    const result = await generator.run(INITIAL_STAGED_GENERATION_STATE, INPUT);

    expect(result.outcome).toEqual({ kind: 'done' });
    expect(complete).toHaveBeenCalledTimes(3);
    expect(userMessage(complete.mock.calls[1])).toContain('Пиши компактнее');
    expect(userMessage(complete.mock.calls[1])).not.toContain('увеличьте лимит токенов');
  });

  it('sends the stage schema only when structured output is enabled', async () => {
    complete
      .mockResolvedValueOnce(success(outlineWithModules('Основы')))
      .mockResolvedValueOnce(success(minimalValidImportJson()));

    await generator.run(INITIAL_STAGED_GENERATION_STATE, {
      ...INPUT,
      profile: { ...PROFILE, structuredOutput: true },
    });

    expect(complete.mock.calls[0]?.[2]).toEqual(
      expect.objectContaining({ importSchema: { title: 'outline' } }),
    );
    expect(complete.mock.calls[1]?.[2]).toEqual(
      expect.objectContaining({ importSchema: { title: 'course' } }),
    );
  });
});
