import { z } from 'zod';

export type ChatCompletionMessage = {
  readonly role: 'system' | 'user';
  readonly content: string;
};

export type ChatCompletionRequest = {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly messages: readonly ChatCompletionMessage[];
  readonly temperature?: number;
  readonly structuredOutput?: boolean;
  readonly importSchema?: Record<string, unknown>;
};

const ChatCompletionResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable().optional(),
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().int().nonnegative(),
    })
    .optional(),
});

const ChatCompletionErrorBodySchema = z.object({
  error: z.object({ message: z.string().min(1) }),
});

export type ChatCompletionSuccess = {
  readonly kind: 'success';
  readonly content: string;
  readonly promptTokens?: number;
};

export type ChatCompletionFailure = {
  readonly kind: 'failure';
  readonly message: string;
  readonly promptTokens?: number;
};

export type ChatCompletionResult = ChatCompletionSuccess | ChatCompletionFailure;

export function buildChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/chat/completions`;
}

export function buildChatCompletionsBody(
  model: string,
  messages: readonly ChatCompletionMessage[],
  options?: {
    readonly temperature?: number;
    readonly structuredOutput?: boolean;
    readonly importSchema?: Record<string, unknown>;
  },
): string {
  const temperature = options?.temperature ?? 0.2;
  const body: Record<string, unknown> = {
    model: model.trim(),
    messages: [...messages],
    temperature,
  };

  if (options?.structuredOutput === true && options.importSchema !== undefined) {
    body['response_format'] = {
      type: 'json_schema',
      json_schema: {
        name: 'course_import',
        // Bundled schema uses $defs/oneOf and optional fields; OpenAI strict mode rejects it.
        strict: false,
        schema: options.importSchema,
      },
    };
  }

  return JSON.stringify(body);
}

function promptTokensFromBody(json: unknown): number | undefined {
  const parsed = ChatCompletionResponseSchema.safeParse(json);
  return parsed.success ? parsed.data.usage?.prompt_tokens : undefined;
}

export function parseChatCompletionResponseBody(
  json: unknown,
): ChatCompletionResult {
  const parsed = ChatCompletionResponseSchema.safeParse(json);
  if (!parsed.success) {
    return { kind: 'failure', message: 'Некорректный формат ответа API.' };
  }

  const promptTokens = parsed.data.usage?.prompt_tokens;
  const choice = parsed.data.choices[0]!;
  if (choice.finish_reason === 'length') {
    return {
      kind: 'failure',
      message:
        'Ответ модели обрезан (finish_reason: length). Уменьшите курс или увеличьте лимит токенов.',
      promptTokens,
    };
  }

  const content = choice.message.content;
  if (content === null || content.trim().length === 0) {
    return { kind: 'failure', message: 'Пустой текст в ответе модели.', promptTokens };
  }

  return { kind: 'success', content, promptTokens };
}

const ABORTED: ChatCompletionFailure = { kind: 'failure', message: 'Запрос отменён.' };

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

const STRUCTURED_OUTPUT_HINT =
  ' Попробуйте выключить Structured output в профиле.';

export async function postChatCompletion(
  request: ChatCompletionRequest,
  fetchFn: typeof fetch,
  signal?: AbortSignal,
): Promise<ChatCompletionResult> {
  const url = buildChatCompletionsUrl(request.baseUrl);
  let response: Response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: buildChatCompletionsBody(request.model, request.messages, {
        temperature: request.temperature,
        structuredOutput: request.structuredOutput,
        importSchema: request.importSchema,
      }),
      signal,
    });
  } catch (err: unknown) {
    if (isAbortError(err)) {
      return ABORTED;
    }
    return {
      kind: 'failure',
      message: 'Не удалось связаться с API (сеть или CORS).',
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (err: unknown) {
    if (isAbortError(err)) {
      return ABORTED;
    }
    return {
      kind: 'failure',
      message: `Ответ API не JSON (HTTP ${response.status}).`,
    };
  }

  const promptTokens = promptTokensFromBody(body);

  if (!response.ok) {
    const errorBody = ChatCompletionErrorBodySchema.safeParse(body);
    let message = errorBody.success
      ? errorBody.data.error.message
      : `Ошибка API (HTTP ${response.status}).`;
    if (request.structuredOutput === true) {
      message += STRUCTURED_OUTPUT_HINT;
    }
    return { kind: 'failure', message, promptTokens };
  }

  const result = parseChatCompletionResponseBody(body);
  if (result.promptTokens === undefined && promptTokens !== undefined) {
    return { ...result, promptTokens };
  }
  return result;
}
