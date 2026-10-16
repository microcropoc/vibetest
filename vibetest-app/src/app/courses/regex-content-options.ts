import { z } from 'zod';

import { RegexContentSchema } from './generated/content-schemas.zod';

const VALID_FLAG_CHARS = new Set(['g', 'i', 'm', 's', 'u', 'v', 'y', 'd']);

function validateRegexFlags(flags: string, path: (string | number)[], ctx: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const char of flags) {
    if (!VALID_FLAG_CHARS.has(char)) {
      ctx.addIssue({
        code: 'custom',
        message: `Invalid RegExp flag: ${char}`,
        path,
      });
      return;
    }
    if (seen.has(char)) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate RegExp flag: ${char}`,
        path,
      });
      return;
    }
    seen.add(char);
  }
  if (seen.has('u') && seen.has('v')) {
    ctx.addIssue({
      code: 'custom',
      message: 'RegExp flags u and v cannot be used together',
      path,
    });
  }
}

/** Cross-field rules for regexContent (replacement, flags with literal format). */
export const RegexContentWithOptionsSchema = RegexContentSchema.superRefine((value, ctx) => {
  const mode = value.mode ?? 'test';
  const answerFormat = value.answerFormat ?? 'pattern';

  if (mode === 'replace') {
    if (value.replacement === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'replacement is required when mode is replace',
        path: ['replacement'],
      });
    }
  } else if (value.replacement !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'replacement is only allowed when mode is replace',
      path: ['replacement'],
    });
  }

  if (value.flags !== undefined) {
    validateRegexFlags(value.flags, ['flags'], ctx);
    if (answerFormat === 'literal') {
      ctx.addIssue({
        code: 'custom',
        message: 'flags must not be set when answerFormat is literal',
        path: ['flags'],
      });
    }
  }

  if (mode !== 'matchAll' && value.unordered !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'unordered is only allowed when mode is matchAll',
      path: ['unordered'],
    });
  }
});

export type RegexContentWithOptions = z.infer<typeof RegexContentWithOptionsSchema>;
