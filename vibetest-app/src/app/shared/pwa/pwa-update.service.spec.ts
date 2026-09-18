import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import type { VersionEvent } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';

import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  it('marks update ready on VERSION_READY', () => {
    const events = new Subject<VersionEvent>();
    const swUpdate = {
      isEnabled: true,
      versionUpdates: events.asObservable(),
      checkForUpdate: vi.fn().mockResolvedValue(false),
      activateUpdate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: SwUpdate, useValue: swUpdate }],
    });

    const service = TestBed.inject(PwaUpdateService);
    expect(service.updateReady()).toBe(false);

    events.next({ type: 'VERSION_READY', currentVersion: { hash: 'a' }, latestVersion: { hash: 'b' } });
    expect(service.updateReady()).toBe(true);
    expect(swUpdate.checkForUpdate).toHaveBeenCalled();
  });

  it('stays idle when service worker is disabled', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: false,
            versionUpdates: new Subject<VersionEvent>().asObservable(),
            checkForUpdate: vi.fn(),
            activateUpdate: vi.fn(),
          },
        },
      ],
    });
    const service = TestBed.inject(PwaUpdateService);
    expect(service.updateReady()).toBe(false);
  });
});
