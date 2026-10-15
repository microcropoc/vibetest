import { TestBed } from '@angular/core/testing';

import { SettingsRepository } from '../storage/settings-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../storage/test-db-harness';
import type { VibetestDb } from '../storage/vibetest-db';

import { CODE_FONT_STACKS, UI_FONT_STACKS } from './typography.model';
import { TypographyService } from './typography.service';

describe('TypographyService', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
    document.documentElement.removeAttribute('style');
  });

  it('applies defaults when nothing is stored', async () => {
    db = createTestVibetestDb();
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: SettingsRepository.forDb(db) }],
    });
    const service = TestBed.inject(TypographyService);
    await service.initialize();

    expect(service.ui()).toEqual({ family: 'system', size: 'm' });
    expect(service.code()).toEqual({ family: 'ui-monospace', size: 'm' });
    expect(document.documentElement.style.getPropertyValue('--font-ui-size')).toBe('16px');
    expect(document.documentElement.style.getPropertyValue('--font-code-size')).toBe('15px');
    expect(CODE_FONT_STACKS['ui-monospace']).toBe(
      'ui-monospace, Consolas, "Courier New", monospace',
    );
  });

  it('persists choices and restores them on the next initialize', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: repo }],
    });
    const service = TestBed.inject(TypographyService);
    await service.initialize();
    await service.setUi({ family: 'serif', size: 'l' });
    await service.setCode({ family: 'consolas', size: 's' });

    expect(document.documentElement.style.getPropertyValue('--font-ui-family')).toBe(
      UI_FONT_STACKS.serif,
    );
    expect(document.documentElement.style.getPropertyValue('--font-code-family')).toBe(
      CODE_FONT_STACKS.consolas,
    );
    expect(await repo.getTypographyUi()).toEqual({ family: 'serif', size: 'l' });
    expect(await repo.getTypographyCode()).toEqual({ family: 'consolas', size: 's' });

    const first = service.setUi({ family: 'serif', size: 'm' });
    const second = service.setUi({ family: 'serif', size: 'l' });
    await first;
    await second;
    expect(await repo.getTypographyUi()).toEqual({ family: 'serif', size: 'l' });

    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: repo }],
    });
    const reloaded = TestBed.inject(TypographyService);
    await reloaded.initialize();
    expect(reloaded.ui()).toEqual({ family: 'serif', size: 'l' });
    expect(document.documentElement.style.getPropertyValue('--font-ui-size')).toBe('18px');
  });

  it('reset restores defaults and keeps the stored theme', async () => {
    db = createTestVibetestDb();
    const repo = SettingsRepository.forDb(db);
    await repo.setTheme('eink');
    TestBed.configureTestingModule({
      providers: [{ provide: SettingsRepository, useValue: repo }],
    });
    const service = TestBed.inject(TypographyService);
    await service.initialize();
    await service.setUi({ family: 'serif', size: 's' });
    await service.setCode({ family: 'consolas', size: 'l' });
    await service.reset();

    expect(service.ui()).toEqual({ family: 'system', size: 'm' });
    expect(service.code()).toEqual({ family: 'ui-monospace', size: 'm' });
    expect(await repo.getTypographyUi()).toBeUndefined();
    expect(await repo.getTypographyCode()).toBeUndefined();
    expect(await repo.getStoredTheme()).toBe('eink');
    expect(document.documentElement.style.getPropertyValue('--font-ui-family')).toBe(
      UI_FONT_STACKS.system,
    );
  });
});
