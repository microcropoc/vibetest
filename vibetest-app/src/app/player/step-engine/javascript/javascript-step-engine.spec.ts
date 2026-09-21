import { parseCourse } from '../../../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_CREATED_AT,
  FIXTURE_MODULE_ID,
} from '../../../courses/__fixtures__/course-fixtures';

import {
  applyJavascriptPracticeResult,
  createJavascriptStepEngine,
} from './javascript-step-engine';

describe('javascriptStepEngine', () => {
  const engine = createJavascriptStepEngine();

  function javascriptStepFromFixture() {
    const course = parseCourse({
      schemaVersion: 1,
      courseId: FIXTURE_COURSE_ID,
      createdAt: FIXTURE_CREATED_AT,
      title: 'T',
      description: 'D',
      modules: [
        {
          moduleId: FIXTURE_MODULE_ID,
          title: 'M',
          steps: [
            {
              stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
              type: 'javascript',
              title: 'JS',
              content: {
                description: 'd',
                starterCode: 'const add=(a,b)=>0;',
                referenceSolution: 'const add=(a,b)=>a+b;',
                setup: '',
                functionName: 'add',
                timeoutMs: 2000,
                tests: [{ args: [1, 1] }],
              },
            },
          ],
        },
      ],
    });
    const step = course.modules[0].steps[0];
    if (step.type !== 'javascript') {
      throw new Error('expected javascript');
    }
    return step;
  }

  it('applyJavascriptPracticeResult marks success and failure', () => {
    const step = javascriptStepFromFixture();
    let state = engine.createInitial(step);
    state = applyJavascriptPracticeResult(state, { ok: true });
    expect(state.status).toBe('completed');
    state = applyJavascriptPracticeResult(state, { ok: false, failedTestIndex: 0, message: 'x' });
    expect(state.lastCheckFailed).toBe(true);
  });

  it('retry restores starter draft', () => {
    const step = javascriptStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setDraftCode', draftCode: 'edited' });
    state = engine.reduce(state, { kind: 'retry' });
    expect(state.draft.draftCode).toBe(step.content.starterCode);
  });
});
