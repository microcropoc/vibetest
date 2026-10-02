import { describe, expect, it } from 'vitest';

import { outlineWithModules } from '../course-generation/__fixtures__/outline-fixtures';

import { parseOutlineResponse } from './parse-outline-response';

const OUTLINE = outlineWithModules('Основы', 'Группы');

describe('parseOutlineResponse', () => {
  it('returns empty for blank text', () => {
    expect(parseOutlineResponse('  \n')).toEqual({ kind: 'empty' });
  });

  it('accepts an outline inside a ```json fence with surrounding text', () => {
    const text = `Вот план:\n\`\`\`json\n${JSON.stringify(OUTLINE)}\n\`\`\`\nГотово.`;

    expect(parseOutlineResponse(text)).toEqual({ kind: 'valid', outline: OUTLINE });
  });

  it('reports a missing JSON without the LM Studio hint', () => {
    const result = parseOutlineResponse('Не могу составить план');

    expect(result.kind).toBe('invalid');
    if (result.kind !== 'invalid') {
      return;
    }
    expect(result.issues[0]!.path).toBe('json');
    expect(result.issues[0]!.message).toBe('Ответ не содержит JSON для импорта.');
    expect(result.issues[0]!.message).not.toContain('LM Studio');
  });

  it('accepts an outline whose modules lack svg and quiz steps', () => {
    const outline = {
      ...OUTLINE,
      modules: [{ ...OUTLINE.modules[0]!, steps: OUTLINE.modules[0]!.steps.slice(0, 1) }],
    };

    expect(parseOutlineResponse(JSON.stringify(outline))).toEqual({ kind: 'valid', outline });
  });

  it('reports schema issues of the outline', () => {
    const result = parseOutlineResponse(JSON.stringify({ ...OUTLINE, modules: [] }));

    expect(result.kind).toBe('invalid');
    expect(result.kind === 'invalid' && result.issues[0]!.path).toBe('modules');
  });
});
