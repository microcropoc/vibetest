import 'fake-indexeddb/auto';

import { BundledCoursesSeenRepository } from '../../storage/bundled-courses-seen-repository';
import { CourseRepository } from '../../storage/course-repository';
import { createTestVibetestDb, destroyTestVibetestDb } from '../../storage/test-db-harness';
import type { VibetestDb } from '../../storage/vibetest-db';
import { minimalValidCourseJson } from '../__fixtures__/course-fixtures';

import type { BundledCourseEntry } from './generated-bundled-courses';
import { BundledCoursesService } from './bundled-courses.service';

const ENTRY_A: BundledCourseEntry = {
  courseId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  file: 'a.json',
  title: 'Course A',
};

const ENTRY_B: BundledCourseEntry = {
  courseId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  file: 'b.json',
  title: 'Course B',
};

function courseBodyForId(courseId: string): unknown {
  return { ...minimalValidCourseJson(), courseId };
}

describe('BundledCoursesService', () => {
  let db: VibetestDb | undefined;

  afterEach(async () => {
    if (db) {
      await destroyTestVibetestDb(db);
    }
  });

  it('syncOnStartup installs all courses on first run', async () => {
    db = createTestVibetestDb();
    const bodies = new Map<string, unknown>([
      [ENTRY_A.file, courseBodyForId(ENTRY_A.courseId)],
      [ENTRY_B.file, courseBodyForId(ENTRY_B.courseId)],
    ]);
    const fetchFn = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);
      const file = path.endsWith('a.json') ? ENTRY_A.file : ENTRY_B.file;
      return new Response(JSON.stringify(bodies.get(file)), { status: 200 });
    });
    const service = BundledCoursesService.forDb(db, {
      fetchFn,
      manifest: [ENTRY_A, ENTRY_B],
    });

    await service.syncOnStartup();

    const repo = CourseRepository.forDb(db);
    expect(await repo.get(ENTRY_A.courseId)).toBeDefined();
    expect(await repo.get(ENTRY_B.courseId)).toBeDefined();
    expect(await BundledCoursesSeenRepository.forDb(db).get()).toEqual([
      ENTRY_A.courseId,
      ENTRY_B.courseId,
    ]);
  });

  it('syncOnStartup is a no-op on second run', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(courseBodyForId(ENTRY_A.courseId)), { status: 200 }));
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    await service.syncOnStartup();
    await service.syncOnStartup();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('syncOnStartup installs new manifest entry not yet seen', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async (url: RequestInfo | URL) => {
      const file = String(url).includes('b.json') ? ENTRY_B.file : ENTRY_A.file;
      const id = file === ENTRY_B.file ? ENTRY_B.courseId : ENTRY_A.courseId;
      return new Response(JSON.stringify(courseBodyForId(id)), { status: 200 });
    });
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    await service.syncOnStartup();
    const service2 = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A, ENTRY_B] });
    await service2.syncOnStartup();
    expect(await CourseRepository.forDb(db).get(ENTRY_B.courseId)).toBeDefined();
  });

  it('does not restore deleted course on startup if already seen', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(courseBodyForId(ENTRY_A.courseId)), { status: 200 }));
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    await service.syncOnStartup();
    await CourseRepository.forDb(db).delete(ENTRY_A.courseId);
    fetchFn.mockClear();
    await service.syncOnStartup();
    expect(fetchFn).not.toHaveBeenCalled();
    expect(await CourseRepository.forDb(db).get(ENTRY_A.courseId)).toBeUndefined();
  });

  it('restoreMissing re-installs deleted bundled course', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(courseBodyForId(ENTRY_A.courseId)), { status: 200 }));
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    await service.syncOnStartup();
    await CourseRepository.forDb(db).delete(ENTRY_A.courseId);
    fetchFn.mockClear();
    const result = await service.restoreMissing();
    expect(result).toEqual({ added: 1, failed: [] });
    expect(await CourseRepository.forDb(db).get(ENTRY_A.courseId)).toBeDefined();
  });

  it('restoreMissing reports failed when fetch fails', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async () => new Response(null, { status: 500 }));
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    const result = await service.restoreMissing();
    expect(result).toEqual({ added: 0, failed: [ENTRY_A.title] });
  });

  it('restoreMissing reports partial success', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes('a.json')
        ? new Response(JSON.stringify(courseBodyForId(ENTRY_A.courseId)), { status: 200 })
        : new Response(null, { status: 404 }),
    );
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A, ENTRY_B] });
    const result = await service.restoreMissing();
    expect(result).toEqual({ added: 1, failed: [ENTRY_B.title] });
    expect(await BundledCoursesSeenRepository.forDb(db).get()).toEqual([ENTRY_A.courseId]);
  });

  it('fetch failure does not mark course as seen', async () => {
    db = createTestVibetestDb();
    const fetchFn = vi.fn(async () => new Response(null, { status: 500 }));
    const service = BundledCoursesService.forDb(db, { fetchFn, manifest: [ENTRY_A] });
    await service.syncOnStartup();
    expect(await BundledCoursesSeenRepository.forDb(db).get()).toEqual([]);
  });
});
