import { TestBed } from '@angular/core/testing';

import { BundledCoursesService } from '../../../courses/bundled/bundled-courses.service';
import { SettingsRepository } from '../../../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../../storage/test-db-harness';
import type { VibetestDb } from '../../../storage/vibetest-db';
import { stubMatchMedia } from '../../test-match-media-stub';
import { ThemeService } from '../../theme.service';

import { SettingsPage } from './settings-page';

async function whenSettingsPageReady(
  fixture: ReturnType<typeof TestBed.createComponent<SettingsPage>>,
): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка…')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe('SettingsPage', () => {
  let db: VibetestDb | undefined;

  beforeEach(() => {
    stubMatchMedia(false);
  });

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
    document.documentElement.removeAttribute('data-theme');
  });

  it('persists theme when user selects an option', async () => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        {
          provide: BundledCoursesService,
          useValue: { restoreMissing: vi.fn() },
        },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    const themeService = TestBed.inject(ThemeService);
    await themeService.initialize();
    await whenSettingsPageReady(fixture);

    const einkInput = fixture.nativeElement.querySelector(
      'input[value="eink"]',
    ) as HTMLInputElement;
    einkInput.checked = true;
    einkInput.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(await SettingsRepository.forDb(db!).getStoredTheme()).toBe('eink');
    expect(document.documentElement.getAttribute('data-theme')).toBe('eink');
  });

  it('persists a profile saved through the llm profiles editor', async () => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        { provide: BundledCoursesService, useValue: { restoreMissing: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    await whenSettingsPageReady(fixture);
    const root = fixture.nativeElement as HTMLElement;

    const addButton = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Добавить профиль',
    )!;
    addButton.click();
    await fixture.whenStable();

    const inputs = root.querySelectorAll('.llm-profile-fields__input') as NodeListOf<HTMLInputElement>;
    for (const [index, value] of ['LM Studio', 'http://localhost:1234/v1', 'key', 'model-1'].entries()) {
      inputs[index]!.value = value;
      inputs[index]!.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }
    const saveButton = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Сохранить',
    )!;
    saveButton.click();
    for (let attempt = 0; attempt < 50 && !root.textContent?.includes('Профиль сохранён.'); attempt += 1) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const stored = await SettingsRepository.forDb(db).getLlmProfiles();
    expect(stored.map((p) => p.label)).toEqual(['LM Studio']);
    expect(root.querySelector('.llm-profiles-editor__item-label')?.textContent).toBe('LM Studio');
  });

  it('shows status after restoring bundled courses', async () => {
    db = createTestVibetestDb();
    const restoreMissing = vi.fn().mockResolvedValue({ added: 2, failed: [] });
    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        {
          provide: BundledCoursesService,
          useValue: { restoreMissing },
        },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    await whenSettingsPageReady(fixture);

    const button = fixture.nativeElement.querySelector(
      '.settings-page__button',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(restoreMissing).toHaveBeenCalled();
    const status = fixture.nativeElement.querySelector('.settings-page__status') as HTMLElement;
    expect(status.textContent).toContain('Добавлено: 2');
  });

  it('shows failure count when restore cannot fetch bundled courses', async () => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        {
          provide: BundledCoursesService,
          useValue: {
            restoreMissing: vi.fn().mockResolvedValue({ added: 0, failed: ['Course A'] }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    await whenSettingsPageReady(fixture);

    const button = fixture.nativeElement.querySelector('.settings-page__button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    const status = fixture.nativeElement.querySelector('.settings-page__status') as HTMLElement;
    expect(status.textContent).toContain('Не удалось загрузить: 1');
  });

  it('shows both counts on partial restore', async () => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsRepository, useValue: SettingsRepository.forDb(db) },
        {
          provide: BundledCoursesService,
          useValue: {
            restoreMissing: vi.fn().mockResolvedValue({ added: 1, failed: ['Course B'] }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    await whenSettingsPageReady(fixture);

    const button = fixture.nativeElement.querySelector('.settings-page__button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    const status = fixture.nativeElement.querySelector('.settings-page__status') as HTMLElement;
    expect(status.textContent).toContain('Добавлено: 1. Не удалось загрузить: 1');
  });
});
