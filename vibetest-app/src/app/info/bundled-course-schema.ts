const BUNDLED_COURSE_IMPORT_SCHEMA_PATH = 'schemas/course-import.schema.json';
const BUNDLED_MODULE_IMPORT_SCHEMA_PATH = 'schemas/module-import.schema.json';

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

export function bundledModuleImportSchemaUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL(BUNDLED_MODULE_IMPORT_SCHEMA_PATH, document.baseURI).href;
  }
  return '/schemas/module-import.schema.json';
}

export async function loadBundledModuleImportSchema(
  fetchFn: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetchFn(bundledModuleImportSchemaUrl());
  if (!response.ok) {
    throw errorMessageForModuleSchema(response.status);
  }
  return response.json();
}

function errorMessageForModuleSchema(status: number): Error {
  return new Error(`Failed to load module import schema (${status})`);
}
