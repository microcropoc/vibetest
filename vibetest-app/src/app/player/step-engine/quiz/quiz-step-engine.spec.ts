import { parseCourse } from '../../../courses/parse-course';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
  minimalValidCourseJson,
} from '../../../courses/__fixtures__/course-fixtures';

import { createQuizStepEngine } from './quiz-step-engine';

describe('quizStepEngine', () => {
  const engine = createQuizStepEngine();

  function quizStepFromFixture() {
    const course = parseCourse(minimalValidCourseJson());
    const step = course.modules[0].steps[1];
    if (step.type !== 'quiz') {
      throw new Error('expected quiz step');
    }
    return step;
  }

  it('single choice: correct submit completes', () => {
    const step = quizStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setSelection', selectedIndices: [0] });
    state = engine.reduce(state, { kind: 'submitAnswer' });
    expect(state.status).toBe('completed');
    expect(state.lastCheckFailed).toBe(false);
  });

  it('wrong answer sets lastCheckFailed without completing', () => {
    const step = quizStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setSelection', selectedIndices: [1] });
    state = engine.reduce(state, { kind: 'submitAnswer' });
    expect(state.status).toBe('in-progress');
    expect(state.lastCheckFailed).toBe(true);
  });

  it('empty submit does not complete or flag failure', () => {
    const step = quizStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'submitAnswer' });
    expect(state.status).toBe('not-started');
    expect(state.lastCheckFailed).toBe(false);
  });

  it('retry clears selection and failure flag', () => {
    const step = quizStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setSelection', selectedIndices: [1] });
    state = engine.reduce(state, { kind: 'submitAnswer' });
    state = engine.reduce(state, { kind: 'retry' });
    expect(state.draft.selectedIndices).toEqual([]);
    expect(state.lastCheckFailed).toBe(false);
  });

  it('multi choice compares as sets', () => {
    const step = parseCourse({
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
              stepId: FIXTURE_STEP_QUIZ_ID,
              type: 'quiz',
              title: 'Multi',
              content: {
                question: 'Q',
                options: ['A', 'B', 'C'],
                correctIndices: [0, 2],
              },
            },
          ],
        },
      ],
    }).modules[0].steps[0];
    if (step.type !== 'quiz') {
      throw new Error('expected quiz');
    }
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setSelection', selectedIndices: [2, 0] });
    state = engine.reduce(state, { kind: 'submitAnswer' });
    expect(state.status).toBe('completed');
  });

  it('retry after completed keeps completed', () => {
    const step = quizStepFromFixture();
    let state = engine.createInitial(step);
    state = engine.reduce(state, { kind: 'setSelection', selectedIndices: [0] });
    state = engine.reduce(state, { kind: 'submitAnswer' });
    state = engine.reduce(state, { kind: 'retry' });
    expect(state.status).toBe('completed');
  });
});
