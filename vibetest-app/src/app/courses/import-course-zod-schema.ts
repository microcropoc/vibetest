import { z } from 'zod';

import {
  JavascriptContentSchema,
  QuizContentSchema,
  RegexContentSchema,
  SqliteContentSchema,
  SvgContentSchema,
  TheoryContentSchema,
} from './generated/content-schemas.zod';

const stepTitleSchema = z.string().min(1).max(200);

export const ImportStepSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('theory'),
      title: stepTitleSchema,
      content: TheoryContentSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('svg'),
      title: stepTitleSchema,
      content: SvgContentSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('quiz'),
      title: stepTitleSchema,
      content: QuizContentSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('javascript'),
      title: stepTitleSchema,
      content: JavascriptContentSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('sqlite'),
      title: stepTitleSchema,
      content: SqliteContentSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('regex'),
      title: stepTitleSchema,
      content: RegexContentSchema,
    })
    .strict(),
]);

export const ImportModuleSchema = z
  .object({
    title: z.string().min(1).max(120),
    steps: z.array(ImportStepSchema).min(1).max(200),
  })
  .strict();

export const ImportCourseSchema = z
  .object({
    schemaVersion: z.literal(1),
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(2000),
    modules: z.array(ImportModuleSchema).min(1).max(100),
  })
  .strict();

export type ImportCourse = z.infer<typeof ImportCourseSchema>;
