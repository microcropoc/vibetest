import { parseLlmProfiles } from './parse-llm-profiles';

describe('parseLlmProfiles', () => {
  const validProfile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    label: 'Local LM Studio',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'sk-test',
    model: 'model-id',
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
});
