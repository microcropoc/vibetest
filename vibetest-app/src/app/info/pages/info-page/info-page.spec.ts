import { TestBed, type ComponentFixture } from '@angular/core/testing';

import {
  bundledCourseImportSchemaUrl,
  bundledModuleImportSchemaUrl,
} from '../../bundled-course-schema';

import { InfoPage } from './info-page';

async function whenPageReady(fixture: ComponentFixture<InfoPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка схем')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('InfoPage did not finish loading');
}

describe('InfoPage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: async () =>
          url.includes('module-import')
            ? { schemaVersion: 1, title: 'Module example' }
            : { schemaVersion: 1, title: 'Course example' },
      }),
    );
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });

    await TestBed.configureTestingModule({
      imports: [InfoPage],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and displays both bundled import schemas', async () => {
    const fixture = TestBed.createComponent(InfoPage);
    await whenPageReady(fixture);

    expect(fetchMock).toHaveBeenCalledWith(bundledCourseImportSchemaUrl());
    expect(fetchMock).toHaveBeenCalledWith(bundledModuleImportSchemaUrl());
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('course-import.schema.json');
    expect(root.textContent).toContain('module-import.schema.json');
    const blocks = root.querySelectorAll('.info-page__schema');
    expect(blocks.length).toBe(2);
    expect(blocks[0]?.textContent).toContain('"title": "Course example"');
    expect(blocks[1]?.textContent).toContain('"title": "Module example"');
  });

  it('shows error when schema cannot be loaded', async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const fixture = TestBed.createComponent(InfoPage);
    await whenPageReady(fixture);

    expect(fixture.nativeElement.textContent).toContain('Не удалось загрузить схемы импорта.');
  });

  it('copies displayed course schema text to clipboard', async () => {
    const fixture = TestBed.createComponent(InfoPage);
    await whenPageReady(fixture);

    const copyButtons = fixture.nativeElement.querySelectorAll(
      '.info-page__copy',
    ) as NodeListOf<HTMLButtonElement>;
    copyButtons[0]!.click();
    await fixture.whenStable();

    expect(writeTextMock).toHaveBeenCalledWith(
      '{\n  "schemaVersion": 1,\n  "title": "Course example"\n}',
    );
    expect(fixture.nativeElement.textContent).toContain('Скопировано');
  });
});
