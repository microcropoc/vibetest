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
  applySvgPinchViewport,
  canPanSvgViewport,
  initialSvgViewportState,
  resetSvgViewport,
  svgViewportTransform,
  zoomInSvgViewport,
  zoomOutSvgViewport,
  zoomSvgViewportByFactor,
  type SvgPinchSnapshot,
  type SvgViewportState,
} from '../svg-step-ui/svg-viewport-state';

interface PointerPoint {
  readonly x: number;
  readonly y: number;
}

const WHEEL_ZOOM_SENSITIVITY = 0.002;

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
  private lastPointer: PointerPoint | null = null;
  private readonly activePointers = new Map<number, PointerPoint>();
  private pinchSnapshot: SvgPinchSnapshot | null = null;

  protected readonly viewportTransform = computed(() => svgViewportTransform(this.viewport()));

  constructor() {
    effect(() => {
      if (this.open()) {
        this.viewport.set(initialSvgViewportState());
        this.clearPointerGestureState();
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
    this.clearPointerGestureState();
    this.closed.emit();
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const viewport = event.currentTarget;
    if (!(viewport instanceof HTMLElement)) {
      return;
    }
    const focal = focalFromClient(viewport, event.clientX, event.clientY);
    const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
    this.viewport.update((state) => zoomSvgViewportByFactor(state, factor, focal.x, focal.y));
  }

  protected onPointerDown(event: PointerEvent): void {
    const viewport = event.currentTarget;
    if (!(viewport instanceof HTMLElement)) {
      return;
    }
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.setPointerCapture(event.pointerId);

    if (this.activePointers.size >= 2) {
      this.panning.set(false);
      this.lastPointer = null;
      this.pinchSnapshot = this.buildPinchSnapshot(viewport);
      return;
    }

    if (canPanSvgViewport(this.viewport())) {
      this.panning.set(true);
      this.lastPointer = { x: event.clientX, y: event.clientY };
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const viewport = event.currentTarget;
    if (!(viewport instanceof HTMLElement)) {
      return;
    }
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size >= 2 && this.pinchSnapshot !== null) {
      const [a, b] = [...this.activePointers.values()];
      const distance = pointerDistance(a, b);
      const mid = focalFromClient(viewport, (a.x + b.x) / 2, (a.y + b.y) / 2);
      this.viewport.set(
        applySvgPinchViewport(this.pinchSnapshot, distance, mid.x, mid.y),
      );
      return;
    }

    if (!this.panning() || this.lastPointer === null) {
      return;
    }
    const deltaX = event.clientX - this.lastPointer.x;
    const deltaY = event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.viewport.update((state) => applySvgPanDelta(state, deltaX, deltaY));
  }

  protected onPointerUp(event: PointerEvent): void {
    const viewport = event.currentTarget;
    if (!(viewport instanceof HTMLElement)) {
      return;
    }
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size < 2) {
      this.pinchSnapshot = null;
    }
    if (this.activePointers.size === 0) {
      this.panning.set(false);
      this.lastPointer = null;
    } else if (this.activePointers.size === 1 && canPanSvgViewport(this.viewport())) {
      const remaining = [...this.activePointers.values()][0]!;
      this.panning.set(true);
      this.lastPointer = { x: remaining.x, y: remaining.y };
    } else {
      this.panning.set(false);
      this.lastPointer = null;
    }
    try {
      viewport.releasePointerCapture(event.pointerId);
    } catch {
      /* pointer already released */
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.onClose();
    }
  }

  private buildPinchSnapshot(viewport: HTMLElement): SvgPinchSnapshot | null {
    const points = [...this.activePointers.values()];
    if (points.length < 2) {
      return null;
    }
    const [a, b] = points;
    const distance = pointerDistance(a, b);
    const mid = focalFromClient(viewport, (a.x + b.x) / 2, (a.y + b.y) / 2);
    return {
      startState: this.viewport(),
      startDistance: distance,
      startMidX: mid.x,
      startMidY: mid.y,
    };
  }

  private clearPointerGestureState(): void {
    this.panning.set(false);
    this.lastPointer = null;
    this.activePointers.clear();
    this.pinchSnapshot = null;
  }
}

function pointerDistance(a: PointerPoint, b: PointerPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function focalFromClient(viewport: HTMLElement, clientX: number, clientY: number): PointerPoint {
  const rect = viewport.getBoundingClientRect();
  return {
    x: clientX - rect.left - rect.width / 2,
    y: clientY - rect.top - rect.height / 2,
  };
}
