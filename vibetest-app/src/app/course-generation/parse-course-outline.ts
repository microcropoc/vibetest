import { zodIssues } from '../courses/import-parse';
import type { ImportIssue, ImportValidationStage } from '../courses/import-types';

import type { CourseOutline } from './course-outline.model';
import { CourseOutlineSchema } from './generated/course-outline.zod';

const REQUIRED_STEP_TYPES = ['theory', 'svg', 'quiz'] as const;

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

/** Every module must contain at least one theory, svg and quiz step. */
export function validateCourseOutlineSemantics(outline: CourseOutline): readonly ImportIssue[] {
  const issues: ImportIssue[] = [];
  outline.modules.forEach((module, index) => {
    for (const type of REQUIRED_STEP_TYPES) {
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

/** JSON text (already unwrapped from a fence) → outline, with Zod and semantic checks. */
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

  const semanticIssues = validateCourseOutlineSemantics(result.data);
  if (semanticIssues.length > 0) {
    return { ok: false, stage: 'semantic', issues: semanticIssues };
  }
  return { ok: true, outline: result.data };
}
