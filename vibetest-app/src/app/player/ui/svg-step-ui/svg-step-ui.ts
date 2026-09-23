import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import type { Step } from '../../../courses/course.model';
import { SvgFullscreenViewerComponent } from '../svg-fullscreen-viewer/svg-fullscreen-viewer';

type SvgStepContent = Extract<Step, { type: 'svg' }>['content'];

@Component({
  selector: 'app-svg-step-ui',
  imports: [SvgFullscreenViewerComponent],
  templateUrl: './svg-step-ui.html',
  styleUrl: './svg-step-ui.scss',
})
export class SvgStepUiComponent {
  readonly content = input.required<SvgStepContent>();

  private readonly sanitizer = inject(DomSanitizer);

  private readonly expandButton = viewChild<ElementRef<HTMLButtonElement>>('expandButton');

  protected readonly viewerOpen = signal(false);

  protected readonly svgHtml = computed((): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(this.content().svg),
  );

  protected readonly viewerDialogLabel = computed((): string => {
    const caption = this.content().caption?.trim();
    return caption ? `Просмотр SVG: ${caption}` : 'Просмотр SVG';
  });

  protected onExpand(): void {
    this.viewerOpen.set(true);
  }

  protected onViewerClosed(): void {
    this.viewerOpen.set(false);
    queueMicrotask(() => {
      this.expandButton()?.nativeElement.focus();
    });
  }
}
