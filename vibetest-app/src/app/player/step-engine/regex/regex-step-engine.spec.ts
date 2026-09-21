import { parseCourse } from '../../../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_CREATED_AT,
  FIXTURE_MODULE_ID,
} from '../../../courses/__fixtures__/course-fixtures';

import { applyRegexPracticeResult, createRegexStepEngine } from './regex-step-engine';

describe('regexStepEngine', () => {
  it('restores starter pattern on retry', () => {
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
              type: 'regex',
              title: 'Q',
              content: {
                description: 'D',
                starterCode: '^a$',
                referenceSolution: '^a$',
                timeoutMs: 1000,
                tests: [{ input: 'a' }],
              },
            },
          ],
        },
      ],
    });
    const step = course.modules[0].steps[0];
    const engine = createRegexStepEngine();
    let state = engine.createInitial(step, undefined);
    state = engine.reduce(state, { kind: 'setDraftPattern', pattern: '^b$' });
    state = engine.reduce(state, { kind: 'retry' });
    expect(state.draft.pattern).toBe('^a$');
  });

  it('applyRegexPracticeResult updates status', () => {
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
              type: 'regex',
              title: 'Q',
              content: {
                description: 'D',
                starterCode: '.',
                referenceSolution: '.',
                timeoutMs: 1000,
                tests: [{ input: 'x' }],
              },
            },
          ],
        },
      ],
    });
    const engine = createRegexStepEngine();
    let state = engine.createInitial(course.modules[0].steps[0], undefined);
    state = applyRegexPracticeResult(state, { ok: true });
    expect(state.status).toBe('completed');
  });
});
