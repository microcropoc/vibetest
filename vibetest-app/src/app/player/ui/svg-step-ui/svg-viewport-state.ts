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
