import { describe, expect, it } from 'vitest';

import { UnwrapJsonImportTextError, unwrapJsonImportText } from './unwrap-json-import-text';

describe('unwrapJsonImportText', () => {
  it('returns trimmed raw JSON object', () => {
    expect(unwrapJsonImportText('  {"a":1}  ')).toBe('{"a":1}');
  });

  it('unwraps a strict ```json fenced block', () => {
    const input = '```json\n{"schemaVersion":1}\n```';
    expect(unwrapJsonImportText(input)).toBe('{"schemaVersion":1}');
  });

  it('allows outer whitespace around fenced block', () => {
    const input = '\n\n```json\n{"x":true}\n```\n';
    expect(unwrapJsonImportText(input)).toBe('{"x":true}');
  });

  it('rejects prose before fenced block', () => {
    expect(() => unwrapJsonImportText('Here:\n```json\n{}\n```')).toThrow(
      UnwrapJsonImportTextError,
    );
  });

  it('rejects wrong fence language tag', () => {
    expect(() => unwrapJsonImportText('```javascript\n{}\n```')).toThrow(
      UnwrapJsonImportTextError,
    );
  });
});
