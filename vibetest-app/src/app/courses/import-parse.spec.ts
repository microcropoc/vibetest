import { FIXTURE_STEP_SQLITE_ID, minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { parseImportCourseText } from './import-parse';

describe('parseImportCourseText', () => {
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

  it('returns semantic issues without proceeding', () => {
    const json = {
      ...minimalValidCourseJson(),
      modules: [
        {
          ...(minimalValidCourseJson()['modules'] as object[])[0],
          steps: [
            {
              stepId: FIXTURE_STEP_SQLITE_ID,
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

  it('returns course on success', () => {
    const result = parseImportCourseText(JSON.stringify(minimalValidCourseJson()));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.course.title).toBe('Test course');
    }
  });
});
