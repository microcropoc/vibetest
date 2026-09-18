export const BUNDLED_COURSE_SCHEMA_URL = '/schemas/course.schema.json';

export function prettyPrintJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function loadBundledCourseSchema(
  fetchFn: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetchFn(BUNDLED_COURSE_SCHEMA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load course schema (${response.status})`);
  }
  return response.json();
}
