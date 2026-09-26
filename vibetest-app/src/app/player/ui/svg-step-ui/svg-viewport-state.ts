export const SVG_VIEWER_MIN_SCALE = 1;
export const SVG_VIEWER_MAX_SCALE = 4;
export const SVG_VIEWER_SCALE_STEP = 0.25;

export interface SvgViewportState {
  readonly scale: number;
  readonly panX: number;
  readonly panY: number;
}

export function initialSvgViewportState(): SvgViewportState {
  return { scale: 1, panX: 0, panY: 0 };
}

export function clampSvgViewerScale(scale: number): number {
  return Math.min(SVG_VIEWER_MAX_SCALE, Math.max(SVG_VIEWER_MIN_SCALE, scale));
}

export function withSvgViewerScale(state: SvgViewportState, scale: number): SvgViewportState {
  const nextScale = clampSvgViewerScale(scale);
  if (nextScale <= 1) {
    return { scale: nextScale, panX: 0, panY: 0 };
  }
  return { ...state, scale: nextScale };
}

export function zoomInSvgViewport(state: SvgViewportState): SvgViewportState {
  return withSvgViewerScale(state, state.scale + SVG_VIEWER_SCALE_STEP);
}

export function zoomOutSvgViewport(state: SvgViewportState): SvgViewportState {
  return withSvgViewerScale(state, state.scale - SVG_VIEWER_SCALE_STEP);
}

/** Focal coords are offsets from the viewport center (px). */
export function zoomSvgViewportAt(
  state: SvgViewportState,
  nextScale: number,
  focalX: number,
  focalY: number,
): SvgViewportState {
  const clamped = clampSvgViewerScale(nextScale);
  if (clamped <= 1) {
    return { scale: clamped, panX: 0, panY: 0 };
  }
  if (state.scale <= 0) {
    return { scale: clamped, panX: 0, panY: 0 };
  }
  const ratio = clamped / state.scale;
  return {
    scale: clamped,
    panX: focalX - (focalX - state.panX) * ratio,
    panY: focalY - (focalY - state.panY) * ratio,
  };
}

export function zoomSvgViewportByFactor(
  state: SvgViewportState,
  factor: number,
  focalX: number,
  focalY: number,
): SvgViewportState {
  return zoomSvgViewportAt(state, state.scale * factor, focalX, focalY);
}

export interface SvgPinchSnapshot {
  readonly startState: SvgViewportState;
  readonly startDistance: number;
  readonly startMidX: number;
  readonly startMidY: number;
}

export function applySvgPinchViewport(
  snapshot: SvgPinchSnapshot,
  currentDistance: number,
  currentMidX: number,
  currentMidY: number,
): SvgViewportState {
  const { startState, startDistance, startMidX, startMidY } = snapshot;
  if (startDistance <= 0) {
    return startState;
  }
  const nextScale = clampSvgViewerScale(startState.scale * (currentDistance / startDistance));
  const zoomed = zoomSvgViewportAt(startState, nextScale, startMidX, startMidY);
  if (zoomed.scale <= 1) {
    return zoomed;
  }
  return {
    ...zoomed,
    panX: zoomed.panX + (currentMidX - startMidX),
    panY: zoomed.panY + (currentMidY - startMidY),
  };
}

export function resetSvgViewport(): SvgViewportState {
  return initialSvgViewportState();
}

export function canPanSvgViewport(state: SvgViewportState): boolean {
  return state.scale > 1;
}

export function applySvgPanDelta(
  state: SvgViewportState,
  deltaX: number,
  deltaY: number,
): SvgViewportState {
  if (!canPanSvgViewport(state)) {
    return state;
  }
  return {
    ...state,
    panX: state.panX + deltaX,
    panY: state.panY + deltaY,
  };
}

export function svgViewportTransform(state: SvgViewportState): string {
  return `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
}
