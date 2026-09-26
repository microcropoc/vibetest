import {
  FIXTURE_STEP_JS_ID,
  FIXTURE_STEP_SQLITE_ID,
  FIXTURE_STEP_THEORY_ID,
  minimalValidCourseJson,
} from './__fixtures__/course-fixtures';
import { parseCourse } from './parse-course';
import {
  validateAppendModuleToCourse,
  validateCourseSemantics,
} from './semantic-validation';

describe('validateCourseSemantics', () => {
  it('returns no issues for a valid course', () => {
    const course = parseCourse(minimalValidCourseJson());
    expect(validateCourseSemantics(course)).toEqual([]);
  });

  it('detects duplicate step ids', () => {
    const course = parseCourse(minimalValidCourseJson());
    course.modules[0].steps[1] = {
      ...course.modules[0].steps[1],
      stepId: FIXTURE_STEP_THEORY_ID,
    };
    const issues = validateCourseSemantics(course);
    expect(issues.some((i) => i.message.includes('Duplicate id'))).toBe(true);
  });

  it('detects quiz index out of range', () => {
    const course = parseCourse(minimalValidCourseJson());
    const quizStep = course.modules[0].steps[1];
    if (quizStep.type !== 'quiz') {
      throw new Error('expected quiz step');
    }
    course.modules[0].steps[1] = {
      ...quizStep,
      content: { ...quizStep.content, correctIndices: [5] },
    };
    const issues = validateCourseSemantics(course);
    expect(issues.some((i) => i.path.includes('correctIndices'))).toBe(true);
  });

  it('flags sqlite reset with INSERT INTO', () => {
    const raw = minimalValidCourseJson();
    const modules = raw['modules'] as Record<string, unknown>[];
    const steps = modules[0]['steps'] as Record<string, unknown>[];
    steps.push({
      stepId: FIXTURE_STEP_SQLITE_ID,
      type: 'sqlite',
      title: 'SQL',
      content: {
        description: 'd',
        starterCode: '',
        referenceSolution: 'SELECT 1',
        setup: 'CREATE TABLE t(x)',
        orderMatters: false,
        timeoutMs: 1000,
        tests: [{ seed: 'INSERT INTO t VALUES (1)' }],
        reset: 'INSERT INTO t VALUES (9)',
      },
    });
    const course = parseCourse(raw);
    const issues = validateCourseSemantics(course);
    expect(issues.some((i) => i.path.includes('reset'))).toBe(true);
  });

  it('does not flag javascript reset containing insert substring', () => {
    const raw = minimalValidCourseJson();
    const modules = raw['modules'] as Record<string, unknown>[];
    const steps = modules[0]['steps'] as Record<string, unknown>[];
    steps.push({
      stepId: FIXTURE_STEP_JS_ID,
      type: 'javascript',
      title: 'JS',
      content: {
        description: 'd',
        starterCode: '',
        referenceSolution: 'return 1',
        setup: '',
        reset: 'el.insertAdjacentHTML("beforeend", "<span/>")',
        functionName: 'fn',
        timeoutMs: 1000,
        tests: [{ args: [] }],
      },
    });
    const course = parseCourse(raw);
    expect(validateCourseSemantics(course)).toEqual([]);
  });
});

describe('validateAppendModuleToCourse', () => {
  it('rejects when course already has 100 modules', () => {
    const course = parseCourse(minimalValidCourseJson());
    const modules = Array.from({ length: 100 }, (_, index) => ({
      moduleId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      title: `M${index}`,
      steps: [
        {
          stepId: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
          type: 'theory' as const,
          title: 'T',
          content: 'x',
        },
      ],
    }));
    const fullCourse = { ...course, modules };
    const newModule = {
      moduleId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      title: 'New',
      steps: [
        {
          stepId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          type: 'theory' as const,
          title: 'T',
          content: 'y',
        },
      ],
    };

    const issues = validateAppendModuleToCourse(fullCourse, newModule);

    expect(issues).toContainEqual({
      path: 'course',
      message: 'Course already has the maximum of 100 modules',
    });
  });

  it('rejects when new moduleId collides with courseId', () => {
    const course = parseCourse(minimalValidCourseJson());
    const newModule = {
      moduleId: course.courseId,
      title: 'New',
      steps: [
        {
          stepId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          type: 'theory' as const,
          title: 'T',
          content: 'y',
        },
      ],
    };

    const issues = validateAppendModuleToCourse(course, newModule);

    expect(issues).toContainEqual({
      path: 'moduleId',
      message: `Duplicate moduleId ${course.courseId}`,
    });
  });
});
