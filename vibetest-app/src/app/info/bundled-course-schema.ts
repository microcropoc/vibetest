const BUNDLED_COURSE_IMPORT_SCHEMA_PATH = 'schemas/course-import.schema.json';

export function bundledCourseImportSchemaUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL(BUNDLED_COURSE_IMPORT_SCHEMA_PATH, document.baseURI).href;
  }
  return '/schemas/course-import.schema.json';
}

export function prettyPrintJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function loadBundledCourseImportSchema(
  fetchFn: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetchFn(bundledCourseImportSchemaUrl());
  if (!response.ok) {
    throw new Error(`Failed to load course import schema (${response.status})`);
  }
  return response.json();
}
