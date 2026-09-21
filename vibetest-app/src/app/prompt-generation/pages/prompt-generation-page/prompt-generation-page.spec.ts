import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { buildCourseGenerationPrompt } from '../../build-course-generation-prompt';

import { PromptGenerationPage } from './prompt-generation-page';

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

describe('PromptGenerationPage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ schemaVersion: 1, title: 'Schema' }),
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

    const textarea = fixture.nativeElement.querySelector(
      '.prompt-generation-page__description',
    ) as HTMLTextAreaElement;
    textarea.value = 'Курс про CSS';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const copyBtn = fixture.nativeElement.querySelector(
      '.prompt-generation-page__copy',
    ) as HTMLButtonElement;
    copyBtn.click();
    await fixture.whenStable();

    const schemaText = '{\n  "schemaVersion": 1,\n  "title": "Schema"\n}';
    const expectedPrompt = buildCourseGenerationPrompt('Курс про CSS', schemaText);
    expect(writeTextMock).toHaveBeenCalledWith(expectedPrompt);
    expect(fixture.nativeElement.textContent).toContain('Скопировано');
  });

  it('shows error when schema cannot be loaded', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

    const fixture = TestBed.createComponent(PromptGenerationPage);
    await whenPageReady(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'Не удалось загрузить course-import.schema.json',
    );
  });
});
