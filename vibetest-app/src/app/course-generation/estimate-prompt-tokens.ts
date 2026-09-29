import type { CourseGenerationMessages } from '../prompt-generation/build-course-generation-prompt';

/** Rough token estimate for UI (chars / 3). */
export function estimatePromptTokens(messages: CourseGenerationMessages): number {
  const chars = messages.system.length + messages.user.length;
  return Math.ceil(chars / 3);
}
