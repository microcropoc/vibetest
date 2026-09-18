import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PwaUpdateService } from '../../pwa/pwa-update.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly pwaUpdate = inject(PwaUpdateService);

  protected readonly navItems = [
    { label: 'Курсы', path: '/courses' },
    { label: 'Статистика', path: '/statistics' },
    { label: 'Импорт', path: '/import' },
    { label: 'Инфо', path: '/info' },
  ] as const;
}
