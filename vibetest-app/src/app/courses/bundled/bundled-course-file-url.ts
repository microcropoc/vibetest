export function bundledCourseFileUrl(file: string): string {
  const path = `bundled-courses/${file}`;
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL(path, document.baseURI).href;
  }
  return `/${path}`;
}
