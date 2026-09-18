const STEP_PROGRESS_KEY_SEP = '::';

export function buildStepProgressKey(
  courseId: string,
  moduleId: string,
  stepId: string,
): string {
  return `${courseId}${STEP_PROGRESS_KEY_SEP}${moduleId}${STEP_PROGRESS_KEY_SEP}${stepId}`;
}

export function parseStepProgressKey(progressKey: string): {
  readonly courseId: string;
  readonly moduleId: string;
  readonly stepId: string;
} {
  const parts = progressKey.split(STEP_PROGRESS_KEY_SEP);
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error(`Invalid step progress key: "${progressKey}"`);
  }
  const [courseId, moduleId, stepId] = parts;
  return { courseId, moduleId, stepId };
}
