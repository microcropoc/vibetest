import type { CourseOutline } from '../course-generation/course-outline.model';
import { parseCourseOutlineText } from '../course-generation/parse-course-outline';
import { prepareLlmImportText } from '../course-generation/prepare-llm-import-text';
import type { ImportIssue } from '../courses/import-types';

export type OutlineResponseResult =
  | { readonly kind: 'empty' }
  | { readonly kind: 'invalid'; readonly issues: readonly ImportIssue[] }
  | { readonly kind: 'valid'; readonly outline: CourseOutline };

/** Pasted answer of an external chat (raw JSON or ```json fence) → outline, checked as in LM Studio generation (JSON and schema). */
export function parseOutlineResponse(text: string): OutlineResponseResult {
  if (text.trim().length === 0) {
    return { kind: 'empty' };
  }

  let jsonText: string;
  try {
    jsonText = prepareLlmImportText(text, null);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ответ не содержит JSON.';
    return { kind: 'invalid', issues: [{ path: 'json', message }] };
  }

  const parsed = parseCourseOutlineText(jsonText);
  return parsed.ok
    ? { kind: 'valid', outline: parsed.outline }
    : { kind: 'invalid', issues: parsed.issues };
}
