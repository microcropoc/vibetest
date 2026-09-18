import 'fake-indexeddb/auto';

import { createVibetestDb, type VibetestDb } from './vibetest-db';

export function createTestVibetestDb(): VibetestDb {
  return createVibetestDb(`vibetest-test-${crypto.randomUUID()}`);
}

export async function destroyTestVibetestDb(db: VibetestDb): Promise<void> {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
}
