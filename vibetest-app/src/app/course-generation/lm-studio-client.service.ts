import { Injectable } from '@angular/core';

import type { LlmProfile } from '../settings/llm-profile.model';

import type { ChatCompletionMessage } from './openai-chat-completions';
import {
  postChatCompletion,
  type ChatCompletionResult,
} from './openai-chat-completions';

export type LmStudioCompleteOptions = {
  readonly signal?: AbortSignal;
  readonly importSchema?: Record<string, unknown>;
};

@Injectable({ providedIn: 'root' })
export class LmStudioClient {
  async complete(
    profile: Pick<LlmProfile, 'baseUrl' | 'apiKey' | 'model' | 'structuredOutput'>,
    messages: readonly ChatCompletionMessage[],
    options?: LmStudioCompleteOptions,
  ): Promise<ChatCompletionResult> {
    return postChatCompletion(
      {
        baseUrl: profile.baseUrl,
        apiKey: profile.apiKey,
        model: profile.model,
        messages,
        structuredOutput: profile.structuredOutput,
        importSchema: options?.importSchema,
      },
      fetch,
      options?.signal,
    );
  }
}
