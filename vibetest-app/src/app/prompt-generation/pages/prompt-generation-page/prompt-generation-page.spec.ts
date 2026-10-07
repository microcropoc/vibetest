import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { outlineWithModules } from '../../../course-generation/__fixtures__/outline-fixtures';
import { CourseImportService } from '../../../courses/course-import.service';
import {
  minimalValidImportJson,
  minimalValidImportModuleJson,
} from '../../../courses/__fixtures__/course-fixtures';
import { CourseRepository } from '../../../storage/course-repository';
import { SettingsRepository } from '../../../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../../storage/test-db-harness';
import type { VibetestDb } from '../../../storage/vibetest-db';
import { buildCourseGenerationPrompt } from '../../build-course-generation-prompt';
import {
  buildFirstModuleCourseMessages,
  buildModuleMessages,
  buildOutlineMessages,
  joinStagedMessages,
} from '../../build-staged-generation-messages';

import { PromptGenerationPage } from './prompt-generation-page';

const SCHEMA_NAMES = ['course-import', 'module-import', 'course-outline'] as const;
type SchemaName = (typeof SCHEMA_NAMES)[number];

function schemaText(name: SchemaName): string {
  return `{\n  "schemaVersion": 1,\n  "title": "${name}"\n}`;
}

const COURSE_IMPORT_SCHEMA = schemaText('course-import');
const MODULE_IMPORT_SCHEMA = schemaText('module-import');
const COURSE_OUTLINE_SCHEMA = schemaText('course-outline');
const OUTLINE = outlineWithModules('Основы', 'Квантификаторы', 'Группы');

async function whenPageReady(fixture: ComponentFixture<PromptGenerationPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('PromptGenerationPage did not finish loading');
}

