import {
  bundledCourseSchemaUrl,
  loadBundledCourseSchema,
  prettyPrintJson,
} from './bundled-course-schema';

describe('bundled-course-schema', () => {
  it('pretty-prints JSON with indentation', () => {
    expect(prettyPrintJson({ schemaVersion: 1 })).toBe('{\n  "schemaVersion": 1\n}');
  });

  it('resolves schema URL from document baseURI', () => {
    const previousBase = document.baseURI;
    Object.defineProperty(document, 'baseURI', {
      configurable: true,
      value: 'https://example.test/vibetest/',
    });
    try {
      expect(bundledCourseSchemaUrl()).toBe(
        'https://example.test/vibetest/schemas/course.schema.json',
      );
    } finally {
      Object.defineProperty(document, 'baseURI', {
        configurable: true,
        value: previousBase,
      });
    }
  });

  it('loads schema from bundled URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ $schema: 'https://json-schema.org/draft/2020-12/schema' }),
    });

    const schema = await loadBundledCourseSchema(fetchFn);

    expect(fetchFn).toHaveBeenCalledWith(bundledCourseSchemaUrl());
    expect(schema).toEqual({ $schema: 'https://json-schema.org/draft/2020-12/schema' });
  });

  it('throws when fetch fails', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(loadBundledCourseSchema(fetchFn)).rejects.toThrow('Failed to load course schema (404)');
  });
});
