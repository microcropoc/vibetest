export const FIXTURE_COURSE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
export const FIXTURE_MODULE_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
export const FIXTURE_STEP_THEORY_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
export const FIXTURE_STEP_QUIZ_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
export const FIXTURE_STEP_JS_ID = 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
export const FIXTURE_STEP_SQLITE_ID = 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';

export function minimalValidCourseJson(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    courseId: FIXTURE_COURSE_ID,
    title: 'Test course',
    description: 'Description',
    modules: [
      {
        moduleId: FIXTURE_MODULE_ID,
        title: 'Module 1',
        steps: [
          {
            stepId: FIXTURE_STEP_THEORY_ID,
            type: 'theory',
            title: 'Theory',
            content: 'Hello **world**',
          },
          {
            stepId: FIXTURE_STEP_QUIZ_ID,
            type: 'quiz',
            title: 'Quiz',
            content: {
              question: 'Pick one',
              options: ['A', 'B'],
              correctIndices: [0],
            },
          },
        ],
      },
    ],
  };
}
