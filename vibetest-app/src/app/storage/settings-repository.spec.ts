import 'fake-indexeddb/auto';

import { settingsRowForTheme } from './settings-row-parse';
import { SettingsRepository } from './settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from './test-db-harness';
import type { VibetestDb } from './vibetest-db';
import { VIBETEST_DB_VERSION } from './db-version';

describe('SettingsRepository', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('uses Dexie schema v2 with settings store', async () => {
    db = createTestVibetestDb();
    expect(db.verno).toBe(VIBETEST_DB_VERSION);
    expect(db.tables.some((t) => t.name === 'settings')).toBe(true);
  });

  it('returns undefined until theme is saved', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    expect(await repo.getStoredTheme()).toBeUndefined();
  });

  it('persists and loads theme', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    await repo.setTheme('eink');
    expect(await repo.getStoredTheme()).toBe('eink');
    await repo.setTheme('dark');
    expect(await repo.getStoredTheme()).toBe('dark');
  });

  it('stores row under theme key', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    await repo.setTheme('light');
    const row = await db.settings.get('theme');
    expect(row).toEqual(settingsRowForTheme('light'));
  });
});
