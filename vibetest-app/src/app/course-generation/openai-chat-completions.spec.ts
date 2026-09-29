import {
  buildChatCompletionsBody,
  buildChatCompletionsUrl,
  parseChatCompletionResponseBody,
  postChatCompletion,
} from './openai-chat-completions';

describe('openai-chat-completions', () => {
  it('builds chat completions URL without trailing slash', () => {
    expect(buildChatCompletionsUrl('http://localhost:1234/v1/')).toBe(
      'http://localhost:1234/v1/chat/completions',
    );
  });

  it('builds request body with user message', () => {
    const body = JSON.parse(
      buildChatCompletionsBody('my-model', 'hello', 0.2),
    ) as {
      model: string;
      temperature: number;
      messages: { role: string; content: string }[];
    };
    expect(body.model).toBe('my-model');
    expect(body.temperature).toBe(0.2);
    expect(body.messages).toEqual([{ role: 'user', content: 'hello' }]);
  });

  it('parses successful content', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '{"a":1}' }, finish_reason: 'stop' }],
    });
    expect(result).toEqual({ kind: 'success', content: '{"a":1}' });
  });

  it('fails on length finish_reason', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '{}' }, finish_reason: 'length' }],
    });
    expect(result.kind).toBe('failure');
  });

  it('fails on empty content', () => {
    const result = parseChatCompletionResponseBody({
      choices: [{ message: { content: '  ' }, finish_reason: 'stop' }],
    });
    expect(result).toEqual({ kind: 'failure', message: 'Пустой текст в ответе модели.' });
  });

  describe('postChatCompletion failures', () => {
    const request = {
      baseUrl: 'http://localhost:1234/v1',
      apiKey: 'secret-key',
      model: 'm',
      userContent: 'prompt',
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
        userContent: 'prompt',
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
