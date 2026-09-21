import { parseCourse } from '../../../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_CREATED_AT,
  FIXTURE_MODULE_ID,
} from '../../../courses/__fixtures__/course-fixtures';

import { createSvgStepEngine } from './svg-step-engine';

const SVG_FIXTURE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8"/></svg>';

describe('svgStepEngine', () => {
  const engine = createSvgStepEngine();

  function svgStep() {
    return parseCourse({
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
              stepId: 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
              type: 'svg',
              title: 'Diagram',
              content: { svg: SVG_FIXTURE, caption: 'Optional' },
            },
          ],
        },
      ],
    }).modules[0].steps[0];
  }

  it('completes only on advance after markViewed', () => {
    const step = svgStep();
    if (step.type !== 'svg') {
      throw new Error('expected svg');
    }
    let state = engine.createInitial(step);
    expect(state.status).toBe('not-started');
    state = engine.reduce(state, { kind: 'markViewed' });
    expect(state.viewed).toBe(true);
    state = engine.reduce(state, { kind: 'advance' });
    expect(state.status).toBe('completed');
  });

  it('retry after completed keeps completed', () => {
    const step = svgStep();
    if (step.type !== 'svg') {
      throw new Error('expected svg');
    }
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'advance' });
    state = { ...state, lastCheckFailed: true, viewed: true };
    const retried = engine.reduce(state, { kind: 'retry' });
    expect(retried.status).toBe('completed');
    expect(retried.lastCheckFailed).toBe(false);
    expect(retried.viewed).toBe(false);
  });

  it('rejects non-svg steps', () => {
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
              stepId: 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
              type: 'theory',
              title: 'T',
              content: 'text',
            },
          ],
        },
      ],
    });
    expect(() => engine.createInitial(course.modules[0].steps[0])).toThrow(/svg/i);
  });
});
