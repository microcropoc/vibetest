import { z } from 'zod';

import type { CodeTypography, UiTypography } from './typography.model';

const FontSizeStepSchema = z.enum(['s', 'm', 'l']);

const UiTypographySchema = z.object({
  family: z.enum(['system', 'serif']),
  size: FontSizeStepSchema,
});

const CodeTypographySchema = z.object({
  family: z.enum(['ui-monospace', 'consolas']),
  size: FontSizeStepSchema,
});

export function parseUiTypography(value: unknown): UiTypography {
  return UiTypographySchema.parse(value);
}

export function tryParseUiTypography(value: unknown): UiTypography | undefined {
  const parsed = UiTypographySchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parseCodeTypography(value: unknown): CodeTypography {
  return CodeTypographySchema.parse(value);
}

export function tryParseCodeTypography(value: unknown): CodeTypography | undefined {
  const parsed = CodeTypographySchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
