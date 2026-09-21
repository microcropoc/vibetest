import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BUILD_INFO } from '../../build-info/generated-build-info';
import { formatBuildVersionLabel } from '../../build-info/format-build-version-label';
import { PwaUpdateService } from '../../pwa/pwa-update.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly pwaUpdate = inject(PwaUpdateService);

  protected readonly buildVersionLabel = formatBuildVersionLabel(
    BUILD_INFO.commitShort,
    BUILD_INFO.commitSubject,
  );

  protected readonly navItems = [
    { label: 'Курсы', path: '/courses' },
    { label: 'Статистика', path: '/statistics' },
    { label: 'Импорт', path: '/import' },
    { label: 'Инфо', path: '/info' },
    { label: 'Генерация промта', path: '/prompt-generation' },
  ] as const;
}
