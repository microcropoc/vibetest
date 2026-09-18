import { parseCourse } from '../../../courses/parse-course';
import { minimalValidCourseJson } from '../../../courses/__fixtures__/course-fixtures';

import { createTheoryStepEngine, theoryStepEngine } from './theory-step-engine';

describe('theoryStepEngine', () => {
  const engine = createTheoryStepEngine();
  const course = parseCourse(minimalValidCourseJson());
  const theoryStep = course.modules[0].steps[0];
  if (theoryStep.type !== 'theory') {
    throw new Error('fixture must include theory step');
  }

  it('does not complete on open — only after advance', () => {
    let state = engine.createInitial(theoryStep);
    expect(state.status).toBe('not-started');
    expect(state.viewed).toBe(false);

    state = engine.reduce(state, { kind: 'markViewed' });
    expect(state.status).toBe('in-progress');
    expect(state.viewed).toBe(true);

    state = engine.reduce(state, { kind: 'advance' });
    expect(state.status).toBe('completed');
  });

  it('retry after completed keeps completed and clears viewed', () => {
    let state = engine.createInitial(theoryStep);
    state = engine.reduce(state, { kind: 'markViewed' });
    state = engine.reduce(state, { kind: 'advance' });
    state = { ...state, lastCheckFailed: true, viewed: true };

    const retried = engine.reduce(state, { kind: 'retry' });
    expect(retried.status).toBe('completed');
    expect(retried.lastCheckFailed).toBe(false);
    expect(retried.viewed).toBe(false);
  });

  it('createTheoryStepEngine returns the shared engine instance', () => {
    expect(createTheoryStepEngine()).toBe(theoryStepEngine);
  });

  it('round-trips snapshot', () => {
    let state = engine.createInitial(theoryStep);
    state = engine.reduce(state, { kind: 'advance' });
    const snapshot = engine.toSnapshot(state);
    const restored = engine.createInitial(theoryStep, snapshot);
    expect(restored.status).toBe('completed');
    expect(restored.viewed).toBe(true);
  });

  it('rejects non-theory steps', () => {
    const quizStep = course.modules[0].steps[1];
    expect(() => engine.createInitial(quizStep)).toThrow(/theory/i);
  });
});
