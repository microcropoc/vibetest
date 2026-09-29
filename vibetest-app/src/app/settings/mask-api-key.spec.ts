import { maskApiKey } from './mask-api-key';

describe('maskApiKey', () => {
  it('shows only the last four characters', () => {
    const masked = maskApiKey('sk-1234567890abcd');
    expect(masked.endsWith('abcd')).toBe(true);
    expect(masked).not.toContain('sk-123');
  });

  it('fully hides short keys', () => {
    expect(maskApiKey('abc')).toBe('••••');
  });

  it('marks an empty key as not set', () => {
    expect(maskApiKey('   ')).toBe('(не задан)');
  });
});
