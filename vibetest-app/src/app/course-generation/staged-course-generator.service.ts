import { Injectable, inject } from '@angular/core';

import {
  buildFirstModuleCourseMessages,
  buildModuleMessages,
  buildOutlineMessages,
  type StagedGenerationMessages,
  type StagedGenerationMessagesOptions,
} from '../prompt-generation/build-staged-generation-messages';
import type { LlmProfile } from '../settings/llm-profile.model';

import type { CourseOutline } from './course-outline.model';
import { LmStudioClient } from './lm-studio-client.service';
import type { ChatCompletionRetryReason } from './openai-chat-completions';
import { parseCourseOutlineText } from './parse-course-outline';
import {
  CANCELLED,
  runWithRetry,
  type AttemptContext,
  type AttemptFatal,
  type AttemptInvalid,
  type AttemptOutcome,
  type RetryResult,
} from './run-with-retry';
import {
  StagedStepAcceptor,
  extractModelJson,
  invalidJson,
  type ModelText,
} from './staged-step-acceptor.service';

/** Progress that survives a failed run, so generation can resume from the failed step. */
export type StagedGenerationState = {
  readonly outline: CourseOutline | null;
  readonly courseId: string | null;
  /** Next outline module to generate (0-based); module 0 is generated together with the course. */
  readonly nextModuleIndex: number;
};

export const INITIAL_STAGED_GENERATION_STATE: StagedGenerationState = {
  outline: null,
  courseId: null,
  nextModuleIndex: 0,
};

/** `module` with index 0 is stage 2 (course with the first module). */
export type GenerationStep =
  | { readonly kind: 'outline' }
  | { readonly kind: 'module'; readonly index: number };

export type GenerationSchema = {
  readonly text: string;
  /** Parsed schema for `response_format: json_schema`; null when unavailable. */
  readonly record: Record<string, unknown> | null;
};

export type StagedGenerationInput = {
  readonly profile: LlmProfile;
  readonly description: string;
  readonly schemas: {
    readonly outline: GenerationSchema;
    readonly courseImport: GenerationSchema;
    readonly moduleImport: GenerationSchema;
  };
};

export type StagedGenerationCallbacks = {
  readonly onAttempt?: (step: GenerationStep, attempt: number, maxAttempts: number) => void;
  readonly onStateChange?: (state: StagedGenerationState) => void;
  readonly onPromptTokens?: (promptTokens: number) => void;
};

export type StagedGenerationOutcome =
  | { readonly kind: 'done' }
  | {
      readonly kind: 'exhausted';
      readonly step: GenerationStep;
      readonly last: AttemptInvalid;
    }
  | { readonly kind: 'fatal'; readonly step: GenerationStep; readonly failure: AttemptFatal };

export type StagedGenerationResult = {
  readonly state: StagedGenerationState;
  readonly outcome: StagedGenerationOutcome;
};

export type StagedGenerationRunOptions = {
  readonly signal?: AbortSignal;
  readonly callbacks?: StagedGenerationCallbacks;
  readonly maxAttempts?: number;
};

/** Retry issues are read by the model, so they say what to change in the answer. */
const RETRY_ISSUE_MESSAGES: Record<ChatCompletionRetryReason, string> = {
  truncated:
    'Ответ не поместился в лимит токенов и обрезан. Пиши компактнее: короче теория и описания, меньше примеров, без лишних пробелов в JSON.',
  empty: 'Ответ пустой. Выведи JSON.',
};

@Injectable({ providedIn: 'root' })
export class StagedCourseGenerator {
  private readonly lmStudio = inject(LmStudioClient);
  private readonly acceptor = inject(StagedStepAcceptor);

