import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { outlineWithModules } from '../../../course-generation/__fixtures__/outline-fixtures';
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
    if (!text.includes('Загрузка схемы')) {
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

describe('PromptGenerationPage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let writeTextMock: ReturnType<typeof vi.fn>;
  let failingSchemas: readonly SchemaName[];

  beforeEach(async () => {
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
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
    expect(stageButton(fixture, 'module-0')).toBeNull();
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
    expect(stageButton(fixture, 'module-0')).not.toBeNull();
  });

  it('offers one prompt per outline module for a valid fenced answer', async () => {
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
    expect(text).toContain('Курс и модуль 1: «Основы»');
    expect(text).toContain('Модуль 3 из 3: «Группы»');
    expect(text).not.toContain('Предупреждения плана');
    expect(root(fixture).querySelectorAll('.prompt-generation-page__module-prompt').length).toBe(3);

    stageButton(fixture, 'module-0')!.click();
    await fixture.whenStable();
    const coursePrompt = joinStagedMessages(
      buildFirstModuleCourseMessages('Курс про regex', OUTLINE, COURSE_IMPORT_SCHEMA),
    );
    expect(writeTextMock).toHaveBeenLastCalledWith(coursePrompt);
    expect(coursePrompt).toContain('"title": "course-import"');

    stageButton(fixture, 'module-1')!.click();
    await fixture.whenStable();
    const modulePrompt = joinStagedMessages(buildModuleMessages(OUTLINE, 1, MODULE_IMPORT_SCHEMA));
    expect(writeTextMock).toHaveBeenLastCalledWith(modulePrompt);
    expect(modulePrompt).toContain('"title": "module-import"');
    expect(modulePrompt).toContain('модуль 2 из 3: «Квантификаторы»');
  });
});
