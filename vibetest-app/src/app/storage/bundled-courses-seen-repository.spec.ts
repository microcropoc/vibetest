import 'fake-indexeddb/auto';

import { BundledCoursesSeenRepository } from './bundled-courses-seen-repository';
import { settingsRowForBundledCoursesSeen } from './bundled-courses-seen-row';
import { SETTINGS_BUNDLED_COURSES_SEEN_KEY } from './settings-bundled-courses-key';
import { createTestVibetestDb, destroyTestVibetestDb } from './test-db-harness';
import type { VibetestDb } from './vibetest-db';

describe('BundledCoursesSeenRepository', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('returns empty list until saved', async () => {
    db = createTestVibetestDb();
    expect(await BundledCoursesSeenRepository.forDb(db).get()).toEqual([]);
  });

  it('merges course IDs without duplicates', async () => {
    db = createTestVibetestDb();
    const repo = BundledCoursesSeenRepository.forDb(db);
    const id1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const id2 = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    await repo.add([id1]);
    await repo.add([id1, id2]);
    expect(await repo.get()).toEqual([id1, id2]);
    const row = await db.settings.get(SETTINGS_BUNDLED_COURSES_SEEN_KEY);
    expect(row).toEqual(settingsRowForBundledCoursesSeen([id1, id2]));
  });

  it('rejects stored value with invalid UUID', async () => {
    db = createTestVibetestDb();
    await db.settings.put({ key: SETTINGS_BUNDLED_COURSES_SEEN_KEY, value: ['not-a-uuid'] });
    await expect(BundledCoursesSeenRepository.forDb(db).get()).rejects.toThrow('invalid UUID');
  });
});
