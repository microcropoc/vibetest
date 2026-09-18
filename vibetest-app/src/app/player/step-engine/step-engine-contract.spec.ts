import { parseCourse } from '../../courses/parse-course';
import { minimalValidCourseJson } from '../../courses/__fixtures__/course-fixtures';

import { stubViewableStepEngine } from './stub-viewable-engine';

describe('StepEngine contract (stub viewable)', () => {
  const course = parseCourse(minimalValidCourseJson());
  const theoryStep = course.modules[0].steps[0];
  if (theoryStep.type !== 'theory') {
    throw new Error('expected theory step in fixture');
  }

  it('starts not-started without saved progress', () => {
    const state = stubViewableStepEngine.createInitial(theoryStep);
    expect(state.status).toBe('not-started');
    expect(state.lastCheckFailed).toBe(false);
  });

  it('advance completes; second advance is idempotent', () => {
    let state = stubViewableStepEngine.createInitial(theoryStep);
    state = stubViewableStepEngine.reduce(state, { kind: 'advance' });
    expect(state.status).toBe('completed');

    const again = stubViewableStepEngine.reduce(state, { kind: 'advance' });
    expect(again.status).toBe('completed');
    expect(again.lastCheckFailed).toBe(false);
  });

  it('retry after completed keeps completed and clears failure', () => {
    let state = stubViewableStepEngine.createInitial(theoryStep);
    state = stubViewableStepEngine.reduce(state, { kind: 'advance' });
    state = { ...state, lastCheckFailed: true };

    const retried = stubViewableStepEngine.reduce(state, { kind: 'retry' });
    expect(retried.status).toBe('completed');
    expect(retried.lastCheckFailed).toBe(false);
  });

  it('round-trips snapshot through createInitial', () => {
    let state = stubViewableStepEngine.createInitial(theoryStep);
    state = stubViewableStepEngine.reduce(state, { kind: 'advance' });
    const snapshot = stubViewableStepEngine.toSnapshot(state);

    const restored = stubViewableStepEngine.createInitial(theoryStep, snapshot);
    expect(restored.status).toBe('completed');
    expect(restored.lastCheckFailed).toBe(false);
    expect(stubViewableStepEngine.toSnapshot(restored)).toEqual(snapshot);
  });
});
