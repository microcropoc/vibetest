import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-player-nav',
  templateUrl: './player-nav.html',
  styleUrl: './player-nav.scss',
})
export class PlayerNavComponent {
  readonly canGoBack = input(true);
  readonly isLastStep = input(false);

  readonly back = output<void>();
  readonly next = output<void>();
  readonly exit = output<void>();
  readonly retry = output<void>();

  protected onBack(): void {
    this.back.emit();
  }

  protected onPrimary(): void {
    if (this.isLastStep()) {
      this.exit.emit();
    } else {
      this.next.emit();
    }
  }

  protected onRetry(): void {
    this.retry.emit();
  }
}
