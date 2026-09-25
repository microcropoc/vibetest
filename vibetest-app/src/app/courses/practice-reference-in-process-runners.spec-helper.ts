import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  compileJavascriptPracticeCallable,
  type JavascriptPracticeTarget,
} from '../execution/javascript-practice-compile';
import { runJavascriptCaseComparison } from '../player/step-engine/javascript/run-javascript-case';
import type { JavascriptPracticeResult } from '../player/step-engine/javascript/javascript-practice-runner';
import type { JavascriptStep } from '../player/step-engine/javascript/javascript-step-engine';
import type { RegexPracticeResult } from '../player/step-engine/regex/regex-practice-runner';
import type { RegexStep } from '../player/step-engine/regex/regex-step-engine';
import { collectRowsFromExecResults, compareSqliteResultRows } from '../execution/sqlite-result-rows';
import type { InitSqlJs, SqlJsDatabase, SqlJsStatic } from '../execution/sqlite-worker-types';
import {
  sqliteWasmAssetUrl,
  type SqlitePracticeResult,
} from '../player/step-engine/sqlite/sqlite-practice-runner';
import type { SqliteStep } from '../player/step-engine/sqlite/sqlite-step-engine';

import type { PracticeReferenceValidationDeps } from './validate-practice-references';

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
): Promise<JavascriptPracticeResult> {
  const reference = step.content.referenceSolution;
  const target = resolveJavascriptTarget(step);
  const userEnv = compileJavascriptPracticeCallable(step.content.setup, reference, target);
  const referenceEnv = compileJavascriptPracticeCallable(step.content.setup, reference, target);
  const deadlineMs = Date.now() + step.content.timeoutMs;
  const opts = (): Parameters<typeof runJavascriptCaseComparison>[4] => ({
    userTimers: userEnv.timers,
    referenceTimers: referenceEnv.timers,
    userGlobal: userEnv.globalBag,
    referenceGlobal: referenceEnv.globalBag,
  });

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
      return {
        ok: false,
        failedTestIndex: i,
        message: result.message ?? 'Test case failed',
      };
    }
  }
  return { ok: true };
}

export async function runRegexReferenceSelfCheck(step: RegexStep): Promise<RegexPracticeResult> {
  const pattern = step.content.referenceSolution;
  let userRe: RegExp;
  let referenceRe: RegExp;
  try {
    userRe = new RegExp(pattern);
    referenceRe = new RegExp(pattern);
  } catch {
    return { ok: false, failedTestIndex: 0, message: 'Invalid regular expression' };
  }

  for (let i = 0; i < step.content.tests.length; i += 1) {
    const input = step.content.tests[i].input;
    const userResult = userRe.test(input);
    const referenceResult = referenceRe.test(input);
    if (userResult !== referenceResult) {
      return {
        ok: false,
        failedTestIndex: i,
        message: 'RegExp.test results do not match',
      };
    }
  }
  return { ok: true };
}

let sqlModulePromise: Promise<SqlJsStatic> | undefined;

async function loadSqlJs(wasmUrl: string, scriptUrl: string): Promise<SqlJsStatic> {
  const module = (await import(/* @vite-ignore */ scriptUrl)) as {
    default: InitSqlJs;
  };
  return module.default({ locateFile: () => wasmUrl });
}

async function loadSqlModule(): Promise<SqlJsStatic> {
  if (sqlModulePromise === undefined) {
    const browserWasmUrl = sqliteWasmAssetUrl();
    const browserScriptUrl = new URL('sql-wasm.js', browserWasmUrl).href;
    try {
      sqlModulePromise = loadSqlJs(browserWasmUrl, browserScriptUrl);
      return await sqlModulePromise;
    } catch {
      const wasmFile = pathToFileURL(join(process.cwd(), 'public', 'sql-wasm.wasm')).href;
      const scriptFile = pathToFileURL(join(process.cwd(), 'public', 'sql-wasm.js')).href;
      sqlModulePromise = loadSqlJs(wasmFile, scriptFile);
    }
  }
  return sqlModulePromise;
}

function runOptionalSql(db: SqlJsDatabase, sql: string | undefined): void {
  const trimmed = (sql ?? '').trim();
  if (trimmed === '') {
    return;
  }
  db.exec(trimmed);
}

function queryResultRows(db: SqlJsDatabase, sql: string): readonly string[] {
  return collectRowsFromExecResults(db.exec(sql));
}

export async function runSqliteReferenceSelfCheck(
  step: SqliteStep,
): Promise<SqlitePracticeResult> {
  const { content } = step;
  const query = content.referenceSolution;
  let SQL: SqlJsStatic;
  try {
    SQL = await loadSqlModule();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load sql.js';
    return { ok: false, failedTestIndex: 0, message };
  }

  const userDb = new SQL.Database();
  const referenceDb = new SQL.Database();
  try {
    runOptionalSql(userDb, content.setup);
    runOptionalSql(referenceDb, content.setup);

    for (let i = 0; i < content.tests.length; i += 1) {
      runOptionalSql(userDb, content.reset);
      runOptionalSql(referenceDb, content.reset);
      runOptionalSql(userDb, content.tests[i].seed);
      runOptionalSql(referenceDb, content.tests[i].seed);
      const userRows = queryResultRows(userDb, query);
      const referenceRows = queryResultRows(referenceDb, query);
      const pass = compareSqliteResultRows(userRows, referenceRows, content.orderMatters);
      if (!pass) {
        return {
          ok: false,
          failedTestIndex: i,
          message: 'Query results do not match',
        };
      }
    }
    return { ok: true };
  } finally {
    userDb.close();
    referenceDb.close();
  }
}

export function createInProcessPracticeReferenceValidationDeps(): PracticeReferenceValidationDeps {
  return {
    runJavascriptStep: runJavascriptReferenceSelfCheck,
    runSqliteStep: runSqliteReferenceSelfCheck,
    runRegexStep: runRegexReferenceSelfCheck,
  };
}
