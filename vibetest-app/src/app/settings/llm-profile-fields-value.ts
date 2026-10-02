import {
  DEFAULT_LLM_BASE_URL,
  MAX_LLM_CONTEXT_LENGTH,
  MIN_LLM_CONTEXT_LENGTH,
  type LlmProfileDraft,
} from './llm-profile.model';
import { findLlmProfileDraftIssue } from './parse-llm-profiles';

export type LlmProfileFieldsValue = LlmProfileDraft;

const FIELD_NAMES: Readonly<Record<keyof LlmProfileFieldsValue, string>> = {
  label: 'Название',
  baseUrl: 'Base URL',
  apiKey: 'API key',
  model: 'Model',
  structuredOutput: 'Structured output',
  contextLength: 'Context Length',
};

export function emptyLlmProfileFieldsValue(): LlmProfileFieldsValue {
  return {
    label: '',
    baseUrl: DEFAULT_LLM_BASE_URL,
    apiKey: '',
    model: '',
    structuredOutput: false,
    contextLength: null,
  };
}

export function llmProfileFieldsFromProfile(profile: LlmProfileDraft): LlmProfileFieldsValue {
  return {
    label: profile.label,
    baseUrl: profile.baseUrl,
    apiKey: profile.apiKey,
    model: profile.model,
    structuredOutput: profile.structuredOutput,
    contextLength: profile.contextLength,
  };
}

/** Context Length input text: empty means "not set"; anything else is validated on save. */
export function parseContextLengthInput(text: string): number | null {
  const trimmed = text.trim();
  return trimmed.length === 0 ? null : Number(trimmed);
}

/** User-facing validation message, or null when the fields can be saved. */
export function llmProfileFieldsError(value: LlmProfileFieldsValue): string | null {
  const issue = findLlmProfileDraftIssue(value);
  if (issue === null) {
    return null;
  }
  const name = FIELD_NAMES[issue.field];
  switch (issue.kind) {
    case 'too-long':
      return `Поле «${name}» слишком длинное.`;
    case 'invalid':
      return `Поле «${name}» должно быть целым числом от ${MIN_LLM_CONTEXT_LENGTH} до ${MAX_LLM_CONTEXT_LENGTH}.`;
    case 'required':
      return `Заполните поле «${name}».`;
  }
}
