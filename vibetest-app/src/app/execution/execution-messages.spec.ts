import {
  isExecutionRequest,
  parseExecutionRequest,
  parseExecutionResponse,
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
});
