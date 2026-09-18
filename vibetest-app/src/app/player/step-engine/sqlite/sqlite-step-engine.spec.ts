import { parseCourse } from '../../../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
} from '../../../courses/__fixtures__/course-fixtures';

import {
  applySqlitePracticeResult,
  createSqliteStepEngine,
} from './sqlite-step-engine';

describe('sqliteStepEngine', () => {
  it('restores starter code on retry', () => {
    const course = parseCourse({
      schemaVersion: 1,
      courseId: FIXTURE_COURSE_ID,
      title: 'T',
      description: 'D',
      modules: [
        {
          moduleId: FIXTURE_MODULE_ID,
          title: 'M',
          steps: [
            {
              stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
              type: 'sqlite',
              title: 'Q',
              content: {
                description: 'D',
                setup: 'CREATE TABLE t(x INT);',
                starterCode: 'SELECT 1;',
                referenceSolution: 'SELECT 1;',
                orderMatters: true,
                timeoutMs: 2000,
                tests: [{ seed: 'INSERT INTO t VALUES(1);' }],
              },
            },
          ],
        },
      ],
    });
    const step = course.modules[0].steps[0];
    const engine = createSqliteStepEngine();
    let state = engine.createInitial(step, undefined);
    state = engine.reduce(state, { kind: 'setDraftCode', draftCode: 'SELECT 2;' });
    state = engine.reduce(state, { kind: 'retry' });
    expect(state.draft.draftCode).toBe('SELECT 1;');
  });

  it('applySqlitePracticeResult marks success and failure', () => {
    const course = parseCourse({
      schemaVersion: 1,
      courseId: FIXTURE_COURSE_ID,
      title: 'T',
      description: 'D',
      modules: [
        {
          moduleId: FIXTURE_MODULE_ID,
          title: 'M',
          steps: [
            {
              stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
              type: 'sqlite',
              title: 'Q',
              content: {
                description: 'D',
                setup: '',
                starterCode: 'SELECT 1;',
                referenceSolution: 'SELECT 1;',
                orderMatters: false,
                timeoutMs: 2000,
                tests: [{ seed: '' }],
              },
            },
          ],
        },
      ],
    });
    const engine = createSqliteStepEngine();
    let state = engine.createInitial(course.modules[0].steps[0], undefined);
    state = applySqlitePracticeResult(state, { ok: true });
    expect(state.status).toBe('completed');
    state = applySqlitePracticeResult(state, {
      ok: false,
      failedTestIndex: 0,
      message: 'no',
    });
    expect(state.status).toBe('completed');
    expect(state.lastCheckFailed).toBe(true);
  });
});
