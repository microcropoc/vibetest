import { describe, expect, it } from 'vitest';

import { FIXTURE_CREATED_AT } from './__fixtures__/course-fixtures';
import { formatCourseCreatedAt } from './format-course-created-at';

describe('formatCourseCreatedAt', () => {
  it('formats ISO date-time for ru-RU in UTC', () => {
    expect(formatCourseCreatedAt(FIXTURE_CREATED_AT)).toBe('15.01.2020, 12:00');
  });
});
