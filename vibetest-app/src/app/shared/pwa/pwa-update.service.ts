import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  readonly updateReady = signal(false);

  constructor() {
    const sw = this.swUpdate;
    if (!sw?.isEnabled) {
      return;
    }

    sw.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.updateReady.set(true);
      }
    });

    void sw.checkForUpdate();
  }

  async applyUpdate(): Promise<void> {
    const sw = this.swUpdate;
    if (!sw?.isEnabled) {
      return;
    }
    await sw.activateUpdate();
    document.location.reload();
  }
}
