import { Component, input, output } from '@angular/core';

import type { ModuleListItemView } from '../../module-list-item-view';

@Component({
  selector: 'app-module-list-card',
  templateUrl: './module-list-card.html',
  styleUrl: './module-list-card.scss',
})
export class ModuleListCardComponent {
  readonly item = input.required<ModuleListItemView>();

  readonly proceed = output<string>();

  protected onProceed(): void {
    this.proceed.emit(this.item().moduleId);
  }
}
