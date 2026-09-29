import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import type { LlmProfile } from '../../../settings/llm-profile.model';
import { SettingsRepository } from '../../../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../../storage/test-db-harness';
import type { VibetestDb } from '../../../storage/vibetest-db';
import { LmStudioClient } from '../../lm-studio-client.service';
import type { ChatCompletionResult } from '../../openai-chat-completions';

import { CourseGenerationPage } from './course-generation-page';

const SAVED_PROFILE: LlmProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: 'Local',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: 'k',
  model: 'm',
};

type Fixture = ComponentFixture<CourseGenerationPage>;

function root(fixture: Fixture): HTMLElement {
  return fixture.nativeElement as HTMLElement;
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
    const text = root(fixture).textContent ?? '';
    if (text.includes('Загрузка схемы')) {
      return false;
    }
    return expectSavedProfile
      ? (root(fixture).querySelector('select')?.options.length ?? 0) > 0
      : root(fixture).querySelector('.llm-profile-fields__input') !== null;
  });
  return fixture;
}

async function typeDescription(fixture: Fixture, text: string): Promise<void> {
  const textarea = root(fixture).querySelector(
    '.course-generation-page__description',
  ) as HTMLTextAreaElement;
  textarea.value = text;
  textarea.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

function generateButton(fixture: Fixture): HTMLButtonElement {
  return root(fixture).querySelector('.course-generation-page__generate') as HTMLButtonElement;
}

describe('CourseGenerationPage', () => {
  let db: VibetestDb;
  let completeUserPrompt: ReturnType<typeof vi.fn>;
  let importCourseWithNewIds: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    db = createTestVibetestDb();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ schemaVersion: 1, title: 'Schema' }),
      }),
    );

    completeUserPrompt = vi.fn();
    importCourseWithNewIds = vi.fn();

    await TestBed.configureTestingModule({
      imports: [CourseGenerationPage],
      providers: [
        provideRouter([]),
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        { provide: LmStudioClient, useValue: { completeUserPrompt } },
        { provide: CourseImportService, useValue: { importCourseWithNewIds } },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await destroyTestVibetestDb(db);
  });

  it('disables generation until a description is entered', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    const fixture = await createReadyPage(true);

    expect(generateButton(fixture).disabled).toBe(true);
    await typeDescription(fixture, 'Курс про CSS');
    expect(generateButton(fixture).disabled).toBe(false);
  });

  it('imports course and shows link on successful generation', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    completeUserPrompt.mockResolvedValue({
      kind: 'success',
      content: '```json\n{"schemaVersion":1}\n```',
    });
    importCourseWithNewIds.mockResolvedValue({
      ok: true,
      courseId: '11111111-1111-4111-8111-111111111111',
      action: 'created',
    });

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс про CSS');
    generateButton(fixture).click();
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('Курс импортирован'));

    expect(completeUserPrompt).toHaveBeenCalledWith(
      SAVED_PROFILE,
      expect.stringContaining('Курс про CSS'),
      expect.any(AbortSignal),
    );
    expect(importCourseWithNewIds).toHaveBeenCalledWith('{"schemaVersion":1}', {
      validatePracticeSteps: false,
    });
    expect(root(fixture).querySelector('a.course-generation-page__link')).toBeTruthy();
  });

  it('shows validation issues and raw response when import fails', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    completeUserPrompt.mockResolvedValue({ kind: 'success', content: '{"schemaVersion":2}' });
    importCourseWithNewIds.mockResolvedValue({
      ok: false,
      stage: 'zod',
      issues: [{ path: 'schemaVersion', message: 'bad' }],
    });

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    generateButton(fixture).click();
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('schemaVersion: bad'));

    expect(root(fixture).textContent).toContain('Ответ модели');
    expect(root(fixture).textContent).not.toContain('Курс импортирован');
  });

  it('saves a new profile once and reuses it on the next generation', async () => {
    completeUserPrompt.mockResolvedValue({ kind: 'failure', message: 'Model not loaded' });
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
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('Model not loaded'));
    generateButton(fixture).click();
    await waitFor(fixture, () => completeUserPrompt.mock.calls.length === 2);
    await waitFor(fixture, () => !generateButton(fixture).disabled);

    const stored = await SettingsRepository.forDb(db).getLlmProfiles();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.label).toBe('LM Studio');
    expect(completeUserPrompt.mock.calls[1]?.[0]).toEqual(stored[0]);
    expect(root(fixture).querySelector('select')?.value).toBe(stored[0]?.id);
  });

  it('selects the newly saved profile when other profiles already exist', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    completeUserPrompt.mockResolvedValue({ kind: 'failure', message: 'Model not loaded' });
    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');

    const newModeRadio = root(fixture).querySelector('input[value="new"]') as HTMLInputElement;
    newModeRadio.checked = true;
    newModeRadio.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const inputs = root(fixture).querySelectorAll(
      '.llm-profile-fields__input',
    ) as NodeListOf<HTMLInputElement>;
    for (const [index, value] of ['Remote', 'http://remote:1234/v1', 'key', 'model-2'].entries()) {
      inputs[index]!.value = value;
      inputs[index]!.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    generateButton(fixture).click();
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('Model not loaded'));

    const stored = await SettingsRepository.forDb(db).getLlmProfiles();
    const select = root(fixture).querySelector('select') as HTMLSelectElement;
    expect(stored).toHaveLength(2);
    expect(select.value).toBe(stored[1]?.id);
    expect(select.selectedOptions[0]?.textContent).toContain('Remote');
  });

  it('cancels a running request without importing', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    completeUserPrompt.mockImplementation(
      (_profile: LlmProfile, _prompt: string, signal: AbortSignal) =>
        new Promise<ChatCompletionResult>((resolve) => {
          signal.addEventListener('abort', () =>
            resolve({ kind: 'failure', message: 'Запрос отменён.' }),
          );
        }),
    );

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    generateButton(fixture).click();
    await waitFor(fixture, () => root(fixture).querySelector('.course-generation-page__cancel') !== null);

    (root(fixture).querySelector('.course-generation-page__cancel') as HTMLButtonElement).click();
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('Запрос отменён.'));

    expect(importCourseWithNewIds).not.toHaveBeenCalled();
  });

  it('aborts the request when the page is destroyed', async () => {
    await SettingsRepository.forDb(db).setLlmProfiles([SAVED_PROFILE]);
    let capturedSignal: AbortSignal | undefined;
    completeUserPrompt.mockImplementation(
      (_profile: LlmProfile, _prompt: string, signal: AbortSignal) => {
        capturedSignal = signal;
        return new Promise<ChatCompletionResult>(() => undefined);
      },
    );

    const fixture = await createReadyPage(true);
    await typeDescription(fixture, 'Курс');
    generateButton(fixture).click();
    await waitFor(fixture, () => capturedSignal !== undefined);

    fixture.destroy();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
