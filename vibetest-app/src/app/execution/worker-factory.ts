/** Creates module Workers (see REPORT: `new URL(..., import.meta.url)` + `{ type: 'module' }`). */
export function createModuleWorker(scriptUrl: URL): Worker {
  return new Worker(scriptUrl, { type: 'module' });
}

export type WorkerFactory = (scriptUrl: URL) => Worker;

export const defaultWorkerFactory: WorkerFactory = createModuleWorker;
