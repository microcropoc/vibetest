import type { Course } from '../courses/course.model';
import type { StepStatus } from '../player/step-engine/step-status';
import type { StepType } from '../player/step-engine/step-progress-snapshot';

/** IndexedDB row: full course document keyed by `courseId`. */
export interface CourseRow {
  readonly courseId: string;
  readonly course: Course;
}

/**
 * IndexedDB row for one step's progress.
 * `draft` is persisted JSON matching `StepDraftByType[type]` (validated in repositories).
 */
/** IndexedDB row for app settings keyed by `key`. */
export interface SettingsRow {
  readonly key: string;
  readonly value: unknown;
}

export interface StepProgressRow {
  readonly progressKey: string;
  readonly courseId: string;
  readonly moduleId: string;
  readonly stepId: string;
  readonly type: StepType;
  readonly status: StepStatus;
  readonly lastCheckFailed: boolean;
  readonly draft?: unknown;
}
