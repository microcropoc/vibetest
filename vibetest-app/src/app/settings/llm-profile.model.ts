/** Saved LM Studio / OpenAI-compatible connection profile. */
export interface LlmProfile {
  readonly id: string;
  readonly label: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
}

export type LlmProfileDraft = Omit<LlmProfile, 'id'>;

export const DEFAULT_LLM_BASE_URL = 'http://localhost:1234/v1' as const;
