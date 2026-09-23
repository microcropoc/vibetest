import { TestBed } from '@angular/core/testing';

import { SettingsRepository } from '../../../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../../storage/test-db-harness';
import type { VibetestDb } from '../../../storage/vibetest-db';
import { stubMatchMedia } from '../../test-match-media-stub';
import { ThemeService } from '../../theme.service';

import { SettingsPage } from './settings-page';

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
      providers: [{ provide: SettingsRepository, useValue: SettingsRepository.forDb(db) }],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    const themeService = TestBed.inject(ThemeService);
    await themeService.initialize();
    await fixture.whenStable();

    const einkInput = fixture.nativeElement.querySelector(
      'input[value="eink"]',
    ) as HTMLInputElement;
    einkInput.checked = true;
    einkInput.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(await SettingsRepository.forDb(db!).getStoredTheme()).toBe('eink');
    expect(document.documentElement.getAttribute('data-theme')).toBe('eink');
  });
});
