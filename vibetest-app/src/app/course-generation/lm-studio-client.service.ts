import { Injectable } from '@angular/core';

import type { LlmProfile } from '../settings/llm-profile.model';

import {
  postChatCompletion,
  type ChatCompletionResult,
} from './openai-chat-completions';

@Injectable({ providedIn: 'root' })
export class LmStudioClient {
  async completeUserPrompt(
    profile: Pick<LlmProfile, 'baseUrl' | 'apiKey' | 'model'>,
    userContent: string,
    signal?: AbortSignal,
  ): Promise<ChatCompletionResult> {
    return postChatCompletion(
      {
        baseUrl: profile.baseUrl,
        apiKey: profile.apiKey,
        model: profile.model,
        userContent,
      },
      fetch,
      signal,
    );
  }
}
