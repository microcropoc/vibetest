import {
  extractFirstJsonFence,
  extractFirstPlainJsonFence,
  hasUnclosedJsonFence,
} from './extract-first-json-fence';

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

describe('extractFirstPlainJsonFence', () => {
  it('extracts plain fence with json object', () => {
    expect(extractFirstPlainJsonFence('x\n```\n{"a":1}\n```')).toBe('{"a":1}');
  });
});

describe('hasUnclosedJsonFence', () => {
  it('detects unclosed json fence', () => {
    expect(hasUnclosedJsonFence('```json\n{"a":1}')).toBe(true);
  });

  it('returns false for closed fence', () => {
    expect(hasUnclosedJsonFence('```json\n{"a":1}\n```')).toBe(false);
  });
});
