import { Component, inject } from '@angular/core';

import { ThemePickerComponent } from '../../ui/theme-picker/theme-picker';
import type { Theme } from '../../theme.model';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-settings-page',
  imports: [ThemePickerComponent],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;

  protected onThemeChange(theme: Theme): void {
    void this.themeService.setTheme(theme);
  }
}
