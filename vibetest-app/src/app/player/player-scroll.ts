export function scrollBehaviorForUser(
  prefersReducedMotion: boolean = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches,
): ScrollBehavior {
  return prefersReducedMotion ? 'auto' : 'smooth';
}

/** Scroll the document so a new step starts at the top of the viewport. */
export function scrollPlayerToStepStart(
  scrollTo: (options: ScrollToOptions) => void = (options) => window.scrollTo(options),
): void {
  scrollTo({ top: 0, left: 0, behavior: scrollBehaviorForUser() });
}

const VIEWPORT_EDGE_PX = 8;
const KEYBOARD_NAV_CLEARANCE_PX = 72;
const KEYBOARD_OPEN_THRESHOLD_PX = 80;

export interface VisualViewportLike {
  readonly offsetTop: number;
  readonly height: number;
}

export interface ClientBand {
  readonly top: number;
  readonly bottom: number;
}

export function keyboardOccludesLayout(
  viewport: VisualViewportLike,
  layoutHeight: number,
): boolean {
  return layoutHeight - (viewport.offsetTop + viewport.height) > KEYBOARD_OPEN_THRESHOLD_PX;
}

/**
 * Move the window so the caret line sits in the visual viewport.
 * Uses an absolute `scrollTo` with `behavior: 'auto'` so repeated keyboard
 * resizes do not stack smooth deltas. Nav clearance applies only while the
 * keyboard occludes the layout viewport.
 */
export function scrollCaretIntoView(
  caret: ClientBand,
  options: {
    readonly scrollTo?: (options: ScrollToOptions) => void;
    readonly scrollY?: number;
    readonly visualViewport?: VisualViewportLike | null;
    readonly layoutHeight?: number;
    readonly element?: HTMLElement;
  } = {},
): void {
  const vv = options.visualViewport === undefined ? window.visualViewport : options.visualViewport;
  if (vv == null) {
    options.element?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    return;
  }

  const layoutHeight = options.layoutHeight ?? window.innerHeight;
  const keyboardOpen = keyboardOccludesLayout(vv, layoutHeight);
  const visibleTop = vv.offsetTop + VIEWPORT_EDGE_PX;
  const bottomInset = keyboardOpen ? KEYBOARD_NAV_CLEARANCE_PX : VIEWPORT_EDGE_PX;
  const visibleBottom = vv.offsetTop + vv.height - bottomInset;

  let delta = 0;
  if (caret.bottom > visibleBottom) {
    delta = caret.bottom - visibleBottom;
  } else if (caret.top < visibleTop) {
    delta = caret.top - visibleTop;
  }
  if (delta === 0) {
    return;
  }

  const scrollY = options.scrollY ?? window.scrollY;
  const scrollTo = options.scrollTo ?? ((scrollOptions) => window.scrollTo(scrollOptions));
  scrollTo({ top: scrollY + delta, left: 0, behavior: 'auto' });
}
