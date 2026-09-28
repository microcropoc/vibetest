import { UuidSchema } from '../courses/generated/content-schemas.zod';

export function parseBundledCoursesSeen(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error('bundledCoursesSeen must be an array');
  }
  return value.map((item, index) => {
    const parsed = UuidSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error(`bundledCoursesSeen[${index}]: invalid UUID`);
    }
    return parsed.data;
  });
}
