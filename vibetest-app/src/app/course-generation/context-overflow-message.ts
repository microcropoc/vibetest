const ADVICE = 'Увеличьте Context Length в LM Studio или выберите модель с бóльшим контекстом.';

/** LM Studio / llama.cpp: `request (8774 tokens) exceeds the available context size (8192 tokens)`. */
const LLAMA_CPP = /request \((\d+) tokens\) exceeds the available context size \((\d+) tokens\)/i;

/** OpenAI-like: `maximum context length is 8192 tokens. However, your messages resulted in 8774 tokens`. */
const OPENAI_LIMIT = /maximum context length is (\d+) tokens/i;
const OPENAI_PROMPT = /resulted in (\d+) tokens/i;

const GENERIC = /exceeds the available context size|context_length_exceeded|maximum context length/i;

/** Russian explanation of a "prompt does not fit the context" API error, or null for other errors. */
export function contextOverflowMessage(serverText: string): string | null {
  const llamaCpp = LLAMA_CPP.exec(serverText);
  if (llamaCpp !== null) {
    return withNumbers(Number(llamaCpp[1]), Number(llamaCpp[2]));
  }

  const openAiLimit = OPENAI_LIMIT.exec(serverText);
  const openAiPrompt = OPENAI_PROMPT.exec(serverText);
  if (openAiLimit !== null && openAiPrompt !== null) {
    return withNumbers(Number(openAiPrompt[1]), Number(openAiLimit[1]));
  }

  return GENERIC.test(serverText)
    ? `Промт этапа не помещается в контекст модели. ${ADVICE}`
    : null;
}

function withNumbers(promptTokens: number, contextLength: number): string {
  return `Промт этапа (≈${promptTokens} токенов) не помещается в контекст модели (${contextLength}). ${ADVICE}`;
}
