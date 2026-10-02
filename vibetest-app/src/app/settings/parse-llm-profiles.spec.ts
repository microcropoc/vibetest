import {
  findLlmProfileDraftIssue,
  isValidLlmContextLength,
  parseLlmProfiles,
} from './parse-llm-profiles';

describe('parseLlmProfiles', () => {
  const validProfile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    label: 'Local LM Studio',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'sk-test',
    model: 'model-id',
    structuredOutput: false,
    contextLength: 8192,
  };

  it('accepts a valid profile list', () => {
    expect(parseLlmProfiles([validProfile])).toEqual([validProfile]);
  });

  it('rejects invalid uuid', () => {
    expect(() =>
      parseLlmProfiles([{ ...validProfile, id: 'not-uuid' }]),
    ).toThrow();
  });

  it('rejects empty label', () => {
    expect(() => parseLlmProfiles([{ ...validProfile, label: '' }])).toThrow();
  });

  it('defaults structuredOutput to false for legacy rows', () => {
    const { structuredOutput, ...legacy } = validProfile;
    void structuredOutput;
    expect(parseLlmProfiles([legacy])[0]?.structuredOutput).toBe(false);
  });

  it('defaults contextLength to null for legacy rows', () => {
    const { contextLength, ...legacy } = validProfile;
    void contextLength;
    expect(parseLlmProfiles([legacy])[0]?.contextLength).toBeNull();
  });

  it.each([100, 8192.5, Number.NaN, 3_000_000])('rejects contextLength %s', (contextLength) => {
    expect(() => parseLlmProfiles([{ ...validProfile, contextLength }])).toThrow();
  });
});

describe('isValidLlmContextLength', () => {
  it.each([512, 8192, 2_000_000])('accepts %s', (value) => {
    expect(isValidLlmContextLength(value)).toBe(true);
  });

  it.each([8, 511, 8192.5, Number.NaN, 2_000_001])('rejects %s', (value) => {
    expect(isValidLlmContextLength(value)).toBe(false);
  });
});

describe('findLlmProfileDraftIssue', () => {
  const draft = {
    label: 'Local',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: '',
    model: 'm',
    structuredOutput: false,
    contextLength: null,
  };

  it('accepts a draft without contextLength', () => {
    expect(findLlmProfileDraftIssue(draft)).toBeNull();
  });

  it('reports an out-of-range contextLength as invalid', () => {
    expect(findLlmProfileDraftIssue({ ...draft, contextLength: 3_000_000 })).toEqual({
      field: 'contextLength',
      kind: 'invalid',
    });
  });
});
