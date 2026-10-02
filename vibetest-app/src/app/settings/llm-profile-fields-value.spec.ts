import {
  emptyLlmProfileFieldsValue,
  llmProfileFieldsError,
  parseContextLengthInput,
} from './llm-profile-fields-value';

describe('llmProfileFieldsError', () => {
  const valid = {
    label: 'Local',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: '',
    model: 'm',
    structuredOutput: false,
    contextLength: null,
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

  it('accepts a Context Length in range', () => {
    expect(llmProfileFieldsError({ ...valid, contextLength: 32768 })).toBeNull();
  });

  it.each([100, 8192.5, Number.NaN])('rejects Context Length %s', (contextLength) => {
    expect(llmProfileFieldsError({ ...valid, contextLength })).toBe(
      'Поле «Context Length» должно быть целым числом от 512 до 2000000.',
    );
  });
});

describe('parseContextLengthInput', () => {
  it('treats empty input as not set', () => {
    expect(parseContextLengthInput('  ')).toBeNull();
  });

  it('reads a number', () => {
    expect(parseContextLengthInput(' 8192 ')).toBe(8192);
  });
});
