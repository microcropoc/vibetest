import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { SqlJsStatic } from 'sql.js';

import {
  compileJavascriptPracticeCallable,
  type JavascriptPracticeTarget,
} from '../execution/javascript-practice-compile';
import { runJavascriptCaseComparison } from '../player/step-engine/javascript/run-javascript-case';
import type { JavascriptPracticeResult } from '../player/step-engine/javascript/javascript-practice-runner';
import type { JavascriptStep } from '../player/step-engine/javascript/javascript-step-engine';
import type { RegexPracticeResult } from '../player/step-engine/regex/regex-practice-runner';
import type { RegexStep } from '../player/step-engine/regex/regex-step-engine';
import { loadSqlJs } from '../execution/sqlite-engine';
import {
  closeSqlitePracticeSession,
  openSqlitePracticeSession,
  runSqlitePracticeCase,
  type SqlitePracticeSession,
} from '../execution/sqlite-practice-core';
import type { SqlitePracticeResult } from '../player/step-engine/sqlite/sqlite-practice-runner';
import type { SqliteStep } from '../player/step-engine/sqlite/sqlite-step-engine';

import { practiceRunFailure, practiceRunSuccess } from '../player/step-engine/practice-run-result';

import type { PracticeReferenceValidationDeps } from './validate-practice-references';

const REFERENCE_SELF_CHECK_TIMINGS = { userMs: 0, referenceMs: 0 } as const;

function resolveJavascriptTarget(step: JavascriptStep): JavascriptPracticeTarget {
  if (step.content.functionName !== undefined) {
    return { kind: 'function', name: step.content.functionName };
  }
  if (step.content.construct !== undefined) {
    return { kind: 'construct', className: step.content.construct.className };
  }
  throw new Error('Exactly one of functionName or construct is required');
}

export async function runJavascriptReferenceSelfCheck(
  step: JavascriptStep,
  userSolution: string = step.content.referenceSolution,
): Promise<JavascriptPracticeResult> {
  const reference = step.content.referenceSolution;
  const target = resolveJavascriptTarget(step);
  const userEnv = compileJavascriptPracticeCallable(step.content.setup, userSolution, target);
  const referenceEnv = compileJavascriptPracticeCallable(step.content.setup, reference, target);
  const deadlineMs = Date.now() + step.content.timeoutMs;
  const opts = (): Parameters<typeof runJavascriptCaseComparison>[4] => ({
    userTimers: userEnv.timers,
    referenceTimers: referenceEnv.timers,
    userGlobal: userEnv.globalBag,
    referenceGlobal: referenceEnv.globalBag,
  });

  const totalTests = step.content.tests.length;
  for (let i = 0; i < step.content.tests.length; i += 1) {
    const testCase = step.content.tests[i];
    userEnv.applyReset(step.content.reset ?? '');
    referenceEnv.applyReset(step.content.reset ?? '');
    const result = await runJavascriptCaseComparison(
      userEnv.invoke,
      referenceEnv.invoke,
      testCase.args,
      testCase.calls,
      {
        ...opts(),
        rejects: testCase.rejects,
        expectInvocations: testCase.expectInvocations,
        advanceMs: testCase.advanceMs,
        flushMicrotasks: testCase.flushMicrotasks,
        unordered: testCase.unordered,
        resultMode: step.content.resultMode,
        structure: step.content.structure,
        checker: step.content.checker,
        deadlineMs,
      },
    );
    if (!result.pass) {
      return practiceRunFailure(i, totalTests, result.message ?? 'Test case failed');
    }
  }
  return practiceRunSuccess(totalTests, REFERENCE_SELF_CHECK_TIMINGS);
}

export async function runRegexReferenceSelfCheck(
  step: RegexStep,
  userPattern: string = step.content.referenceSolution,
): Promise<RegexPracticeResult> {
  const referencePattern = step.content.referenceSolution;
  let userRe: RegExp;
  let referenceRe: RegExp;
  try {
    userRe = new RegExp(userPattern);
    referenceRe = new RegExp(referencePattern);
  } catch {
    return practiceRunFailure(0, step.content.tests.length, 'Invalid regular expression');
  }

  const totalTests = step.content.tests.length;
  for (let i = 0; i < step.content.tests.length; i += 1) {
    const input = step.content.tests[i].input;
    const userResult = userRe.test(input);
    const referenceResult = referenceRe.test(input);
    if (userResult !== referenceResult) {
      return practiceRunFailure(i, totalTests, 'RegExp.test results do not match');
    }
  }
  return practiceRunSuccess(totalTests, REFERENCE_SELF_CHECK_TIMINGS);
}

let sqlModulePromise: Promise<SqlJsStatic> | undefined;

/** Same `loadSqlJs` as the worker; the wasm comes from disk instead of `locateFile`. */
export function loadSqlJsForSpecs(): Promise<SqlJsStatic> {
  if (sqlModulePromise === undefined) {
    const wasm = readFileSync(join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'));
    sqlModulePromise = loadSqlJs({ wasmBinary: new Uint8Array(wasm).buffer });
  }
  return sqlModulePromise;
}

export async function runSqliteReferenceSelfCheck(
  step: SqliteStep,
  userQuery: string = step.content.referenceSolution,
): Promise<SqlitePracticeResult> {
  const { content } = step;
  const totalTests = content.tests.length;
  const SQL = await loadSqlJsForSpecs();

  let session: SqlitePracticeSession;
  try {
    session = openSqlitePracticeSession(SQL, {
      setup: content.setup,
      userQuery,
      referenceQuery: content.referenceSolution,
      orderMatters: content.orderMatters,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Setup SQL failed';
    return practiceRunFailure(0, totalTests, message);
  }

  try {
    for (let i = 0; i < content.tests.length; i += 1) {
      const outcome = runSqlitePracticeCase(session, {
        seed: content.tests[i].seed,
        userReset: content.reset,
        referenceReset: content.reset,
      });
      if (!outcome.pass) {
        return practiceRunFailure(i, totalTests, outcome.message ?? 'Test case failed');
      }
    }
    return practiceRunSuccess(totalTests, REFERENCE_SELF_CHECK_TIMINGS);
  } finally {
    closeSqlitePracticeSession(session);
  }
}

export function createInProcessPracticeReferenceValidationDeps(): PracticeReferenceValidationDeps {
  return {
    runJavascriptStep: runJavascriptReferenceSelfCheck,
    runSqliteStep: runSqliteReferenceSelfCheck,
    runRegexStep: runRegexReferenceSelfCheck,
  };
}
