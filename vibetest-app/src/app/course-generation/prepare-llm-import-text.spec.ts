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

  it('unwraps a plain fence when body starts with brace', () => {
    expect(prepareLlmImportText('text\n```\n{"schemaVersion":1}\n```')).toBe('{"schemaVersion":1}');
  });

  it('rejects an empty response', () => {
    expect(() => prepareLlmImportText('  ')).toThrow('Пустой ответ модели.');
  });

  it('rejects prose without json', () => {
    expect(() => prepareLlmImportText('Sorry, I cannot help')).toThrow('Context Length');
  });

  it('accepts raw json whose string fields contain a json fence', () => {
    const raw = JSON.stringify(
      { schemaVersion: 1, content: '## X\n\n```json\n{"a":1}\n```' },
      null,
      2,
    );
    expect(prepareLlmImportText(raw)).toBe(raw);
  });

  it('rejects an unclosed json fence', () => {
    expect(() => prepareLlmImportText('Here:\n```json\n{"schemaVersion":1}')).toThrow(
      'не закрыт',
    );
  });
});
