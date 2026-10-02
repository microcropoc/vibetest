import { describe, expect, it } from 'vitest';

import { VALID_OUTLINE } from './__fixtures__/outline-fixtures';
import type { CourseOutline } from './course-outline.model';
import { parseCourseOutline, parseCourseOutlineText } from './parse-course-outline';

describe('parseCourseOutline', () => {
  it('accepts a valid outline', () => {
    expect(parseCourseOutline(VALID_OUTLINE)).toEqual(VALID_OUTLINE);
  });

  it('rejects unknown fields', () => {
    expect(() => parseCourseOutline({ ...VALID_OUTLINE, extra: true })).toThrow();
  });

  it('rejects title and description that course-import would not accept', () => {
    expect(() => parseCourseOutline({ ...VALID_OUTLINE, title: 'x'.repeat(121) })).toThrow();
    expect(() => parseCourseOutline({ ...VALID_OUTLINE, description: '' })).toThrow();
  });
});

describe('parseCourseOutlineText', () => {
  it('returns the outline for valid JSON', () => {
    const result = parseCourseOutlineText(JSON.stringify(VALID_OUTLINE));
    expect(result).toEqual({ ok: true, outline: VALID_OUTLINE });
  });

  it('reports invalid JSON', () => {
    const result = parseCourseOutlineText('{');
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.stage).toBe('json');
  });

  it('reports schema issues with paths', () => {
    const result = parseCourseOutlineText(JSON.stringify({ ...VALID_OUTLINE, modules: [] }));
    expect(result.ok === false && result.stage).toBe('zod');
    expect(result.ok === false && result.issues[0]?.path).toBe('modules');
  });

  it('requires theory, svg and quiz in every module', () => {
    const outline: CourseOutline = {
      ...VALID_OUTLINE,
      modules: [
        {
          ...VALID_OUTLINE.modules[0]!,
          steps: [{ type: 'theory', title: 'Только теория', summary: 'Без svg и quiz' }],
        },
      ],
    };
    const result = parseCourseOutlineText(JSON.stringify(outline));
    expect(result.ok === false && result.stage).toBe('semantic');
    expect(result.ok === false && result.issues.map((issue) => issue.message)).toEqual([
      'В модуле «Основы» нет шага типа svg.',
      'В модуле «Основы» нет шага типа quiz.',
    ]);
  });
});
