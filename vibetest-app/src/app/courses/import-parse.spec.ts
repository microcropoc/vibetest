import { FIXTURE_CREATED_AT, minimalValidCourseJson, minimalValidImportJson } from './__fixtures__/course-fixtures';
import { parseImportCourseText } from './import-parse';

describe('parseImportCourseText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns json stage error for invalid JSON', () => {
    const result = parseImportCourseText('{');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('json');
      expect(result.issues[0]?.path).toBe('json');
    }
  });

  it('returns zod stage error for schema mismatch', () => {
    const result = parseImportCourseText(JSON.stringify({ schemaVersion: 2 }));
    expect(result).toEqual({
      ok: false,
      stage: 'zod',
      issues: expect.arrayContaining([
        expect.objectContaining({ path: expect.any(String), message: expect.any(String) }),
      ]),
    });
  });

  it('rejects canonical course JSON with UUID fields', () => {
    const result = parseImportCourseText(JSON.stringify(minimalValidCourseJson()));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('zod');
    }
  });

  it('returns semantic issues without proceeding', () => {
    const json = {
      ...minimalValidImportJson(),
      modules: [
        {
          title: 'Module 1',
          steps: [
            {
              type: 'sqlite',
              title: 'Bad reset',
              content: {
                description: 'D',
                setup: 'CREATE TABLE t(x);',
                reset: 'INSERT INTO t VALUES(1);',
                starterCode: 'SELECT 1;',
                referenceSolution: 'SELECT 1;',
                orderMatters: true,
                timeoutMs: 2000,
                tests: [{ seed: '' }],
              },
            },
          ],
        },
      ],
    };
    const result = parseImportCourseText(JSON.stringify(json));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('semantic');
      expect(result.issues.some((i) => i.path.includes('reset'))).toBe(true);
    }
  });

  it('accepts import JSON wrapped in ```json fence', () => {
    const uuids = [
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    ];
    let i = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => (uuids[i++] ?? uuids[0]!) as `${string}-${string}-${string}-${string}-${string}`,
    );
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(FIXTURE_CREATED_AT);

    const body = JSON.stringify(minimalValidImportJson());
    const fenced = `\`\`\`json\n${body}\n\`\`\``;
    const result = parseImportCourseText(fenced);
    expect(result.ok).toBe(true);
  });

  it('returns json stage error for prose around fenced block', () => {
    const result = parseImportCourseText('Note:\n```json\n{}\n```');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('json');
      expect(result.issues[0]?.message).toContain('```json');
    }
  });

  it('returns course on success with createdAt', () => {
    const uuids = [
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    ];
    let i = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => (uuids[i++] ?? uuids[0]!) as `${string}-${string}-${string}-${string}-${string}`,
    );
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(FIXTURE_CREATED_AT);

    const result = parseImportCourseText(JSON.stringify(minimalValidImportJson()));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.course.title).toBe('Test course');
      expect(result.course.createdAt).toBe(FIXTURE_CREATED_AT);
    }
  });
});
