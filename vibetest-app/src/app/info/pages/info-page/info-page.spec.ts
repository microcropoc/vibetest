import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { bundledCourseSchemaUrl } from '../../bundled-course-schema';

import { InfoPage } from './info-page';

async function whenPageReady(fixture: ComponentFixture<InfoPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка схемы')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('InfoPage did not finish loading');
}

describe('InfoPage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ schemaVersion: 1, title: 'Example' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [InfoPage],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and displays pretty-printed bundled schema', async () => {
    const fixture = TestBed.createComponent(InfoPage);
    await whenPageReady(fixture);

    expect(fetchMock).toHaveBeenCalledWith(bundledCourseSchemaUrl());
    const pre = fixture.nativeElement.querySelector('.info-page__schema') as HTMLElement;
    expect(pre.textContent).toContain('"schemaVersion": 1');
    expect(pre.getAttribute('aria-readonly')).toBe('true');
  });

  it('shows error when schema cannot be loaded', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

    const fixture = TestBed.createComponent(InfoPage);
    await whenPageReady(fixture);

    expect(fixture.nativeElement.textContent).toContain('Не удалось загрузить course.schema.json');
  });
});
