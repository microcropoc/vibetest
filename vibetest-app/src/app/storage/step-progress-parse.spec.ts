import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  FIXTURE_STEP_QUIZ_ID,
} from '../courses/__fixtures__/course-fixtures';

import { parseStepProgressRow, stepProgressSnapshotFromRow } from './step-progress-parse';

describe('step progress parse', () => {
  it('parses row and snapshot with quiz draft', () => {
    const row = parseStepProgressRow({
      progressKey: `${FIXTURE_COURSE_ID}::${FIXTURE_MODULE_ID}::${FIXTURE_STEP_QUIZ_ID}`,
      courseId: FIXTURE_COURSE_ID,
      moduleId: FIXTURE_MODULE_ID,
      stepId: FIXTURE_STEP_QUIZ_ID,
      type: 'quiz',
      status: 'in-progress',
      lastCheckFailed: true,
      draft: { selectedIndices: [0] },
    });
    const snapshot = stepProgressSnapshotFromRow(row);
    expect(snapshot.type).toBe('quiz');
    expect(snapshot.lastCheckFailed).toBe(true);
    expect(snapshot.draft).toEqual({ selectedIndices: [0] });
  });

  it('rejects invalid row shape', () => {
    expect(() => parseStepProgressRow({ stepId: 'x' })).toThrow();
  });
});
