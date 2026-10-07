import {
  isExecutionRequest,
  parseExecutionRequest,
  parseExecutionResponse,
  requestIdFromUnknown,
} from './execution-messages';

describe('execution message parse', () => {
  it('parses ping request and pong response', () => {
    expect(parseExecutionRequest({ type: 'ping', id: '1' })).toEqual({
      type: 'ping',
      id: '1',
    });
    expect(parseExecutionResponse({ type: 'pong', id: '1' })).toEqual({
      type: 'pong',
      id: '1',
    });
  });

  it('rejects unknown shapes', () => {
    expect(isExecutionRequest({ type: 'run', id: '1' })).toBe(false);
    expect(() => parseExecutionResponse({ type: 'pong' })).toThrow();
  });

  it('parses sqliteLoad request and sqliteLoaded response', () => {
    expect(
      parseExecutionRequest({ type: 'sqliteLoad', id: 'l', wasmUrl: 'https://x.test/sql-wasm.wasm' }),
    ).toEqual({ type: 'sqliteLoad', id: 'l', wasmUrl: 'https://x.test/sql-wasm.wasm' });
    expect(parseExecutionResponse({ type: 'sqliteLoaded', id: 'l' })).toEqual({
      type: 'sqliteLoaded',
      id: 'l',
    });
  });
});

describe('requestIdFromUnknown', () => {
  it('returns the id of an invalid request so the error reply can be matched', () => {
    expect(requestIdFromUnknown({ type: 'sqliteInit', id: 'sql-1--1-init' })).toBe('sql-1--1-init');
  });

  it('falls back to unknown without a usable id', () => {
    expect(requestIdFromUnknown(null)).toBe('unknown');
    expect(requestIdFromUnknown('text')).toBe('unknown');
    expect(requestIdFromUnknown({ id: 42 })).toBe('unknown');
    expect(requestIdFromUnknown({ id: '' })).toBe('unknown');
  });
});
