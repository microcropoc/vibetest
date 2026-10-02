import { zodIssues } from '../courses/import-parse';
import type { ImportIssue, ImportValidationStage } from '../courses/import-types';

import type { CourseOutline } from './course-outline.model';
import { CourseOutlineSchema } from './generated/course-outline.zod';

const EXPECTED_STEP_TYPES = ['theory', 'svg', 'quiz'] as const;

export type CourseOutlineParseResult =
  | { readonly ok: true; readonly outline: CourseOutline }
  | {
      readonly ok: false;
      readonly stage: ImportValidationStage;
      readonly issues: readonly ImportIssue[];
    };

export function parseCourseOutline(value: unknown): CourseOutline {
  return CourseOutlineSchema.parse(value);
}

/** Warnings, not errors: modules without a theory, svg or quiz step (import does not require them). */
export function findOutlineStepTypeGaps(outline: CourseOutline): readonly ImportIssue[] {
  const issues: ImportIssue[] = [];
  outline.modules.forEach((module, index) => {
    for (const type of EXPECTED_STEP_TYPES) {
      if (!module.steps.some((step) => step.type === type)) {
        issues.push({
          path: `modules.${index}.steps`,
          message: `В модуле «${module.title}» нет шага типа ${type}.`,
        });
      }
    }
  });
  return issues;
}

/** JSON text (already unwrapped from a fence) → outline; checks JSON and schema only. */
export function parseCourseOutlineText(jsonText: string): CourseOutlineParseResult {
  let value: unknown;
  try {
    value = JSON.parse(jsonText);
  } catch (error: unknown) {
    const message = error instanceof SyntaxError ? error.message : 'Invalid JSON';
    return { ok: false, stage: 'json', issues: [{ path: 'json', message }] };
  }

  const result = CourseOutlineSchema.safeParse(value);
  if (!result.success) {
    return { ok: false, stage: 'zod', issues: zodIssues(result.error) };
  }
  return { ok: true, outline: result.data };
}
