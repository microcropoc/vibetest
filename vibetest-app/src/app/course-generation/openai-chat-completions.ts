import { z } from 'zod';

export type ChatCompletionRequest = {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly userContent: string;
  readonly temperature?: number;
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
});

const ChatCompletionErrorBodySchema = z.object({
  error: z.object({ message: z.string().min(1) }),
});

export type ChatCompletionSuccess = {
  readonly kind: 'success';
  readonly content: string;
};

export type ChatCompletionFailure = {
  readonly kind: 'failure';
  readonly message: string;
};

export type ChatCompletionResult = ChatCompletionSuccess | ChatCompletionFailure;

export function buildChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/chat/completions`;
}

export function buildChatCompletionsBody(
  model: string,
  userContent: string,
  temperature: number = 0.2,
): string {
  return JSON.stringify({
    model: model.trim(),
    messages: [{ role: 'user', content: userContent }],
    temperature,
  });
}

export function parseChatCompletionResponseBody(
  json: unknown,
): ChatCompletionResult {
  const parsed = ChatCompletionResponseSchema.safeParse(json);
  if (!parsed.success) {
    return { kind: 'failure', message: 'Некорректный формат ответа API.' };
  }

  const choice = parsed.data.choices[0]!;
  if (choice.finish_reason === 'length') {
    return {
      kind: 'failure',
      message: 'Ответ модели обрезан (finish_reason: length). Уменьшите курс или увеличьте лимит токенов.',
    };
  }

  const content = choice.message.content;
  if (content === null || content.trim().length === 0) {
    return { kind: 'failure', message: 'Пустой текст в ответе модели.' };
  }

  return { kind: 'success', content };
}

const ABORTED: ChatCompletionFailure = { kind: 'failure', message: 'Запрос отменён.' };

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

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
      body: buildChatCompletionsBody(
        request.model,
        request.userContent,
        request.temperature,
      ),
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

  if (!response.ok) {
    const errorBody = ChatCompletionErrorBodySchema.safeParse(body);
    return {
      kind: 'failure',
      message: errorBody.success
        ? errorBody.data.error.message
        : `Ошибка API (HTTP ${response.status}).`,
    };
  }

  return parseChatCompletionResponseBody(body);
}
