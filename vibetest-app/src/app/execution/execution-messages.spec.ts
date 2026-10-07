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

  it('parses sqliteInit with comparison options', () => {
    const request = {
      type: 'sqliteInit',
      id: 'i',
      wasmUrl: 'https://x.test/sql-wasm.wasm',
      setup: '',
      userQuery: 'SELECT 1',
      referenceQuery: 'SELECT 1',
      orderMatters: false,
      checkColumnNames: true,
      floatTolerance: 0.001,
      checkQuery: 'SELECT * FROM t',
    };
    expect(parseExecutionRequest(request)).toEqual(request);
  });

  it('parses sqliteCaseResult with a result diff', () => {
    const response = {
      type: 'sqliteCaseResult',
      id: 'c',
      pass: false,
      message: 'Row count differs: expected 1, got 0',
      diff: {
        user: { columns: ['id'], rows: [], firstRow: 0, rowCount: 0 },
        expected: { columns: ['id'], rows: [[1, 'a', null]], firstRow: 0, rowCount: 1 },
        userError: 'no such column: x',
      },
      userMs: 1,
      referenceMs: 1,
    };
    expect(parseExecutionResponse(response)).toEqual(response);
    expect(() =>
      parseExecutionResponse({
        ...response,
        diff: { user: { columns: ['id'], rows: [[{}]], firstRow: 0, rowCount: 1 } },
      }),
    ).toThrow();
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
