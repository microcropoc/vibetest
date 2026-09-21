import { describe, expect, it } from 'vitest';

import { formatBuildVersionLabel } from './format-build-version-label';

describe('formatBuildVersionLabel', () => {
  it('joins hash and subject with middle dot', () => {
    expect(formatBuildVersionLabel('7e7a1e2', 'vt-36: example')).toBe('7e7a1e2 · vt-36: example');
  });

  it('uses fallbacks for empty strings', () => {
    expect(formatBuildVersionLabel('  ', '')).toBe('unknown · dev');
  });
});
