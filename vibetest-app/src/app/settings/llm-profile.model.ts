/** Saved LM Studio / OpenAI-compatible connection profile. */
export interface LlmProfile {
  readonly id: string;
  readonly label: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly structuredOutput: boolean;
  /** Model context window in tokens, as configured in LM Studio; null when unknown. */
  readonly contextLength: number | null;
}

export const MIN_LLM_CONTEXT_LENGTH = 512;
export const MAX_LLM_CONTEXT_LENGTH = 2_000_000;

export type LlmProfileDraft = Omit<LlmProfile, 'id'>;

export const DEFAULT_LLM_BASE_URL = 'http://localhost:1234/v1' as const;
