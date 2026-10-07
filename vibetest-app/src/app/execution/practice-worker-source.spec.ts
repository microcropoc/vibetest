import { ReusableWorkerSource, singleUseWorkerSource } from './practice-worker-source';

function fakeWorker(): Worker & { terminated: boolean } {
  const worker = {
    terminated: false,
    terminate() {
      worker.terminated = true;
    },
  };
  return worker as unknown as Worker & { terminated: boolean };
}

describe('practice worker sources', () => {
  it('single-use source terminates the worker after each run', async () => {
    const workers: ReturnType<typeof fakeWorker>[] = [];
    const source = singleUseWorkerSource(() => {
      const worker = fakeWorker();
      workers.push(worker);
      return worker;
    });
    const first = await source.acquire();
    source.release(first);
    const second = await source.acquire();
    expect(second).not.toBe(first);
    expect(workers[0].terminated).toBe(true);
  });

  it('reusable source keeps one worker until discard', async () => {
    const factory = vi.fn(() => fakeWorker());
    const source = new ReusableWorkerSource(factory);
    const first = await source.acquire();
    source.release(first);
    const again = await source.acquire();
    expect(again).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);

    source.discard(again);
    expect((first as ReturnType<typeof fakeWorker>).terminated).toBe(true);
    expect(await source.acquire()).not.toBe(first);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('reusable source hands the worker to the next holder only after release', async () => {
    const source = new ReusableWorkerSource(() => fakeWorker());
    const first = await source.acquire();
    let secondHolder: Worker | undefined;
    const second = source.acquire().then((worker) => {
      secondHolder = worker;
      return worker;
    });
    await Promise.resolve();
    expect(secondHolder).toBeUndefined();

    source.release(first);
    expect(await second).toBe(first);
  });

  it('reusable source gives the waiting holder a fresh worker after discard', async () => {
    const factory = vi.fn(() => fakeWorker());
    const source = new ReusableWorkerSource(factory);
    const first = (await source.acquire()) as ReturnType<typeof fakeWorker>;
    const second = source.acquire();

    source.discard(first);
    const next = (await second) as ReturnType<typeof fakeWorker>;
    expect(first.terminated).toBe(true);
    expect(next).not.toBe(first);
    expect(next.terminated).toBe(false);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('reusable source does not keep the lease when the worker cannot be created', async () => {
    let fail = true;
    const source = new ReusableWorkerSource(() => {
      if (fail) {
        throw new Error('Worker blocked');
      }
      return fakeWorker();
    });
    await expect(source.acquire()).rejects.toThrow('Worker blocked');

    fail = false;
    const worker = await source.acquire();
    expect(worker).toBeDefined();
  });

  it('reusable source rejects the waiting holder when the replacement worker cannot be created', async () => {
    let fail = false;
    const source = new ReusableWorkerSource(() => {
      if (fail) {
        throw new Error('Worker blocked');
      }
      return fakeWorker();
    });
    const first = await source.acquire();
    const second = source.acquire();

    fail = true;
    source.discard(first);
    await expect(second).rejects.toThrow('Worker blocked');

    fail = false;
    const next = await source.acquire();
    expect(next).not.toBe(first);
  });

  it('dispose terminates the kept worker and rejects waiting holders', async () => {
    const source = new ReusableWorkerSource(() => fakeWorker());
    const worker = (await source.acquire()) as ReturnType<typeof fakeWorker>;
    const waiting = source.acquire();
    source.dispose();
    expect(worker.terminated).toBe(true);
    await expect(waiting).rejects.toThrow('Worker source is disposed');
    await expect(source.acquire()).rejects.toThrow('Worker source is disposed');
  });
});
