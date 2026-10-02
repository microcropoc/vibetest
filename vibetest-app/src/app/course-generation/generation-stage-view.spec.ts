import { describe, expect, it } from 'vitest';

import { outlineWithModules } from './__fixtures__/outline-fixtures';
import { buildGenerationStageViews } from './generation-stage-view';
import { INITIAL_STAGED_GENERATION_STATE } from './staged-course-generator.service';

const OUTLINE = outlineWithModules('Основы', 'Квантификаторы', 'Группы');

describe('buildGenerationStageViews', () => {
  it('shows outline and course stages before the plan is known', () => {
    const views = buildGenerationStageViews(
      INITIAL_STAGED_GENERATION_STATE,
      { kind: 'outline' },
      { attempt: 1, maxAttempts: 3 },
      null,
    );

    expect(views.map((view) => [view.label, view.status, view.attemptLabel])).toEqual([
      ['План курса', 'running', null],
      ['Курс и модуль 1', 'pending', null],
    ]);
  });

  it('lists every outline module with done, running and pending statuses', () => {
    const views = buildGenerationStageViews(
      { outline: OUTLINE, courseId: 'c1', nextModuleIndex: 1 },
      { kind: 'module', index: 1 },
      { attempt: 2, maxAttempts: 3 },
      null,
    );

    expect(views.map((view) => [view.label, view.status, view.attemptLabel])).toEqual([
      ['План курса', 'done', null],
      ['Курс и модуль 1: «Основы»', 'done', null],
      ['Модуль 2 из 3: «Квантификаторы»', 'running', 'попытка 2 из 3'],
      ['Модуль 3 из 3: «Группы»', 'pending', null],
    ]);
  });

  it('marks the failed stage', () => {
    const views = buildGenerationStageViews(
      { outline: OUTLINE, courseId: null, nextModuleIndex: 0 },
      null,
      null,
      { kind: 'module', index: 0 },
    );

    expect(views[1]?.status).toBe('failed');
    expect(views[2]?.status).toBe('pending');
  });
});
