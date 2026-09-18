import { z } from 'zod';

import {
  JavascriptContentSchema,
  QuizContentSchema,
  RegexContentSchema,
  SqliteContentSchema,
  SvgContentSchema,
  TheoryContentSchema,
  UuidSchema,
} from './generated/content-schemas.zod';

const stepTitleSchema = z.string().min(1).max(200);

export const StepSchema = z.discriminatedUnion('type', [
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('theory'),
      title: stepTitleSchema,
      content: TheoryContentSchema,
    })
    .strict(),
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('svg'),
      title: stepTitleSchema,
      content: SvgContentSchema,
    })
    .strict(),
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('quiz'),
      title: stepTitleSchema,
      content: QuizContentSchema,
    })
    .strict(),
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('javascript'),
      title: stepTitleSchema,
      content: JavascriptContentSchema,
    })
    .strict(),
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('sqlite'),
      title: stepTitleSchema,
      content: SqliteContentSchema,
    })
    .strict(),
  z
    .object({
      stepId: UuidSchema,
      type: z.literal('regex'),
      title: stepTitleSchema,
      content: RegexContentSchema,
    })
    .strict(),
]);

export const ModuleSchema = z
  .object({
    moduleId: UuidSchema,
    title: z.string().min(1).max(120),
    steps: z.array(StepSchema).min(1).max(200),
  })
  .strict();

export const CourseSchema = z
  .object({
    schemaVersion: z.literal(1),
    courseId: UuidSchema,
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(2000),
    modules: z.array(ModuleSchema).min(1).max(100),
  })
  .strict();
