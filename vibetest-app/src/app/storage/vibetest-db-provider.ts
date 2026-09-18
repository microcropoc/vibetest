import { Injectable } from '@angular/core';

import { createVibetestDb, VibetestDb } from './vibetest-db';

@Injectable({ providedIn: 'root' })
export class VibetestDbProvider {
  private dbInstance: VibetestDb | undefined;

  get db(): VibetestDb {
    if (this.dbInstance === undefined) {
      this.dbInstance = createVibetestDb();
    }
    return this.dbInstance;
  }
}

export function vibetestDbProviderFor(db: VibetestDb): VibetestDbProvider {
  return { db } as VibetestDbProvider;
}
