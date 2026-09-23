import {
  Component,
  computed,
  effect,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';

import {
  applySvgPanDelta,
  canPanSvgViewport,
  initialSvgViewportState,
  resetSvgViewport,
  svgViewportTransform,
  zoomInSvgViewport,
  zoomOutSvgViewport,
  type SvgViewportState,
} from '../svg-step-ui/svg-viewport-state';

@Component({
  selector: 'app-svg-fullscreen-viewer',
  templateUrl: './svg-fullscreen-viewer.html',
  styleUrl: './svg-fullscreen-viewer.scss',
})
export class SvgFullscreenViewerComponent {
  readonly open = input(false);
  readonly svgHtml = input.required<SafeHtml>();
  readonly dialogLabel = input('Просмотр SVG');

  readonly closed = output<void>();

  private readonly viewport = signal<SvgViewportState>(initialSvgViewportState());
  protected readonly panning = signal(false);
  private lastPointer: { x: number; y: number } | null = null;

  protected readonly viewportTransform = computed(() => svgViewportTransform(this.viewport()));

  constructor() {
    effect(() => {
      if (this.open()) {
        this.viewport.set(initialSvgViewportState());
      }
    });
  }

  protected onZoomIn(): void {
    this.viewport.update((state) => zoomInSvgViewport(state));
  }

  protected onZoomOut(): void {
    this.viewport.update((state) => zoomOutSvgViewport(state));
  }

  protected onReset(): void {
    this.viewport.set(resetSvgViewport());
  }

  protected onClose(): void {
    this.viewport.set(resetSvgViewport());
    this.closed.emit();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!canPanSvgViewport(this.viewport())) {
      return;
    }
    this.panning.set(true);
    this.lastPointer = { x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.panning() || this.lastPointer === null) {
      return;
    }
    const deltaX = event.clientX - this.lastPointer.x;
    const deltaY = event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.viewport.update((state) => applySvgPanDelta(state, deltaX, deltaY));
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.panning()) {
      return;
    }
    this.panning.set(false);
    this.lastPointer = null;
    if (event.currentTarget instanceof HTMLElement && event.pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer already released */
      }
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.onClose();
    }
  }
}
