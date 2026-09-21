import { describe, expect, it } from 'vitest';

import { minimalValidCourseJson } from './__fixtures__/course-fixtures';
import { parseCourse } from './parse-course';
import { sortCoursesByCreatedAtDesc } from './sort-courses-by-created-at';

describe('sortCoursesByCreatedAtDesc', () => {
  it('orders newest createdAt first', () => {
    const older = parseCourse({
      ...minimalValidCourseJson(),
      courseId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      createdAt: '2019-06-01T00:00:00.000Z',
    });
    const newer = parseCourse({
      ...minimalValidCourseJson(),
      courseId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      createdAt: '2021-06-01T00:00:00.000Z',
    });

    const sorted = sortCoursesByCreatedAtDesc([older, newer]);

    expect(sorted.map((c) => c.courseId)).toEqual([newer.courseId, older.courseId]);
  });
});
