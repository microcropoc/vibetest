import { applyThemeChromeMeta, applyThemeToDocument } from './apply-theme-to-document';

describe('applyThemeToDocument', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('meta[name="theme-color"]')?.remove();
    document.querySelector('meta[name="color-scheme"]')?.remove();
  });

  it('sets data-theme and theme-color meta for dark', () => {
    applyThemeToDocument(document.documentElement, 'dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    expect(themeColor?.content).toBe('#121212');
    const colorScheme = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement;
    expect(colorScheme?.content).toBe('dark');
  });

  it('updates existing theme-color meta when theme changes', () => {
    applyThemeChromeMeta('light');
    applyThemeChromeMeta('eink');

    const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    expect(themeColor?.content).toBe('#ffffff');
  });
});
