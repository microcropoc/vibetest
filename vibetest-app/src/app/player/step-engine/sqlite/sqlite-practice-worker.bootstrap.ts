/** Lazy-loaded so sql.js worker bundling stays out of the main player chunk graph. */
export function createSqlitePracticeWorker(): Worker {
  return new Worker(new URL('../../../execution/sqlite-practice.worker.ts', import.meta.url), {
    type: 'module',
  });
}
