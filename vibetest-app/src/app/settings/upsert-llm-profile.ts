import type { LlmProfile } from './llm-profile.model';
import type { LlmProfileFieldsValue } from './llm-profile-fields-value';
import { parseLlmProfile } from './parse-llm-profiles';

export function createLlmProfileId(): string {
  return crypto.randomUUID();
}

/** Throws when fields are invalid; check `llmProfileFieldsError` first. */
export function profileFromFields(
  fields: LlmProfileFieldsValue,
  id: string = createLlmProfileId(),
): LlmProfile {
  return parseLlmProfile({ id, ...fields });
}

export function upsertLlmProfile(
  profiles: readonly LlmProfile[],
  profile: LlmProfile,
): readonly LlmProfile[] {
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index === -1) {
    return [...profiles, profile];
  }
  return profiles.map((p, i) => (i === index ? profile : p));
}

export function removeLlmProfile(
  profiles: readonly LlmProfile[],
  id: string,
): readonly LlmProfile[] {
  return profiles.filter((p) => p.id !== id);
}
