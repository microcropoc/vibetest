import type { LlmProfile } from './llm-profile.model';
import { profileFromFields, removeLlmProfile, upsertLlmProfile } from './upsert-llm-profile';

const ID_A = '550e8400-e29b-41d4-a716-446655440000';
const ID_B = '550e8400-e29b-41d4-a716-446655440001';

function profile(id: string, label: string): LlmProfile {
  return {
    id,
    label,
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'k',
    model: 'm',
    structuredOutput: false,
  };
}

describe('upsertLlmProfile', () => {
  it('appends a profile with a new id', () => {
    expect(upsertLlmProfile([profile(ID_A, 'A')], profile(ID_B, 'B'))).toEqual([
      profile(ID_A, 'A'),
      profile(ID_B, 'B'),
    ]);
  });

  it('replaces a profile with the same id in place', () => {
    const list = [profile(ID_A, 'A'), profile(ID_B, 'B')];
    expect(upsertLlmProfile(list, profile(ID_A, 'A2'))).toEqual([
      profile(ID_A, 'A2'),
      profile(ID_B, 'B'),
    ]);
    expect(list[0]?.label).toBe('A');
  });
});

describe('removeLlmProfile', () => {
  it('removes only the matching id', () => {
    expect(removeLlmProfile([profile(ID_A, 'A'), profile(ID_B, 'B')], ID_A)).toEqual([
      profile(ID_B, 'B'),
    ]);
  });
});

describe('profileFromFields', () => {
  it('trims text fields and keeps the key as typed', () => {
    expect(
      profileFromFields(
        {
          label: ' Local ',
          baseUrl: ' http://h/v1 ',
          apiKey: ' k ',
          model: ' m ',
          structuredOutput: false,
        },
        ID_A,
      ),
    ).toEqual({
      id: ID_A,
      label: 'Local',
      baseUrl: 'http://h/v1',
      apiKey: ' k ',
      model: 'm',
      structuredOutput: false,
    });
  });
});
