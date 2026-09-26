import {
  applySvgPanDelta,
  applySvgPinchViewport,
  clampSvgViewerScale,
  initialSvgViewportState,
  resetSvgViewport,
  SVG_VIEWER_MAX_SCALE,
  SVG_VIEWER_MIN_SCALE,
  svgViewportTransform,
  zoomInSvgViewport,
  zoomOutSvgViewport,
  zoomSvgViewportAt,
  zoomSvgViewportByFactor,
} from './svg-viewport-state';

describe('svg-viewport-state', () => {
  it('clamps scale to configured range', () => {
    expect(clampSvgViewerScale(0.5)).toBe(SVG_VIEWER_MIN_SCALE);
    expect(clampSvgViewerScale(10)).toBe(SVG_VIEWER_MAX_SCALE);
    expect(clampSvgViewerScale(2)).toBe(2);
  });

  it('zoom in/out adjusts scale within limits', () => {
    let state = initialSvgViewportState();
    state = zoomInSvgViewport(state);
    expect(state.scale).toBe(1.25);
    state = zoomOutSvgViewport(state);
    expect(state.scale).toBe(1);
  });

  it('resets pan when scale returns to 1', () => {
    let state = zoomInSvgViewport(initialSvgViewportState());
    state = applySvgPanDelta(state, 10, 20);
    state = zoomOutSvgViewport(state);
    expect(state).toEqual({ scale: 1, panX: 0, panY: 0 });
  });

  it('applies pan only when scale > 1', () => {
    const atFit = applySvgPanDelta(initialSvgViewportState(), 5, 5);
    expect(atFit.panX).toBe(0);
    const zoomed = applySvgPanDelta(zoomInSvgViewport(initialSvgViewportState()), 5, 5);
    expect(zoomed.panX).toBe(5);
    expect(zoomed.panY).toBe(5);
  });

  it('reset restores initial viewport', () => {
    let state = zoomInSvgViewport(initialSvgViewportState());
    state = applySvgPanDelta(state, 3, 4);
    expect(resetSvgViewport()).toEqual(initialSvgViewportState());
  });

  it('builds css transform string', () => {
    expect(svgViewportTransform({ scale: 2, panX: 10, panY: -5 })).toBe(
      'translate(10px, -5px) scale(2)',
    );
  });

  it('zooms at focal point and clears pan at scale 1', () => {
    const zoomed = zoomSvgViewportAt({ scale: 1, panX: 0, panY: 0 }, 2, 100, 50);
    expect(zoomed.scale).toBe(2);
    expect(zoomed.panX).toBe(-100);
    expect(zoomed.panY).toBe(-50);

    const back = zoomSvgViewportAt(zoomed, 1, 100, 50);
    expect(back).toEqual({ scale: 1, panX: 0, panY: 0 });
  });

  it('zooms by factor around focal point', () => {
    const next = zoomSvgViewportByFactor({ scale: 2, panX: 10, panY: 0 }, 1.5, 0, 0);
    expect(next.scale).toBe(3);
    expect(next.panX).toBe(15);
  });

  it('applies pinch scale and midpoint pan from snapshot', () => {
    const start = zoomInSvgViewport(initialSvgViewportState());
    const next = applySvgPinchViewport(
      { startState: start, startDistance: 100, startMidX: 0, startMidY: 0 },
      200,
      10,
      0,
    );
    expect(next.scale).toBe(2.5);
    expect(next.panX).toBe(10);
  });

  it('clears pan when pinch clamps back to fit scale', () => {
    const start = { scale: 2, panX: 20, panY: -10 };
    const next = applySvgPinchViewport(
      { startState: start, startDistance: 200, startMidX: 0, startMidY: 0 },
      50,
      30,
      40,
    );
    expect(next).toEqual({ scale: 1, panX: 0, panY: 0 });
  });
});
