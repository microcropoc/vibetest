import { resolveInitialTheme } from './resolve-initial-theme';

describe('resolveInitialTheme', () => {
  it('returns stored theme when set', () => {
    expect(resolveInitialTheme({ prefersDark: false }, 'eink')).toBe('eink');
    expect(resolveInitialTheme({ prefersDark: true }, 'light')).toBe('light');
  });

  it('follows system dark when nothing stored', () => {
    expect(resolveInitialTheme({ prefersDark: true }, undefined)).toBe('dark');
  });

  it('follows system light when nothing stored', () => {
    expect(resolveInitialTheme({ prefersDark: false }, undefined)).toBe('light');
  });
});
