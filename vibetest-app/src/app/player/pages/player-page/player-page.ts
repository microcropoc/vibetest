import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { PlayerOrchestratorService } from '../../player-orchestrator.service';
import { stepIndicatorItems } from '../../step-indicator-items';
import { PlayerNavComponent } from '../../ui/player-nav/player-nav';
import { PlayerShellComponent } from '../../ui/player-shell/player-shell';
import { StepIndicatorBarComponent } from '../../ui/step-indicator-bar/step-indicator-bar';

@Component({
  selector: 'app-player-page',
  imports: [PlayerShellComponent, StepIndicatorBarComponent, PlayerNavComponent],
  providers: [PlayerOrchestratorService],
  templateUrl: './player-page.html',
  styleUrl: './player-page.scss',
})
export class PlayerPage {
  readonly courseId = input.required<string>();
  readonly moduleId = input.required<string>();

  private readonly router = inject(Router);
  protected readonly orchestrator = inject(PlayerOrchestratorService);

  protected readonly indicatorItems = computed(() =>
    stepIndicatorItems(
      this.orchestrator.steps(),
      this.orchestrator.currentStepIndex(),
      this.orchestrator.snapshotsByStepId(),
    ),
  );

  constructor() {
    effect(() => {
      const courseId = this.courseId();
      const moduleId = this.moduleId();
      void this.orchestrator.load(courseId, moduleId);
    });
  }

  protected onStepSelected(index: number): void {
    this.orchestrator.selectStep(index);
  }

  protected onBack(): void {
    this.orchestrator.goBack();
  }

  protected onNext(): void {
    void this.orchestrator.goNext();
  }

  protected onExit(): void {
    void this.router.navigate(['/courses', this.orchestrator.sessionCourseId()]);
  }

  protected onRetry(): void {
    void this.orchestrator.retry();
  }
}
