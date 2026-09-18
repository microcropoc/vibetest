import type { VibetestDb } from './vibetest-db';

/**
 * Deletes all `stepProgress` rows for a course. Does not open a transaction —
 * call inside `db.transaction('rw', …)` together with other writes (vt-12/vt-14/vt-15).
 */
export async function deleteStepProgressByCourseId(
  stepProgressTable: VibetestDb['stepProgress'],
  courseId: string,
): Promise<number> {
  return stepProgressTable.where('courseId').equals(courseId).delete();
}
