import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { LlmProfile } from '../../../settings/llm-profile.model';
import { SettingsRepository } from '../../../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../../storage/test-db-harness';
import type { VibetestDb } from '../../../storage/vibetest-db';
import { outlineWithModules } from '../../__fixtures__/outline-fixtures';
import {
  INITIAL_STAGED_GENERATION_STATE,
  StagedCourseGenerator,
  type StagedGenerationInput,
  type StagedGenerationResult,
  type StagedGenerationRunOptions,
  type StagedGenerationState,
} from '../../staged-course-generator.service';

import { CourseGenerationPage } from './course-generation-page';

const SAVED_PROFILE: LlmProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: 'Local',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: 'k',
  model: 'm',
  structuredOutput: false,
};

const COURSE_ID = '11111111-1111-4111-8111-111111111111';
const OUTLINE = outlineWithModules('Основы', 'Квантификаторы');

type Fixture = ComponentFixture<CourseGenerationPage>;
type RunFn = (
  state: StagedGenerationState,
  input: StagedGenerationInput,
  options?: StagedGenerationRunOptions,
) => Promise<StagedGenerationResult>;

function root(fixture: Fixture): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function text(fixture: Fixture): string {
  return root(fixture).textContent ?? '';
}

async function waitFor(fixture: Fixture, predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await fixture.whenStable();
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('Condition was not met');
}

async function createReadyPage(expectSavedProfile: boolean): Promise<Fixture> {
  const fixture = TestBed.createComponent(CourseGenerationPage);
  await waitFor(fixture, () => {
    if (text(fixture).includes('Загрузка схемы')) {
      return false;
    }
    return expectSavedProfile
      ? (root(fixture).querySelector('select')?.options.length ?? 0) > 0
      : root(fixture).querySelector('.llm-profile-fields__input') !== null;
  });
  return fixture;
}

