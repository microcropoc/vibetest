import { z } from 'zod';

const messageIdSchema = z.string().min(1);

const javascriptInitSchema = z
  .object({
    type: z.literal('javascriptInit'),
    id: messageIdSchema,
    setup: z.string(),
    userCode: z.string(),
    referenceCode: z.string(),
    functionName: z.string().min(1),
  })
  .strict();

const javascriptRunCaseSchema = z
  .object({
    type: z.literal('javascriptRunCase'),
    id: messageIdSchema,
    args: z.array(z.unknown()).max(20),
    userReset: z.string().optional(),
    referenceReset: z.string().optional(),
  })
  .strict();

const sqliteInitSchema = z
  .object({
    type: z.literal('sqliteInit'),
    id: messageIdSchema,
    wasmUrl: z.string().url(),
    setup: z.string(),
    userQuery: z.string(),
    referenceQuery: z.string(),
    orderMatters: z.boolean(),
  })
  .strict();

const sqliteRunCaseSchema = z
  .object({
    type: z.literal('sqliteRunCase'),
    id: messageIdSchema,
    seed: z.string(),
    userReset: z.string().optional(),
    referenceReset: z.string().optional(),
  })
  .strict();

export const ExecutionRequestSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('ping'),
      id: messageIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('echo'),
      id: messageIdSchema,
      payload: z.unknown(),
    })
    .strict(),
  javascriptInitSchema,
  javascriptRunCaseSchema,
  sqliteInitSchema,
  sqliteRunCaseSchema,
]);

export const ExecutionResponseSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('pong'),
      id: messageIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('echoResult'),
      id: messageIdSchema,
      payload: z.unknown(),
    })
    .strict(),
  z
    .object({
      type: z.literal('javascriptInited'),
      id: messageIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('javascriptCaseResult'),
      id: messageIdSchema,
      pass: z.boolean(),
      userValue: z.unknown().optional(),
      referenceValue: z.unknown().optional(),
      message: z.string().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('sqliteInited'),
      id: messageIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('sqliteCaseResult'),
      id: messageIdSchema,
      pass: z.boolean(),
      userRows: z.array(z.string()).optional(),
      referenceRows: z.array(z.string()).optional(),
      message: z.string().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('error'),
      id: messageIdSchema,
      message: z.string().min(1),
    })
    .strict(),
]);

export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;
export type ExecutionResponse = z.infer<typeof ExecutionResponseSchema>;

export function parseExecutionRequest(value: unknown): ExecutionRequest {
  return ExecutionRequestSchema.parse(value);
}

export function isExecutionRequest(value: unknown): value is ExecutionRequest {
  return ExecutionRequestSchema.safeParse(value).success;
}

export function parseExecutionResponse(value: unknown): ExecutionResponse {
  return ExecutionResponseSchema.parse(value);
}

export function isExecutionResponse(value: unknown): value is ExecutionResponse {
  return ExecutionResponseSchema.safeParse(value).success;
}
