import type { PracticeGlobalBag } from './javascript-practice-global';

export const MAX_PENDING_TIMERS = 500;
export const MAX_TIMER_CALLBACKS_PER_ADVANCE = 500;

type TimerEntry = {
  readonly fireAt: number;
  readonly callback: () => void;
  readonly kind: 'timeout' | 'interval';
  readonly intervalMs?: number;
};

export type FakeTimerController = {
  readonly advanceMs: (ms: number) => void;
  readonly flushMicrotasks: () => Promise<void>;
  readonly reset: () => void;
};

export function installFakeTimers(bag: PracticeGlobalBag): FakeTimerController {
  let nowMs = 0;
  let nextId = 1;
  const timers = new Map<number, TimerEntry>();

  const schedule = (callback: () => void, delayMs: number, kind: 'timeout' | 'interval', intervalMs?: number): number => {
    if (timers.size >= MAX_PENDING_TIMERS) {
      throw new Error('Too many pending timers');
    }
    const id = nextId;
    nextId += 1;
    const delay = Number(delayMs);
    const safeDelay = Number.isFinite(delay) && delay >= 0 ? delay : 0;
    timers.set(id, {
      fireAt: nowMs + safeDelay,
      callback,
      kind,
      intervalMs: kind === 'interval' ? (Number.isFinite(intervalMs) && (intervalMs ?? 0) >= 0 ? intervalMs : 0) : undefined,
    });
    return id;
  };

  const clearById = (id: unknown): void => {
    if (typeof id === 'number' && Number.isInteger(id)) {
      timers.delete(id);
    }
  };

  bag['setTimeout'] = (callback: unknown, delayMs?: unknown) => {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    const cb = callback as () => void;
    return schedule(cb, typeof delayMs === 'number' ? delayMs : 0, 'timeout');
  };

  bag['setInterval'] = (callback: unknown, intervalMs?: unknown) => {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    const cb = callback as () => void;
    const interval = typeof intervalMs === 'number' ? intervalMs : 0;
    return schedule(cb, interval, 'interval', interval);
  };

  bag['clearTimeout'] = clearById;
  bag['clearInterval'] = clearById;

  const fireDueTimers = (callbacksRun: { count: number }): void => {
    while (callbacksRun.count < MAX_TIMER_CALLBACKS_PER_ADVANCE) {
      const due = [...timers.entries()]
        .filter(([, entry]) => entry.fireAt <= nowMs)
        .sort((a, b) => a[1].fireAt - b[1].fireAt || a[0] - b[0]);
      if (due.length === 0) {
        return;
      }
      for (const [id, entry] of due) {
        if (entry.fireAt > nowMs) {
          continue;
        }
        if (!timers.has(id)) {
          continue;
        }
        if (entry.kind === 'timeout') {
          timers.delete(id);
        } else {
          const interval = entry.intervalMs ?? 0;
          timers.set(id, { ...entry, fireAt: nowMs + interval });
        }
        entry.callback();
        callbacksRun.count += 1;
        if (callbacksRun.count >= MAX_TIMER_CALLBACKS_PER_ADVANCE) {
          throw new Error('Too many timer callbacks');
        }
      }
    }
    throw new Error('Too many timer callbacks');
  };

  return {
    advanceMs(ms: number) {
      const delta = typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 ? ms : 0;
      const targetNow = nowMs + delta;
      const callbacksRun = { count: 0 };
      if (targetNow === nowMs) {
        fireDueTimers(callbacksRun);
        return;
      }
      while (nowMs < targetNow) {
        const pendingTimes = [...timers.values()].map((entry) => entry.fireAt);
        const nextEvent =
          pendingTimes.length > 0 ? Math.min(...pendingTimes, targetNow) : targetNow;
        nowMs = nextEvent;
        fireDueTimers(callbacksRun);
      }
    },
    async flushMicrotasks() {
      await Promise.resolve();
    },
    reset() {
      nowMs = 0;
      nextId = 1;
      timers.clear();
    },
  };
}

export const JAVASCRIPT_PRACTICE_TIMER_PREAMBLE = `
var setTimeout = __vibetestGlobal.setTimeout;
var setInterval = __vibetestGlobal.setInterval;
var clearTimeout = __vibetestGlobal.clearTimeout;
var clearInterval = __vibetestGlobal.clearInterval;
`;
