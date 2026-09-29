import { extractFirstJsonFence } from './extract-first-json-fence';

describe('extractFirstJsonFence', () => {
  it('extracts first json fence from surrounding text', () => {
    expect(extractFirstJsonFence('Here:\n```json\n{"x":1}\n```\nThanks')).toBe(
      '```json\n{"x":1}\n```',
    );
  });

  it('returns undefined when there is no json fence', () => {
    expect(extractFirstJsonFence('no code here')).toBeUndefined();
  });
});
