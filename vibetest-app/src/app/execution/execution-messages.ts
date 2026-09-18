import { z } from 'zod';

const messageIdSchema = z.string().min(1);

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