async function typeDescription(fixture: Fixture, value: string): Promise<void> {
  const textarea = root(fixture).querySelector(
    '.course-generation-page__description',
  ) as HTMLTextAreaElement;
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

function generateButton(fixture: Fixture): HTMLButtonElement {
  return root(fixture).querySelector('.course-generation-page__generate') as HTMLButtonElement;
}

function resumeButton(fixture: Fixture): HTMLButtonElement | null {
  return root(fixture).querySelector('.course-generation-page__resume');
}

const DONE_STATE: StagedGenerationState = {
  outline: OUTLINE,
  courseId: COURSE_ID,
  nextModuleIndex: 2,
};

const FAILED_STATE: StagedGenerationState = {
  outline: OUTLINE,
  courseId: COURSE_ID,
  nextModuleIndex: 1,
};

const EXHAUSTED: StagedGenerationResult = {
  state: FAILED_STATE,
  outcome: {
    kind: 'exhausted',
    step: { kind: 'module', index: 1 },
    last: {
      kind: 'invalid',
      stage: 'zod',
      issues: [{ path: 'steps', message: 'Too small' }],
      rawResponse: '{"steps":[]}',
    },
  },
};

describe('CourseGenerationPage', () => {
  let db: VibetestDb;
  let run: ReturnType<typeof vi.fn<RunFn>>;

  beforeEach(async () => {
    db = createTestVibetestDb();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ schemaVersion: 1, title: 'Schema' }),
      }),
    );
    run = vi.fn<RunFn>();

    await TestBed.configureTestingModule({
      imports: [CourseGenerationPage],
      providers: [
        provideRouter([]),
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        { provide: StagedCourseGenerator, useValue: { run } },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await destroyTestVibetestDb(db);
  });

  it('shows the estimated prompt size before generation', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    expect(text(fixture)).toContain('Самый большой промт этапа ≈');
    expect(text(fixture)).toContain('Context Length');
  });

  it('disables generation until a description is entered', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    const fixture = await createReadyPage(true);

    expect(generateButton(fixture).disabled).toBe(true);
    await typeDescription(fixture, 'Курс про CSS');
    expect(generateButton(fixture).disabled).toBe(false);
  });

  it('runs from the initial state with the profile, description and three schemas', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    run.mockResolvedValue({ state: DONE_STATE, outcome: { kind: 'done' } });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс про regex');

    generateButton(fixture).click();
    await waitFor(fixture, () => text(fixture).includes('Курс сгенерирован'));

    const [state, input, options] = run.mock.calls[0]!;
    expect(state).toEqual(INITIAL_STAGED_GENERATION_STATE);
    expect(input.profile).toEqual(SAVED_PROFILE);
    expect(input.description).toBe('Курс про regex');
    expect(input.schemas.outline.record).toEqual({ schemaVersion: 1, title: 'Schema' });
    expect(input.schemas.moduleImport.text).toContain('"title": "Schema"');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(root(fixture).querySelector('a.course-generation-page__link')).toBeTruthy();
  });

  it('shows stages, attempts, the outline and the course link while generating', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    let finish: (result: StagedGenerationResult) => void = () => undefined;
    run.mockImplementation(async (_state, _input, options) => {
      options?.callbacks?.onStateChange?.({ outline: OUTLINE, courseId: null, nextModuleIndex: 0 });
      options?.callbacks?.onStateChange?.({
        outline: OUTLINE,
        courseId: COURSE_ID,
        nextModuleIndex: 1,
      });
      options?.callbacks?.onAttempt?.({ kind: 'module', index: 1 }, 2, 3);
      return new Promise<StagedGenerationResult>((resolve) => {
        finish = resolve;
      });
    });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    generateButton(fixture).click();
    await waitFor(fixture, () => text(fixture).includes('попытка 2 из 3'));

    expect(text(fixture)).toContain('Модуль 2 из 2: «Квантификаторы»');
    expect(text(fixture)).toContain('План курса: «Регулярные выражения»');
    expect(text(fixture)).toContain('модули добавляются по мере генерации');
    expect(root(fixture).querySelector('a.course-generation-page__link')).toBeTruthy();

    finish({ state: DONE_STATE, outcome: { kind: 'done' } });
    await waitFor(fixture, () => text(fixture).includes('Курс сгенерирован'));
  });

  it('locks the description and profile while generating and keeps the progress', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    let finish: (result: StagedGenerationResult) => void = () => undefined;
    run.mockImplementation(async (_state, _input, options) => {
      options?.callbacks?.onStateChange?.({ outline: OUTLINE, courseId: null, nextModuleIndex: 0 });
      return new Promise<StagedGenerationResult>((resolve) => {
        finish = resolve;
      });
    });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    generateButton(fixture).click();
    await waitFor(fixture, () => text(fixture).includes('План курса: «Регулярные выражения»'));

    const form = root(fixture).querySelector('.course-generation-page__form') as HTMLFieldSetElement;
    expect(form.disabled).toBe(true);
    await typeDescription(fixture, 'Другой курс');
    expect(text(fixture)).toContain('План курса: «Регулярные выражения»');

    finish({ state: DONE_STATE, outcome: { kind: 'done' } });
    await waitFor(fixture, () => text(fixture).includes('Курс сгенерирован'));
    expect(form.disabled).toBe(false);
  });

  it('shows issues after exhausted attempts and resumes from the saved state', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    run
      .mockResolvedValueOnce(EXHAUSTED)
      .mockResolvedValueOnce({ state: DONE_STATE, outcome: { kind: 'done' } });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    generateButton(fixture).click();
    await waitFor(fixture, () => resumeButton(fixture) !== null);

    expect(text(fixture)).toContain('не прошёл проверку после всех попыток');
    expect(text(fixture)).toContain('steps: Too small');
    expect(text(fixture)).toContain('Ответ модели (последняя попытка)');
    expect(generateButton(fixture).textContent).toContain('Начать заново');

    resumeButton(fixture)!.click();
    await waitFor(fixture, () => text(fixture).includes('Курс сгенерирован'));
    expect(run.mock.calls[1]?.[0]).toEqual(FAILED_STATE);
  });

  it('starts over from the initial state', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    run.mockResolvedValueOnce(EXHAUSTED).mockResolvedValueOnce(EXHAUSTED);
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    generateButton(fixture).click();
    await waitFor(fixture, () => resumeButton(fixture) !== null);
    generateButton(fixture).click();
    await waitFor(fixture, () => run.mock.calls.length === 2);

    expect(run.mock.calls[1]?.[0]).toEqual(INITIAL_STAGED_GENERATION_STATE);
  });

  it('shows a fatal API error and offers to continue', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    run.mockResolvedValue({
      state: INITIAL_STAGED_GENERATION_STATE,
      outcome: {
        kind: 'fatal',
        step: { kind: 'outline' },
        failure: { kind: 'fatal', message: 'Model not loaded' },
      },
    });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    generateButton(fixture).click();
    await waitFor(fixture, () => text(fixture).includes('Model not loaded'));
    expect(resumeButton(fixture)).not.toBeNull();
    expect(text(fixture)).toContain('ошибка');
  });

  it('saves a new profile once and reuses it on the next generation', async () => {
    run.mockResolvedValue({
      state: INITIAL_STAGED_GENERATION_STATE,
      outcome: {
        kind: 'fatal',
        step: { kind: 'outline' },
        failure: { kind: 'fatal', message: 'Model not loaded' },
      },
    });
    const fixture = await createReadyPage(false);
    await typeDescription(fixture, 'Курс');

    const inputs = root(fixture).querySelectorAll(
      '.llm-profile-fields__input',
    ) as NodeListOf<HTMLInputElement>;
    for (const [index, value] of ['LM Studio', 'http://localhost:1234/v1', 'key', 'model-1'].entries()) {
      inputs[index]!.value = value;
      inputs[index]!.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    generateButton(fixture).click();
    await waitFor(fixture, () => text(fixture).includes('Model not loaded'));
    generateButton(fixture).click();
    await waitFor(fixture, () => run.mock.calls.length === 2);
    await waitFor(fixture, () => !generateButton(fixture).disabled);

    const stored = await SettingsRepository.forDb(db).getLlmProfiles();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.label).toBe('LM Studio');
    expect(run.mock.calls[1]?.[1].profile).toEqual(stored[0]);
    expect(root(fixture).querySelector('select')?.value).toBe(stored[0]?.id);
  });

  it('cancels a running generation and offers to continue', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    run.mockImplementation(
      (state, _input, options) =>
        new Promise<StagedGenerationResult>((resolve) => {
          options?.signal?.addEventListener('abort', () =>
            resolve({
              state,
              outcome: {
                kind: 'fatal',
                step: { kind: 'outline' },
                failure: { kind: 'fatal', message: 'Запрос отменён.', cancelled: true },
              },
            }),
          );
        }),
    );

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    generateButton(fixture).click();
    await waitFor(fixture, () => root(fixture).querySelector('.course-generation-page__cancel') !== null);

    (root(fixture).querySelector('.course-generation-page__cancel') as HTMLButtonElement).click();
    await waitFor(fixture, () => text(fixture).includes('Запрос отменён.'));
    expect(resumeButton(fixture)).not.toBeNull();
  });

  it('aborts the generation when the page is destroyed', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    let capturedSignal: AbortSignal | undefined;
    run.mockImplementation((_state, _input, options) => {
      capturedSignal = options?.signal;
      return new Promise<StagedGenerationResult>(() => undefined);
    });

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    generateButton(fixture).click();
    await waitFor(fixture, () => capturedSignal !== undefined);

    fixture.destroy();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
