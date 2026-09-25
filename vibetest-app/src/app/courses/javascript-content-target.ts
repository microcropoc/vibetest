import { z } from 'zod';

import { JavascriptContentSchema } from './generated/content-schemas.zod';

/** Exactly one of functionName | construct (json-schema allOf/oneOf is not used — generator emits broken Zod). */
export const JavascriptContentWithTargetSchema = JavascriptContentSchema.superRefine((value, ctx) => {
  const hasFunction = value.functionName !== undefined;
  const hasConstruct = value.construct !== undefined;
  if (hasFunction === hasConstruct) {
    ctx.addIssue({
      code: 'custom',
      message: 'Exactly one of functionName or construct is required',
      path: hasFunction ? ['construct'] : ['functionName'],
    });
  }
});

export type JavascriptContentWithTarget = z.infer<typeof JavascriptContentWithTargetSchema>;