function root(fixture: ComponentFixture<PromptGenerationPage>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

async function typeInto(
  fixture: ComponentFixture<PromptGenerationPage>,
  selector: string,
  value: string,
): Promise<void> {
  const textarea = root(fixture).querySelector(selector) as HTMLTextAreaElement;
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

async function switchToStaged(fixture: ComponentFixture<PromptGenerationPage>): Promise<void> {
  const radio = root(fixture).querySelector('input[value="staged"]') as HTMLInputElement;
  radio.click();
  await fixture.whenStable();
}

function stageButton(
  fixture: ComponentFixture<PromptGenerationPage>,
  stage: string,
): HTMLButtonElement | null {
  return root(fixture).querySelector(`button[data-stage="${stage}"]`);
}

function stagePanel(fixture: ComponentFixture<PromptGenerationPage>): HTMLElement | null {
  return root(fixture).querySelector('app-manual-stage-panel');
}

function panelTitle(fixture: ComponentFixture<PromptGenerationPage>): string {
  return root(fixture).querySelector('.manual-stage-panel__title')?.textContent?.trim() ?? '';
}

async function waitFor(
  fixture: ComponentFixture<PromptGenerationPage>,
  predicate: () => boolean | Promise<boolean>,
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await fixture.whenStable();
    if (await predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('Condition was not met');
}

async function copyStagePrompt(fixture: ComponentFixture<PromptGenerationPage>): Promise<void> {
  (root(fixture).querySelector('.manual-stage-panel__copy') as HTMLButtonElement).click();
  await fixture.whenStable();
}

/** Pastes an answer into the current stage panel and waits until the check finishes. */
async function submitStageAnswer(
  fixture: ComponentFixture<PromptGenerationPage>,
  answer: string,
): Promise<void> {
  await typeInto(fixture, '.manual-stage-panel__answer', answer);
  (root(fixture).querySelector('.manual-stage-panel__accept') as HTMLButtonElement).click();
  await waitFor(
    fixture,
    () => root(fixture).querySelector('.manual-stage-panel__accept')?.textContent?.trim() !== 'Проверка…',
  );
}

async function preparePlan(fixture: ComponentFixture<PromptGenerationPage>): Promise<void> {
  await whenPageReady(fixture);
  await switchToStaged(fixture);
  await typeInto(fixture, '.prompt-generation-page__description', 'Курс про regex');
  await typeInto(fixture, '.prompt-generation-page__outline-response', JSON.stringify(OUTLINE));
}

const COURSE_ANSWER = `Готово:\n\`\`\`json\n${JSON.stringify(minimalValidImportJson())}\n\`\`\``;

function moduleAnswer(title: string): string {
  return JSON.stringify({ ...minimalValidImportModuleJson(), title });
}

describe('PromptGenerationPage', () => {
  let db: VibetestDb;
  let settingsRepo: SettingsRepository;
  let fetchMock: ReturnType<typeof vi.fn>;
  let writeTextMock: ReturnType<typeof vi.fn>;
  let failingSchemas: readonly SchemaName[];

  beforeEach(async () => {
    db = createTestVibetestDb();
    settingsRepo = SettingsRepository.forDb(db);
    failingSchemas = [];
    fetchMock = vi.fn().mockImplementation((url: string) => {
      const name = SCHEMA_NAMES.find((candidate) => url.includes(candidate))!;
      return Promise.resolve(
        failingSchemas.includes(name)
          ? { ok: false, status: 500 }
          : { ok: true, json: async () => ({ schemaVersion: 1, title: name }) },
      );
    });
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });

    await TestBed.configureTestingModule({
      imports: [PromptGenerationPage],
      providers: [
        provideRouter([]),
        { provide: SettingsRepository, useValue: settingsRepo },
        { provide: CourseImportService, useValue: CourseImportService.forDb(db) },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await destroyTestVibetestDb(db);
  });

  it('does not store single-mode description without a staged plan', async () => {
    const settings = SettingsRepository.forDb(db);
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await typeInto(fixture, '.prompt-generation-page__description', 'Курс про CSS');
    await waitFor(fixture, async () => (await settings.getManualStagedProgress()) === undefined);

    expect(await settings.getManualStagedProgress()).toBeUndefined();
  });

  it('copies built prompt with description and bundled schema', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);

    await typeInto(fixture, '.prompt-generation-page__description', 'Курс про CSS');

    const copyBtn = root(fixture).querySelector(
      '.prompt-generation-page__copy',
    ) as HTMLButtonElement;
    copyBtn.click();
    await fixture.whenStable();

    expect(writeTextMock).toHaveBeenCalledWith(
      buildCourseGenerationPrompt('Курс про CSS', COURSE_IMPORT_SCHEMA),
    );
    expect(root(fixture).textContent).toContain('Скопировано');
    expect(stageButton(fixture, 'outline')).toBeNull();
  });

  it('shows error when course import schema cannot be loaded', async () => {
    failingSchemas = ['course-import'];

    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);

    expect(root(fixture).textContent).toContain('Не удалось загрузить course-import.schema.json');
  });

  it('keeps the single prompt when staged schemas fail and explains staged mode', async () => {
    failingSchemas = ['course-outline'];

    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);

    (root(fixture).querySelector('.prompt-generation-page__copy') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(writeTextMock).toHaveBeenCalledWith(buildCourseGenerationPrompt('', COURSE_IMPORT_SCHEMA));

    await switchToStaged(fixture);
    expect(root(fixture).textContent).toContain(
      'Поэтапный режим недоступен: не удалось загрузить course-outline.schema.json.',
    );
    expect(stageButton(fixture, 'outline')).toBeNull();
  });

  it('copies the outline prompt as system then user text in staged mode', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await switchToStaged(fixture);

    expect(stageButton(fixture, 'outline')!.disabled).toBe(true);

    await typeInto(fixture, '.prompt-generation-page__description', 'Курс про regex');
    stageButton(fixture, 'outline')!.click();
    await fixture.whenStable();

    const expected = joinStagedMessages(
      buildOutlineMessages('Курс про regex', COURSE_OUTLINE_SCHEMA),
    );
    expect(writeTextMock).toHaveBeenCalledWith(expected);
    expect(expected).toContain('"title": "course-outline"');
    expect(root(fixture).textContent).toContain('Скопировано');
  });

  it('reports an answer without JSON without the LM Studio hint', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await switchToStaged(fixture);

    await typeInto(fixture, '.prompt-generation-page__outline-response', 'Не могу помочь');

    const issues = root(fixture).querySelector('.prompt-generation-page__issues')!.textContent ?? '';
    expect(issues).toContain('Ответ не содержит JSON для импорта.');
    expect(issues).not.toContain('LM Studio');
  });

  it('lists outline issues and no module prompts for an invalid answer', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await switchToStaged(fixture);

    await typeInto(
      fixture,
      '.prompt-generation-page__outline-response',
      JSON.stringify({ ...OUTLINE, modules: [] }),
    );

    expect(root(fixture).textContent).toContain('План не прошёл проверку');
    expect(root(fixture).querySelector('.prompt-generation-page__issues')?.textContent).toContain(
      'modules',
    );
    expect(stagePanel(fixture)).toBeNull();
  });

  it('accepts an outline with missing step types and shows warnings', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await switchToStaged(fixture);

    const theoryOnly = {
      ...OUTLINE,
      modules: [{ ...OUTLINE.modules[0]!, steps: OUTLINE.modules[0]!.steps.slice(0, 1) }],
    };
    await typeInto(
      fixture,
      '.prompt-generation-page__outline-response',
      JSON.stringify(theoryOnly),
    );

    const text = root(fixture).textContent ?? '';
    expect(text).toContain('План принят: модулей — 1');
    expect(text).toContain('Предупреждения плана');
    expect(text).toContain('В модуле «Основы» нет шага типа svg.');
    expect(text).not.toContain('План не прошёл проверку');
    expect(stagePanel(fixture)).not.toBeNull();
  });

  it('shows the course stage for a valid fenced plan and copies its prompt', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await switchToStaged(fixture);
    await typeInto(fixture, '.prompt-generation-page__description', 'Курс про regex');
    await typeInto(
      fixture,
      '.prompt-generation-page__outline-response',
      `План:\n\`\`\`json\n${JSON.stringify(OUTLINE)}\n\`\`\``,
    );

    const text = root(fixture).textContent ?? '';
    expect(text).toContain('План принят: модулей — 3');
    expect(text).toContain('Модуль 3 из 3: «Группы» — ожидание');
    expect(text).not.toContain('Предупреждения плана');
    expect(text).not.toContain('вкладке «Импорт»');
    expect(panelTitle(fixture)).toBe('Курс и модуль 1: «Основы»');

    await copyStagePrompt(fixture);
    const coursePrompt = joinStagedMessages(
      buildFirstModuleCourseMessages('Курс про regex', OUTLINE, COURSE_IMPORT_SCHEMA),
    );
    expect(writeTextMock).toHaveBeenLastCalledWith(coursePrompt);
    expect(coursePrompt).toContain('"title": "course-import"');
  });

  it('saves the course from a pasted answer and moves on to module 2', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);

    await submitStageAnswer(fixture, COURSE_ANSWER);

    expect(panelTitle(fixture)).toBe('Модуль 2 из 3: «Квантификаторы»');
    expect(root(fixture).textContent).toContain('Курс и модуль 1: «Основы» — готово');
    const link = root(fixture).querySelector('a.prompt-generation-page__link') as HTMLAnchorElement;
    const [course] = await CourseRepository.forDb(db).list();
    expect(link.getAttribute('href')).toBe(`/courses/${course!.courseId}`);
    expect(
      (root(fixture).querySelector('.prompt-generation-page__description') as HTMLTextAreaElement)
        .disabled,
    ).toBe(true);
    expect(
      (root(fixture).querySelector('.prompt-generation-page__outline-response') as HTMLTextAreaElement)
        .disabled,
    ).toBe(true);
    expect((root(fixture).querySelector('.manual-stage-panel__answer') as HTMLTextAreaElement).value).toBe('');

    await copyStagePrompt(fixture);
    expect(writeTextMock).toHaveBeenLastCalledWith(
      joinStagedMessages(buildModuleMessages(OUTLINE, 1, MODULE_IMPORT_SCHEMA)),
    );
  });

  it('lists problems of a rejected answer and copies the prompt with fixes', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);

    await submitStageAnswer(fixture, 'Не могу помочь');

    const text = root(fixture).textContent ?? '';
    expect(text).toContain('Ответ не прошёл проверку');
    const issues = root(fixture).querySelector('.manual-stage-panel__issues')?.textContent ?? '';
    expect(issues).toContain('Ответ не содержит JSON для импорта.');
    expect(issues).not.toContain('LM Studio');
    expect(text).toContain('Курс и модуль 1: «Основы» — ошибка');
    expect(panelTitle(fixture)).toBe('Курс и модуль 1: «Основы»');

    await copyStagePrompt(fixture);
    const copied = String(writeTextMock.mock.lastCall?.[0]);
    expect(copied).toContain('Предыдущий ответ отклонён');
    expect(copied).toContain('Ответ не содержит JSON для импорта.');
    expect(await CourseRepository.forDb(db).list()).toEqual([]);
  });

  it('appends the modules in order until the course is complete', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);

    await submitStageAnswer(fixture, COURSE_ANSWER);
    await submitStageAnswer(fixture, moduleAnswer('Квантификаторы'));
    expect(panelTitle(fixture)).toBe('Модуль 3 из 3: «Группы»');
    await submitStageAnswer(fixture, moduleAnswer('Группы'));

    expect(stagePanel(fixture)).toBeNull();
    expect(root(fixture).textContent).toContain('Курс готов: все модули плана сохранены.');
    const [course] = await CourseRepository.forDb(db).list();
    expect(course?.modules.map((module) => module.title)).toEqual([
      'Module 1',
      'Квантификаторы',
      'Группы',
    ]);
  });

  it('keeps the course stage pending until its progress is written, without importing again', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);
    const write = vi
      .spyOn(settingsRepo, 'setManualStagedProgress')
      .mockRejectedValueOnce(new Error('quota'));

    await submitStageAnswer(fixture, COURSE_ANSWER);

    const progressError = root(fixture).querySelector('.prompt-generation-page__progress-error');
    expect(progressError?.textContent).toContain('прогресс не записан');
    expect(stagePanel(fixture)).toBeNull();
    expect(root(fixture).querySelector('.prompt-generation-page__pending')?.textContent).toContain(
      'Курс и модуль 1: «Основы»',
    );
    expect(root(fixture).textContent).not.toContain('Курс и модуль 1: «Основы» — готово');
    expect(await CourseRepository.forDb(db).list()).toHaveLength(1);

    (root(fixture).querySelector('.prompt-generation-page__retry-progress') as HTMLButtonElement).click();
    await waitFor(fixture, () => panelTitle(fixture) === 'Модуль 2 из 3: «Квантификаторы»');

    expect(root(fixture).querySelector('.prompt-generation-page__progress-error')).toBeNull();
    expect((await settingsRepo.getManualStagedProgress())?.nextModuleIndex).toBe(1);
    expect(await CourseRepository.forDb(db).list()).toHaveLength(1);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it('shows a failed progress write of the last module instead of «Курс готов»', async () => {
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);
    await submitStageAnswer(fixture, COURSE_ANSWER);
    await submitStageAnswer(fixture, moduleAnswer('Квантификаторы'));
    vi.spyOn(settingsRepo, 'setManualStagedProgress').mockRejectedValueOnce(new Error('quota'));

    await submitStageAnswer(fixture, moduleAnswer('Группы'));

    expect(root(fixture).textContent).not.toContain('Курс готов');
    expect(root(fixture).querySelector('.prompt-generation-page__progress-error')).not.toBeNull();
    expect(root(fixture).querySelector('.prompt-generation-page__pending')?.textContent).toContain(
      'Модуль 3 из 3: «Группы»',
    );

    (root(fixture).querySelector('.prompt-generation-page__retry-progress') as HTMLButtonElement).click();
    await waitFor(fixture, () => (root(fixture).textContent ?? '').includes('Курс готов'));
    const [course] = await CourseRepository.forDb(db).list();
    expect(course?.modules).toHaveLength(3);
  });

  it('restores the progress when the page is opened again', async () => {
    const settings = SettingsRepository.forDb(db);
    const first = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(first);
    await submitStageAnswer(first, COURSE_ANSWER);
    await waitFor(first, async () => (await settings.getManualStagedProgress())?.nextModuleIndex === 1);
    first.destroy();

    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);
    await waitFor(fixture, () => stagePanel(fixture) !== null);

    expect((root(fixture).querySelector('input[value="staged"]') as HTMLInputElement).checked).toBe(true);
    expect(
      (root(fixture).querySelector('.prompt-generation-page__description') as HTMLTextAreaElement).value,
    ).toBe('Курс про regex');
    expect(panelTitle(fixture)).toBe('Модуль 2 из 3: «Квантификаторы»');
    expect(root(fixture).querySelector('a.prompt-generation-page__link')).not.toBeNull();
  });

  it('starts over: clears the form and the stored progress, keeps the course', async () => {
    const settings = SettingsRepository.forDb(db);
    const fixture = TestBed.createComponent(PromptGenerationPage);
    await preparePlan(fixture);
    await submitStageAnswer(fixture, COURSE_ANSWER);

    (root(fixture).querySelector('.prompt-generation-page__secondary') as HTMLButtonElement).click();
    await waitFor(fixture, async () => (await settings.getManualStagedProgress()) === undefined);

    const description = root(fixture).querySelector(
      '.prompt-generation-page__description',
    ) as HTMLTextAreaElement;
    expect(description.value).toBe('');
    expect(description.disabled).toBe(false);
    expect(stagePanel(fixture)).toBeNull();
    expect(root(fixture).querySelector('.prompt-generation-page__secondary')).toBeNull();
    expect(await CourseRepository.forDb(db).list()).toHaveLength(1);
  });
});
