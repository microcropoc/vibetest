import { prepareLlmImportText } from './prepare-llm-import-text';

describe('prepareLlmImportText', () => {
  it('unwraps raw json', () => {
    expect(prepareLlmImportText('  {"schemaVersion":1}  ')).toBe('{"schemaVersion":1}');
  });

  it('unwraps a strict json fence', () => {
    expect(prepareLlmImportText('```json\n{"schemaVersion":1}\n```')).toBe('{"schemaVersion":1}');
  });

  it('unwraps the first fenced block inside prose', () => {
    expect(prepareLlmImportText('Note\n```json\n{"schemaVersion":1}\n```\nDone')).toBe(
      '{"schemaVersion":1}',
    );
  });

  it('rejects an empty response', () => {
    expect(() => prepareLlmImportText('  ')).toThrow('Пустой ответ модели.');
  });

  it('rejects prose without json', () => {
    expect(() => prepareLlmImportText('Sorry, I cannot help')).toThrow('```json');
  });
});
