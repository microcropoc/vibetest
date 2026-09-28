import type { BundledCoursesFetch } from './bundled-courses-sync';

/** Max wait per bundled course fetch; fetches run in parallel, so this also bounds startup. */
export const BUNDLED_COURSE_FETCH_TIMEOUT_MS = 15_000;

export const bundledCoursesFetchWithTimeout: BundledCoursesFetch = (input, init) =>
  fetch(input, {
    ...init,
    signal: AbortSignal.timeout(BUNDLED_COURSE_FETCH_TIMEOUT_MS),
  });
