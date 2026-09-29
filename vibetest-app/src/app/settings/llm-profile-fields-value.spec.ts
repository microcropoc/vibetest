import { emptyLlmProfileFieldsValue, llmProfileFieldsError } from './llm-profile-fields-value';

describe('llmProfileFieldsError', () => {
  const valid = {
    label: 'Local',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: '',
    model: 'm',
    structuredOutput: false,
  };

  it('accepts filled fields with an empty key', () => {
    expect(llmProfileFieldsError(valid)).toBeNull();
  });

  it('requires a label on an empty form', () => {
    expect(llmProfileFieldsError(emptyLlmProfileFieldsValue())).toBe('Заполните поле «Название».');
  });

  it('treats whitespace-only model as missing', () => {
    expect(llmProfileFieldsError({ ...valid, model: '   ' })).toBe('Заполните поле «Model».');
  });

  it('reports fields over the length limit', () => {
    expect(llmProfileFieldsError({ ...valid, apiKey: 'x'.repeat(501) })).toBe(
      'Поле «API key» слишком длинное.',
    );
  });
});
