import {
  BUNDLED_COURSE_SCHEMA_URL,
  loadBundledCourseSchema,
  prettyPrintJson,
} from './bundled-course-schema';

describe('bundled-course-schema', () => {
  it('pretty-prints JSON with indentation', () => {
    expect(prettyPrintJson({ schemaVersion: 1 })).toBe('{\n  "schemaVersion": 1\n}');
  });

  it('loads schema from bundled URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ $schema: 'https://json-schema.org/draft/2020-12/schema' }),
    });

    const schema = await loadBundledCourseSchema(fetchFn);

    expect(fetchFn).toHaveBeenCalledWith(BUNDLED_COURSE_SCHEMA_URL);
    expect(schema).toEqual({ $schema: 'https://json-schema.org/draft/2020-12/schema' });
  });

  it('throws when fetch fails', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(loadBundledCourseSchema(fetchFn)).rejects.toThrow('Failed to load course schema (404)');
  });
});
