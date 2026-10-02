import { z } from 'zod';

import {
  MAX_LLM_CONTEXT_LENGTH,
  MIN_LLM_CONTEXT_LENGTH,
  type LlmProfile,
  type LlmProfileDraft,
} from './llm-profile.model';

const ContextLengthSchema = z
  .number()
  .int()
  .min(MIN_LLM_CONTEXT_LENGTH)
  .max(MAX_LLM_CONTEXT_LENGTH);

const LlmProfileDraftSchema = z.object({
  label: z.string().trim().min(1).max(120),
  baseUrl: z.string().trim().min(1).max(500),
  apiKey: z.string().max(500),
  model: z.string().trim().min(1).max(200),
  structuredOutput: z.boolean().default(false),
  contextLength: ContextLengthSchema.nullable().default(null),
});

const DRAFT_FIELDS = [
  'label',
  'baseUrl',
  'apiKey',
  'model',
  'structuredOutput',
  'contextLength',
] as const satisfies readonly (keyof LlmProfileDraft)[];

const LlmProfileSchema = LlmProfileDraftSchema.extend({
  id: z.uuid(),
});

const LlmProfilesSchema = z.array(LlmProfileSchema);

export type LlmProfileDraftIssue = {
  readonly field: keyof LlmProfileDraft;
  readonly kind: 'required' | 'too-long' | 'invalid';
};

export function parseLlmProfiles(value: unknown): readonly LlmProfile[] {
  return LlmProfilesSchema.parse(value);
}

/** Parsed profiles with defaults applied, or undefined when the value does not match. */
export function tryParseLlmProfiles(value: unknown): readonly LlmProfile[] | undefined {
  const result = LlmProfilesSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function parseLlmProfile(value: unknown): LlmProfile {
  return LlmProfileSchema.parse(value);
}

export function isValidLlmContextLength(value: number): boolean {
  return ContextLengthSchema.safeParse(value).success;
}

/** First problem with a profile draft, or null when it can be saved. */
export function findLlmProfileDraftIssue(draft: LlmProfileDraft): LlmProfileDraftIssue | null {
  const result = LlmProfileDraftSchema.safeParse(draft);
  if (result.success) {
    return null;
  }
  const issue = result.error.issues[0]!;
  const field = DRAFT_FIELDS.find((name) => name === issue.path[0]) ?? 'label';
  if (field === 'contextLength') {
    return { field, kind: 'invalid' };
  }
  return { field, kind: issue.code === 'too_big' ? 'too-long' : 'required' };
}
