import { z } from 'zod';

import {
  assertPracticeIdentifier,
  assertPracticeIdentifierSyntax,
} from '../execution/javascript-practice-identifier';
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

  if (value.functionName !== undefined) {
    try {
      assertPracticeIdentifier(value.functionName, 'functionName');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid functionName';
      ctx.addIssue({ code: 'custom', message, path: ['functionName'] });
    }
  }

  if (value.construct !== undefined) {
    try {
      assertPracticeIdentifier(value.construct.className, 'className');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid className';
      ctx.addIssue({ code: 'custom', message, path: ['construct', 'className'] });
    }
  }

  value.tests.forEach((testCase, testIndex) => {
    testCase.calls?.forEach((call, callIndex) => {
      if (call.method === undefined) {
        return;
      }
      try {
        assertPracticeIdentifierSyntax(call.method, 'method');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid method';
        ctx.addIssue({
          code: 'custom',
          message,
          path: ['tests', testIndex, 'calls', callIndex, 'method'],
        });
      }
    });
  });
});

export type JavascriptContentWithTarget = z.infer<typeof JavascriptContentWithTargetSchema>;
