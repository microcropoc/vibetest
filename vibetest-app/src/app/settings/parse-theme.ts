import { z } from 'zod';

import type { Theme } from './theme.model';

const ThemeSchema = z.enum(['light', 'dark', 'eink']);

export function isTheme(value: unknown): value is Theme {
  return ThemeSchema.safeParse(value).success;
}

export function parseTheme(value: unknown): Theme {
  return ThemeSchema.parse(value);
}
