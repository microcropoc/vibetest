export function formatBuildVersionLabel(commitShort: string, commitSubject: string): string {
  const hash = commitShort.trim() || 'unknown';
  const subject = commitSubject.trim() || 'dev';
  return `${hash} · ${subject}`;
}
