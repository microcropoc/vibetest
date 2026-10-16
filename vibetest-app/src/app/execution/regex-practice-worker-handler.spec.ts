import { requestIdFromUnknown } from './execution-messages';
import {
  createRegexPracticeWorkerState,
  handleRegexPracticeWorkerMessage,
} from './regex-practice-worker-handler';

describe('handleRegexPracticeWorkerMessage', () => {
  it('returns regexInited after successful init', () => {
    const state = createRegexPracticeWorkerState();
    const posted: unknown[] = [];
    handleRegexPracticeWorkerMessage(
      {
        type: 'regexInit',
        id: 'init-1',
        userPattern: '^\\d+$',
        referencePattern: '^\\d+$',
      },
      (msg) => posted.push(msg),
      state,
    );
    expect(posted).toEqual([{ type: 'regexInited', id: 'init-1' }]);
    expect(state.session).toBeDefined();
  });

  it('returns error with request id for invalid pattern on init', () => {
    const state = createRegexPracticeWorkerState();
    const posted: unknown[] = [];
    handleRegexPracticeWorkerMessage(
      {
        type: 'regexInit',
        id: 'init-bad',
        userPattern: '(',
        referencePattern: 'x',
      },
      (msg) => posted.push(msg),
      state,
    );
    expect(posted).toEqual([
      { type: 'error', id: 'init-bad', message: 'Invalid regular expression' },
    ]);
    expect(state.session).toBeUndefined();
  });

  it('returns error when runCase before init', () => {
    const state = createRegexPracticeWorkerState();
    const posted: unknown[] = [];
    handleRegexPracticeWorkerMessage(
      { type: 'regexRunCase', id: 'case-0', input: 'x' },
      (msg) => posted.push(msg),
      state,
    );
    expect(posted).toEqual([
      { type: 'error', id: 'case-0', message: 'Worker not initialized' },
    ]);
  });

  it('runs a case after init', () => {
    const state = createRegexPracticeWorkerState();
    const posted: unknown[] = [];
    const post = (msg: unknown) => posted.push(msg);
    handleRegexPracticeWorkerMessage(
      {
        type: 'regexInit',
        id: 'i',
        userPattern: '^a$',
        referencePattern: '^a$',
      },
      post,
      state,
    );
    handleRegexPracticeWorkerMessage(
      { type: 'regexRunCase', id: 'c', input: 'a' },
      post,
      state,
    );
    expect(posted[1]).toEqual(
      expect.objectContaining({
        type: 'regexCaseResult',
        id: 'c',
        pass: true,
        userResult: true,
        referenceResult: true,
      }),
    );
  });
});

describe('requestIdFromUnknown (regex worker outer catch)', () => {
  it('preserves id from malformed request', () => {
    expect(requestIdFromUnknown({ type: 'regexInit', id: 'regex-0--1-init' })).toBe(
      'regex-0--1-init',
    );
    expect(requestIdFromUnknown(null)).toBe('unknown');
  });
});
