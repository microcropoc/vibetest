import { parseImportModuleText } from './import-module-parse';

describe('parseImportModuleText', () => {
  it('parses valid module JSON', () => {
    const text = JSON.stringify({
      schemaVersion: 1,
      title: 'Module',
      steps: [{ type: 'theory', title: 'T', content: 'x' }],
    });

    const result = parseImportModuleText(text);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.module.title).toBe('Module');
      expect(result.module.steps).toHaveLength(1);
    }
  });

  it('returns zod stage for invalid shape (does not run module semantic)', () => {
    const text = JSON.stringify({
      schemaVersion: 1,
      title: 'Module',
      steps: [],
    });

    const result = parseImportModuleText(text);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('zod');
    }
  });
});
