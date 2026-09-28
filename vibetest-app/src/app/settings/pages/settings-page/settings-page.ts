import { Component, inject, signal } from '@angular/core';

import { BundledCoursesService } from '../../../courses/bundled/bundled-courses.service';
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
  private readonly bundledCourses = inject(BundledCoursesService);

  protected readonly theme = this.themeService.theme;
  protected readonly bundledRestoreBusy = signal(false);
  protected readonly bundledRestoreMessage = signal<string | null>(null);

  protected onThemeChange(theme: Theme): void {
    void this.themeService.setTheme(theme);
  }

  protected async onRestoreBundledCourses(): Promise<void> {
    if (this.bundledRestoreBusy()) {
      return;
    }
    this.bundledRestoreBusy.set(true);
    this.bundledRestoreMessage.set(null);
    try {
      const { added, failed } = await this.bundledCourses.restoreMissing();
      if (failed.length > 0) {
        const failedText = `Не удалось загрузить: ${failed.length}`;
        this.bundledRestoreMessage.set(added > 0 ? `Добавлено: ${added}. ${failedText}` : failedText);
      } else if (added > 0) {
        this.bundledRestoreMessage.set(`Добавлено: ${added}`);
      } else {
        this.bundledRestoreMessage.set('Все встроенные курсы уже установлены');
      }
    } catch {
      this.bundledRestoreMessage.set('Не удалось проверить встроенные курсы');
    } finally {
      this.bundledRestoreBusy.set(false);
    }
  }
}
