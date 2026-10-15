import { Injectable, inject, signal } from '@angular/core';

import { applyTypographyToDocument } from './apply-typography-to-document';
import {
  DEFAULT_CODE_TYPOGRAPHY,
  DEFAULT_UI_TYPOGRAPHY,
  type CodeTypography,
  type UiTypography,
} from './typography.model';
import { SettingsRepository } from '../storage/settings-repository';

@Injectable({ providedIn: 'root' })
export class TypographyService {
  private readonly settings = inject(SettingsRepository);

  private readonly uiSignal = signal<UiTypography>(DEFAULT_UI_TYPOGRAPHY);
  private readonly codeSignal = signal<CodeTypography>(DEFAULT_CODE_TYPOGRAPHY);
  private pending: Promise<void> = Promise.resolve();
  private initialized = false;

  readonly ui = this.uiSignal.asReadonly();
  readonly code = this.codeSignal.asReadonly();

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const ui = (await this.settings.getTypographyUi()) ?? DEFAULT_UI_TYPOGRAPHY;
    const code = (await this.settings.getTypographyCode()) ?? DEFAULT_CODE_TYPOGRAPHY;
    this.apply(ui, code);
    this.initialized = true;
  }

  setUi(ui: UiTypography): Promise<void> {
    this.apply(ui, this.codeSignal());
    return this.enqueue(() => this.settings.setTypographyUi(ui));
  }

  setCode(code: CodeTypography): Promise<void> {
    this.apply(this.uiSignal(), code);
    return this.enqueue(() => this.settings.setTypographyCode(code));
  }

  /** Restores built-in fonts. Does not touch the stored theme. */
  reset(): Promise<void> {
    this.apply(DEFAULT_UI_TYPOGRAPHY, DEFAULT_CODE_TYPOGRAPHY);
    return this.enqueue(() => this.settings.clearTypography());
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const run = this.pending.then(task, task);
    this.pending = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private apply(ui: UiTypography, code: CodeTypography): void {
    applyTypographyToDocument(document.documentElement, ui, code);
    this.uiSignal.set(ui);
    this.codeSignal.set(code);
  }
}
