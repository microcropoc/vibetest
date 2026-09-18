import { buildStepProgressKey, parseStepProgressKey } from './step-progress-key';

describe('step progress key', () => {
  it('builds and parses composite key', () => {
    const key = buildStepProgressKey('c1', 'm1', 's1');
    expect(key).toBe('c1::m1::s1');
    expect(parseStepProgressKey(key)).toEqual({
      courseId: 'c1',
      moduleId: 'm1',
      stepId: 's1',
    });
  });

  it('rejects malformed keys', () => {
    expect(() => parseStepProgressKey('c1::m1')).toThrow(/Invalid step progress key/);
  });
});
