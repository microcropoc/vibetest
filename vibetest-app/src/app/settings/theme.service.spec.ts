import { TestBed } from '@angular/core/testing';

import { SettingsRepository } from '../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import { stubMatchMedia } from './test-match-media-stub';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies data-theme on initialize from system when nothing stored', async () => {
    stubMatchMedia(true);
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: SettingsRepository.forDb(db) }],
    });
    const service = TestBed.inject(ThemeService);
    await service.initialize();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(service.theme()).toBe('dark');
  });

  it('persists user theme and applies data-theme', async () => {
    stubMatchMedia(false);
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: SettingsRepository.forDb(db) }],
    });
    const service = TestBed.inject(ThemeService);
    await service.initialize();
    await service.setTheme('eink');

    expect(document.documentElement.getAttribute('data-theme')).toBe('eink');
    expect(service.theme()).toBe('eink');
    expect(await SettingsRepository.forDb(db).getStoredTheme()).toBe('eink');
  });
});
