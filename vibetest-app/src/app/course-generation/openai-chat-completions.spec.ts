import {
  buildChatCompletionsBody,
  buildChatCompletionsUrl,
  parseChatCompletionResponseBody,
  postChatCompletion,
} from './openai-chat-completions';

const MESSAGES = [
  { role: 'system' as const, content: 'rules' },
  { role: 'user' as const, content: 'hello' },
];

describe('openai-chat-completions', () => {
  it('builds chat completions URL without trailing slash', () => {
    expect(buildChatCompletionsUrl('http://localhost:1234/v1/')).toBe(
      'http://localhost:1234/v1/chat/completions',
    );
  });

  it('builds request body with system and user messages', () => {
    const body = JSON.parse(buildChatCompletionsBody('my-model', MESSAGES, { temperature: 0.2 })) as {
      model: string;
      temperature: number;
      messages: { role: string; content: string }[];
    };
    expect(body.model).toBe('my-model');
    expect(body.temperature).toBe(0.2);
    expect(body.messages).toEqual(MESSAGES);
  });

  it('adds response_format when structured output is enabled', () => {
    const schema = { type: 'object', properties: { schemaVersion: { type: 'number' } } };
    const body = JSON.parse(
      buildChatCompletionsBody('my-model', MESSAGES, {
        structuredOutput: true,
        importSchema: schema,
      }),
    ) as { response_format?: { type: string; json_schema: { name: string } } };
    expect(body.response_format?.type).toBe('json_schema');
    expect(body.response_format?.json_schema.name).toBe('course_import');
  });

  it('parses successful content and prompt_tokens', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '{"a":1}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 9000 },
    });
    expect(result).toEqual({ kind: 'success', content: '{"a":1}', promptTokens: 9000 });
  });

  it('fails retryably on length finish_reason', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '{}' }, finish_reason: 'length' }],
    });
    expect(result.kind).toBe('failure');
    expect(result.kind === 'failure' && result.retryReason).toBe('truncated');
  });

  it('fails retryably on empty content', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '  ' }, finish_reason: 'stop' }],
    });
    expect(result).toEqual({
      kind: 'failure',
      message: 'Пустой текст в ответе модели.',
      retryReason: 'empty',
    });
  });

  it('does not mark a malformed API body as retryable', () => {
    const result = parseChatCompletionResponseBody({ choices: [] });
    expect(result.kind === 'failure' && result.retryReason).toBeUndefined();
  });

  describe('postChatCompletion failures', () => {
    const request = {
      baseUrl: 'http://localhost:1234/v1',
      apiKey: 'secret-key',
      model: 'm',
      messages: MESSAGES,
    };

    function abortError(): DOMException {
      return new DOMException('aborted', 'AbortError');
    }

    it('uses error.message from an HTTP error body', async () => {
      const fetchFn = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'Model not loaded' } }), { status: 400 }),
      );
      expect(await postChatCompletion(request, fetchFn)).toEqual({
        kind: 'failure',
        message: 'Model not loaded',
      });
    });

    it('appends structured output hint on HTTP error when enabled', async () => {
      const fetchFn = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'Schema too large' } }), { status: 400 }),
      );
      const result = await postChatCompletion(
        { ...request, structuredOutput: true, importSchema: { type: 'object' } },
        fetchFn,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.message).toContain('Schema too large');
        expect(result.message).toContain('Structured output');
      }
    });

    it('falls back to the HTTP status when the error body has no message', async () => {
      const fetchFn = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'x' }), { status: 401 }),
      );
      expect(await postChatCompletion(request, fetchFn)).toEqual({
        kind: 'failure',
        message: 'Ошибка API (HTTP 401).',
      });
    });

    it('reports a non-JSON response', async () => {
      const fetchFn = vi.fn().mockResolvedValue(new Response('<html>', { status: 502 }));
      expect(await postChatCompletion(request, fetchFn)).toEqual({
        kind: 'failure',
        message: 'Ответ API не JSON (HTTP 502).',
      });
    });

    it('reports a network error without leaking the key', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const result = await postChatCompletion(request, fetchFn);
      expect(result).toEqual({
        kind: 'failure',
        message: 'Не удалось связаться с API (сеть или CORS).',
      });
      expect(JSON.stringify(result)).not.toContain('secret-key');
    });

    it('reports cancellation while waiting for headers', async () => {
      const fetchFn = vi.fn().mockRejectedValue(abortError());
      expect(await postChatCompletion(request, fetchFn)).toEqual({
        kind: 'failure',
        message: 'Запрос отменён.',
      });
    });

    it('reports cancellation while reading the body', async () => {
      const response = new Response('{}', { status: 200 });
      vi.spyOn(response, 'json').mockRejectedValue(abortError());
      const fetchFn = vi.fn().mockResolvedValue(response);
      expect(await postChatCompletion(request, fetchFn)).toEqual({
        kind: 'failure',
        message: 'Запрос отменён.',
      });
    });
  });

  it('posts and parses via fetch mock', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        }),
        { status: 200 },
      ),
    );
    const result = await postChatCompletion(
      {
        baseUrl: 'http://localhost:1234/v1',
        apiKey: 'k',
        model: 'm',
        messages: MESSAGES,
      },
      fetchFn,
    );
    expect(result).toEqual({ kind: 'success', content: 'ok' });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://localhost:1234/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer k',
        }),
      }),
    );
  });
});
