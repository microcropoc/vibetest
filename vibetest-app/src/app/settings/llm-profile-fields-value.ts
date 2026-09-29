import { DEFAULT_LLM_BASE_URL, type LlmProfileDraft } from './llm-profile.model';
import { findLlmProfileDraftIssue } from './parse-llm-profiles';

export type LlmProfileFieldsValue = LlmProfileDraft;

const FIELD_NAMES: Readonly<Record<keyof LlmProfileFieldsValue, string>> = {
  label: 'Название',
  baseUrl: 'Base URL',
  apiKey: 'API key',
  model: 'Model',
  structuredOutput: 'Structured output',
};

export function emptyLlmProfileFieldsValue(): LlmProfileFieldsValue {
  return {
    label: '',
    baseUrl: DEFAULT_LLM_BASE_URL,
    apiKey: '',
    model: '',
    structuredOutput: false,
  };
}

export function llmProfileFieldsFromProfile(profile: LlmProfileDraft): LlmProfileFieldsValue {
  return {
    label: profile.label,
    baseUrl: profile.baseUrl,
    apiKey: profile.apiKey,
    model: profile.model,
    structuredOutput: profile.structuredOutput,
  };
}

/** User-facing validation message, or null when the fields can be saved. */
export function llmProfileFieldsError(value: LlmProfileFieldsValue): string | null {
  const issue = findLlmProfileDraftIssue(value);
  if (issue === null) {
    return null;
  }
  const name = FIELD_NAMES[issue.field];
  return issue.kind === 'too-long'
    ? `Поле «${name}» слишком длинное.`
    : `Заполните поле «${name}».`;
}
