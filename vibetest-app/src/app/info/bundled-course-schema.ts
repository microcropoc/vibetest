export function bundledCourseSchemaUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('schemas/course.schema.json', document.baseURI).href;
  }
  return '/schemas/course.schema.json';
}

export function prettyPrintJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function loadBundledCourseSchema(
  fetchFn: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetchFn(bundledCourseSchemaUrl());
  if (!response.ok) {
    throw new Error(`Failed to load course schema (${response.status})`);
  }
  return response.json();
}
