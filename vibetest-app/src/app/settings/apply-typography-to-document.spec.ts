import { applyTypographyToDocument } from './apply-typography-to-document';
import { CODE_FONT_STACKS, UI_FONT_STACKS } from './typography.model';

describe('applyTypographyToDocument', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('sets UI and code CSS variables on the root', () => {
    applyTypographyToDocument(
      document.documentElement,
      { family: 'serif', size: 'l' },
      { family: 'consolas', size: 's' },
    );
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--font-ui-family')).toBe(UI_FONT_STACKS.serif);
    expect(style.getPropertyValue('--font-ui-size')).toBe('18px');
    expect(style.getPropertyValue('--font-code-family')).toBe(CODE_FONT_STACKS.consolas);
    expect(style.getPropertyValue('--font-code-size')).toBe('13px');
  });
});
