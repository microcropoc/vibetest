import type { StagedGenerationMessages } from '../prompt-generation/build-staged-generation-messages';

/** Rough token estimate for UI (chars / 3). */
export function estimatePromptTokens(messages: StagedGenerationMessages): number {
  const chars = messages.system.length + messages.user.length;
  return Math.ceil(chars / 3);
}