  async run(
    state: StagedGenerationState,
    input: StagedGenerationInput,
    options?: StagedGenerationRunOptions,
  ): Promise<StagedGenerationResult> {
    const callbacks = options?.callbacks;
    let current = state;
    const update = (next: StagedGenerationState): void => {
      current = next;
      callbacks?.onStateChange?.(next);
    };

    const runStep = <T>(
      step: GenerationStep,
      attemptFn: (context: AttemptContext) => Promise<AttemptOutcome<T>>,
    ) =>
      runWithRetry(attemptFn, {
        maxAttempts: options?.maxAttempts,
        signal: options?.signal,
        onAttempt: (attempt, maxAttempts) => callbacks?.onAttempt?.(step, attempt, maxAttempts),
      });

    const stop = (
      step: GenerationStep,
      result: Exclude<RetryResult<unknown>, { readonly kind: 'ok' }>,
    ): StagedGenerationResult => ({
      state: current,
      outcome:
        result.kind === 'exhausted'
          ? { kind: 'exhausted', step, last: result.last }
          : { kind: 'fatal', step, failure: result },
    });

    if (current.outline === null) {
      const step: GenerationStep = { kind: 'outline' };
      const result = await runStep(step, (context) =>
        this.outlineAttempt(input, context, options?.signal, callbacks),
      );
      if (result.kind !== 'ok') {
        return stop(step, result);
      }
      update({ ...current, outline: result.value });
    }
    const outline = current.outline!;

    if (current.courseId === null) {
      const step: GenerationStep = { kind: 'module', index: 0 };
      const result = await runStep(step, (context) =>
        this.firstModuleAttempt(input, outline, context, options?.signal, callbacks),
      );
      if (result.kind !== 'ok') {
        return stop(step, result);
      }
      update({ ...current, courseId: result.value, nextModuleIndex: 1 });
    }
    const courseId = current.courseId!;

    while (current.nextModuleIndex < outline.modules.length) {
      const index = current.nextModuleIndex;
      const step: GenerationStep = { kind: 'module', index };
      const result = await runStep(step, (context) =>
        this.moduleAttempt(input, outline, index, courseId, context, options?.signal, callbacks),
      );
      if (result.kind !== 'ok') {
        return stop(step, result);
      }
      update({ ...current, nextModuleIndex: index + 1 });
    }

    return { state: current, outcome: { kind: 'done' } };
  }

  private async outlineAttempt(
    input: StagedGenerationInput,
    context: AttemptContext,
    signal: AbortSignal | undefined,
    callbacks: StagedGenerationCallbacks | undefined,
  ): Promise<AttemptOutcome<CourseOutline>> {
    const schema = input.schemas.outline;
    const response = await this.requestText(
      input.profile,
      schema,
      (messageOptions) =>
        buildOutlineMessages(input.description, schema.text, messageOptions),
      context,
      signal,
      callbacks,
    );
    if (response.kind !== 'text') {
      return response;
    }
    const parsed = parseCourseOutlineText(response.text);
    if (!parsed.ok) {
      return {
        kind: 'invalid',
        stage: parsed.stage,
        issues: parsed.issues,
        rawResponse: response.rawResponse,
      };
    }
    return { kind: 'ok', value: parsed.outline };
  }

  private async firstModuleAttempt(
    input: StagedGenerationInput,
    outline: CourseOutline,
    context: AttemptContext,
    signal: AbortSignal | undefined,
    callbacks: StagedGenerationCallbacks | undefined,
  ): Promise<AttemptOutcome<string>> {
    const schema = input.schemas.courseImport;
    const response = await this.requestText(
      input.profile,
      schema,
      (messageOptions) =>
        buildFirstModuleCourseMessages(input.description, outline, schema.text, messageOptions),
      context,
      signal,
      callbacks,
    );
    if (response.kind !== 'text') {
      return response;
    }
    return this.acceptor.acceptFirstModule(response.text, response.rawResponse);
  }

  private async moduleAttempt(
    input: StagedGenerationInput,
    outline: CourseOutline,
    index: number,
    courseId: string,
    context: AttemptContext,
    signal: AbortSignal | undefined,
    callbacks: StagedGenerationCallbacks | undefined,
  ): Promise<AttemptOutcome<string>> {
    const schema = input.schemas.moduleImport;
    const response = await this.requestText(
      input.profile,
      schema,
      (messageOptions) => buildModuleMessages(outline, index, schema.text, messageOptions),
      context,
      signal,
      callbacks,
    );
    if (response.kind !== 'text') {
      return response;
    }
    return this.acceptor.acceptModule(response.text, courseId, response.rawResponse);
  }

  /** One chat request; returns extracted JSON text or an invalid/fatal outcome. */
  private async requestText(
    profile: LlmProfile,
    schema: GenerationSchema,
    buildMessages: (options: StagedGenerationMessagesOptions) => StagedGenerationMessages,
    context: AttemptContext,
    signal: AbortSignal | undefined,
    callbacks: StagedGenerationCallbacks | undefined,
  ): Promise<ModelText | AttemptInvalid | AttemptFatal> {
    const importSchema =
      profile.structuredOutput && schema.record !== null ? schema.record : undefined;
    const messages = buildMessages({
      structuredOutput: importSchema !== undefined,
      retryIssues: context.retryIssues,
    });

    const completion = await this.lmStudio.complete(
      profile,
      [
        { role: 'system', content: messages.system },
        { role: 'user', content: messages.user },
      ],
      { signal, importSchema },
    );
    if (completion.promptTokens !== undefined) {
      callbacks?.onPromptTokens?.(completion.promptTokens);
    }
    if (signal?.aborted === true) {
      return CANCELLED;
    }
    if (completion.kind === 'failure') {
      return completion.retryReason !== undefined
        ? invalidJson(RETRY_ISSUE_MESSAGES[completion.retryReason])
        : { kind: 'fatal', message: completion.message };
    }

    return extractModelJson(completion.content);
  }
}
