import { Component, effect, inject, input } from '@angular/core';

import { PlayerOrchestratorService } from '../../player-orchestrator.service';
import { PlayerShellComponent } from '../../ui/player-shell/player-shell';

@Component({
  selector: 'app-player-page',
  imports: [PlayerShellComponent],
  providers: [PlayerOrchestratorService],
  templateUrl: './player-page.html',
  styleUrl: './player-page.scss',
})
export class PlayerPage {
  readonly courseId = input.required<string>();
  readonly moduleId = input.required<string>();

  protected readonly orchestrator = inject(PlayerOrchestratorService);

  constructor() {
    effect(() => {
      const courseId = this.courseId();
      const moduleId = this.moduleId();
      void this.orchestrator.load(courseId, moduleId);
    });
  }
}
