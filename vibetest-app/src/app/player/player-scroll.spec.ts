import { scrollCaretIntoView, scrollPlayerToStepStart } from './player-scroll';

describe('player-scroll', () => {
  it('scrollPlayerToStepStart scrolls window to top', () => {
    const scrollTo = vi.fn();
    scrollPlayerToStepStart(scrollTo);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });

  it('scrollCaretIntoView uses an absolute scrollTo when the caret is under the keyboard', () => {
    const scrollTo = vi.fn();
    scrollCaretIntoView(
      { top: 360, bottom: 380 },
      {
        scrollTo,
        scrollY: 120,
        visualViewport: { offsetTop: 0, height: 400 },
        layoutHeight: 800,
      },
    );
    expect(scrollTo).toHaveBeenCalledWith({ top: 172, left: 0, behavior: 'auto' });
  });

  it('scrollCaretIntoView reveals the caret bottom when the line starts above the visible top', () => {
    const scrollTo = vi.fn();
    scrollCaretIntoView(
      { top: -40, bottom: 500 },
      {
        scrollTo,
        scrollY: 0,
        visualViewport: { offsetTop: 0, height: 400 },
        layoutHeight: 800,
      },
    );
    expect(scrollTo).toHaveBeenCalledWith({ top: 172, left: 0, behavior: 'auto' });
  });

  it('scrollCaretIntoView skips nav clearance when the keyboard is closed', () => {
    const scrollTo = vi.fn();
    scrollCaretIntoView(
      { top: 740, bottom: 760 },
      {
        scrollTo,
        scrollY: 0,
        visualViewport: { offsetTop: 0, height: 800 },
        layoutHeight: 800,
      },
    );
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrollCaretIntoView repeats to the same absolute offset when the caret rect is unchanged', () => {
    const scrollTo = vi.fn();
    const caret = { top: 360, bottom: 380 };
    const options = {
      scrollTo,
      scrollY: 0,
      visualViewport: { offsetTop: 0, height: 400 },
      layoutHeight: 800,
    };
    scrollCaretIntoView(caret, options);
    scrollCaretIntoView(caret, options);
    expect(scrollTo).toHaveBeenNthCalledWith(1, { top: 52, left: 0, behavior: 'auto' });
    expect(scrollTo).toHaveBeenNthCalledWith(2, { top: 52, left: 0, behavior: 'auto' });
  });

  it('scrollCaretIntoView uses scrollIntoView when visualViewport is missing', () => {
    const element = document.createElement('div');
    const scrollIntoView = vi.fn();
    element.scrollIntoView = scrollIntoView;
    scrollCaretIntoView(
      { top: 0, bottom: 20 },
      { visualViewport: null, element, scrollTo: vi.fn() },
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' });
  });
});
