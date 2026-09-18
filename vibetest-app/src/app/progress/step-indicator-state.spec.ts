import { stepIndicatorState } from './step-indicator-state';

describe('stepIndicatorState', () => {
  it('prioritizes current over failed and completed', () => {
    expect(
      stepIndicatorState({ status: 'completed', lastCheckFailed: true }, true),
    ).toBe('current');
  });

  it('shows failed before completed when not current', () => {
    expect(
      stepIndicatorState({ status: 'completed', lastCheckFailed: true }, false),
    ).toBe('failed');
    expect(
      stepIndicatorState({ status: 'in-progress', lastCheckFailed: true }, false),
    ).toBe('failed');
  });

  it('shows completed when not failed', () => {
    expect(
      stepIndicatorState({ status: 'completed', lastCheckFailed: false }, false),
    ).toBe('completed');
  });

  it('shows untouched for not-started and in-progress without failed', () => {
    expect(
      stepIndicatorState({ status: 'not-started', lastCheckFailed: false }, false),
    ).toBe('untouched');
    expect(
      stepIndicatorState({ status: 'in-progress', lastCheckFailed: false }, false),
    ).toBe('untouched');
  });
});
