import { deleteStepProgressByCourseId } from './delete-step-progress-by-course-id';
import type { VibetestDb } from './vibetest-db';

/** Spec: delete course and all step progress for that course in one transaction. */
export async function deleteCourseAndProgress(db: VibetestDb, courseId: string): Promise<void> {
  await db.transaction('rw', db.courses, db.stepProgress, async () => {
    await deleteStepProgressByCourseId(db.stepProgress, courseId);
    await db.courses.delete(courseId);
  });
}
