import 'fake-indexeddb/auto';

import type { LlmProfile } from '../settings/llm-profile.model';

import { settingsRowForLlmProfiles, settingsRowForTheme } from './settings-row-parse';
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

  it('returns empty llm profiles until saved', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    expect(await repo.getLlmProfiles()).toEqual([]);
  });

  it('persists and loads llm profiles', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    const profiles: readonly LlmProfile[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        label: 'Local',
        baseUrl: 'http://localhost:1234/v1',
        apiKey: 'key',
        model: 'm',
        structuredOutput: false,
      },
    ];
    await repo.setLlmProfiles(profiles);
    expect(await repo.getLlmProfiles()).toEqual(profiles);
    const row = await db.settings.get('llmProfiles');
    expect(row).toEqual(settingsRowForLlmProfiles(profiles));
  });

  it('returns empty list for corrupt llm profiles row', async () => {
    db = createTestVibetestDb();
    await db.settings.put({ key: 'llmProfiles', value: [{ bad: true }] });
    const repo = SettingsRepository.forDb(db);
    expect(await repo.getLlmProfiles()).toEqual([]);
  });

  it('loads legacy llm profiles without structuredOutput as false', async () => {
    db = createTestVibetestDb();
    await db.settings.put({
      key: 'llmProfiles',
      value: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          label: 'Local',
          baseUrl: 'http://localhost:1234/v1',
          apiKey: 'key',
          model: 'm',
        },
      ],
    });
    const repo = SettingsRepository.forDb(db);
    const [profile] = await repo.getLlmProfiles();
    expect(profile?.structuredOutput).toBe(false);
  });
});
