import { contextOverflowMessage } from './context-overflow-message';

describe('contextOverflowMessage', () => {
  it('reads both numbers from the LM Studio / llama.cpp error', () => {
    expect(
      contextOverflowMessage(
        'request (8774 tokens) exceeds the available context size (8192 tokens), try increasing it',
      ),
    ).toBe(
      'Промт этапа (≈8774 токенов) не помещается в контекст модели (8192). ' +
        'Увеличьте Context Length в LM Studio или выберите модель с бóльшим контекстом.',
    );
  });

  it('reads both numbers from the OpenAI-like error', () => {
    expect(
      contextOverflowMessage(
        "This model's maximum context length is 8192 tokens. However, your messages resulted in 9000 tokens.",
      ),
    ).toContain('(≈9000 токенов) не помещается в контекст модели (8192)');
  });

  it('explains the overflow without numbers when the server gives none', () => {
    expect(contextOverflowMessage('{"code":"context_length_exceeded"}')).toBe(
      'Промт этапа не помещается в контекст модели. ' +
        'Увеличьте Context Length в LM Studio или выберите модель с бóльшим контекстом.',
    );
  });

  it('returns null for unrelated errors', () => {
    expect(contextOverflowMessage('Model not loaded')).toBeNull();
  });
});
