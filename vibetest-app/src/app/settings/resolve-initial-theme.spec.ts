import { resolveInitialTheme } from './resolve-initial-theme';

describe('resolveInitialTheme', () => {
  it('returns stored theme when set', () => {
    expect(resolveInitialTheme({ prefersDark: false }, 'eink')).toBe('eink');
    expect(resolveInitialTheme({ prefersDark: true }, 'light')).toBe('light');
  });

  it('defaults to dark when nothing stored, regardless of system scheme', () => {
    expect(resolveInitialTheme({ prefersDark: true }, undefined)).toBe('dark');
    expect(resolveInitialTheme({ prefersDark: false }, undefined)).toBe('dark');
  });
});
