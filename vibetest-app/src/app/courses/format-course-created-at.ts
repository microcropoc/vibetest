const createdAtFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC',
});

/** Human-readable label for canonical `Course.createdAt` (ISO 8601). */
export function formatCourseCreatedAt(iso: string): string {
  return createdAtFormatter.format(new Date(iso));
}
