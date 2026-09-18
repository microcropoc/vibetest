import type { VibetestDb } from './vibetest-db';

/** Spec: delete course and all step progress for that course in one transaction. */
export async function deleteCourseAndProgress(db: VibetestDb, courseId: string): Promise<void> {
  await db.transaction('rw', db.courses, db.stepProgress, async () => {
    await db.stepProgress.where('courseId').equals(courseId).delete();
    await db.courses.delete(courseId);
  });
}
