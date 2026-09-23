import { Injectable, inject, signal } from '@angular/core';

import { applyThemeToDocument } from './apply-theme-to-document';
import { readColorSchemePreference } from './color-scheme-preference';
import { resolveInitialTheme } from './resolve-initial-theme';
import type { Theme } from './theme.model';
import { SettingsRepository } from '../storage/settings-repository';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly settings = inject(SettingsRepository);

  private readonly themeSignal = signal<Theme>('light');
  private initialized = false;

  /** Current theme (after {@link initialize}). */
  readonly theme = this.themeSignal.asReadonly();

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const stored = await this.settings.getStoredTheme();
    const preference = readColorSchemePreference((query) => window.matchMedia(query));
    const theme = resolveInitialTheme(preference, stored);
    this.applyTheme(theme);
    this.initialized = true;
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.settings.setTheme(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    applyThemeToDocument(document.documentElement, theme);
    this.themeSignal.set(theme);
  }
}
