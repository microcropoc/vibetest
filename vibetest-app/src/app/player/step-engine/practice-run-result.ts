export type PracticeRunResult =
  | {
      readonly ok: true;
      readonly totalTests: number;
      readonly userMs: number;
      readonly referenceMs: number;
    }
  | {
      readonly ok: false;
      readonly failedTestIndex: number;
      readonly totalTests: number;
      readonly message: string;
    };

export type PracticeCaseTimings = {
  readonly userMs: number;
  readonly referenceMs: number;
};

export interface PracticeTimingAccumulator {
  add(timings: PracticeCaseTimings): void;
  totals(): PracticeCaseTimings;
}

export function createPracticeTimingAccumulator(): PracticeTimingAccumulator {
  let userMs = 0;
  let referenceMs = 0;
  return {
    add(timings: PracticeCaseTimings): void {
      userMs += timings.userMs;
      referenceMs += timings.referenceMs;
    },
    totals(): PracticeCaseTimings {
      return { userMs, referenceMs };
    },
  };
}

export function practiceRunFailure(
  failedTestIndex: number,
  totalTests: number,
  message: string,
): Extract<PracticeRunResult, { ok: false }> {
  return { ok: false, failedTestIndex, totalTests, message };
}

export function practiceRunSuccess(
  totalTests: number,
  timings: PracticeCaseTimings,
): Extract<PracticeRunResult, { ok: true }> {
  return { ok: true, totalTests, userMs: timings.userMs, referenceMs: timings.referenceMs };
}
