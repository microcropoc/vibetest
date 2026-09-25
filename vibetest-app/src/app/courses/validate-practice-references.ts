import type { ExecutionWorkerWrapperService } from '../execution/execution-worker-wrapper.service';
import {
  ExecutionProtocolError,
  ExecutionTimeoutError,
} from '../execution/execution-errors';
import {
  createJavascriptPracticeWorker,
  runJavascriptPractice,
  type JavascriptPracticeResult,
} from '../player/step-engine/javascript/javascript-practice-runner';
import type { JavascriptStep } from '../player/step-engine/javascript/javascript-step-engine';
import {
  createRegexPracticeWorker,
  runRegexPractice,
  type RegexPracticeResult,
} from '../player/step-engine/regex/regex-practice-runner';
import type { RegexStep } from '../player/step-engine/regex/regex-step-engine';
import {
  runSqlitePractice,
  sqliteWasmAssetUrl,
  type SqlitePracticeResult,
} from '../player/step-engine/sqlite/sqlite-practice-runner';
import { createSqlitePracticeWorker } from '../player/step-engine/sqlite/sqlite-practice-worker.bootstrap';
import type { SqliteStep } from '../player/step-engine/sqlite/sqlite-step-engine';

import type { Course, Step } from './course.model';
import type { SemanticIssue } from './semantic-validation';

export type PracticeReferenceValidationDeps = {
  readonly runJavascriptStep: (step: JavascriptStep) => Promise<JavascriptPracticeResult>;
  readonly runSqliteStep: (step: SqliteStep) => Promise<SqlitePracticeResult>;
  readonly runRegexStep: (step: RegexStep) => Promise<RegexPracticeResult>;
};

export function createWorkerPracticeReferenceValidationDeps(
  wrapper: ExecutionWorkerWrapperService,
): PracticeReferenceValidationDeps {
  const sqliteWasmUrl = sqliteWasmAssetUrl();
  return {
    runJavascriptStep: (step) =>
      runJavascriptPractice(step, step.content.referenceSolution, {
        wrapper,
        createWorker: createJavascriptPracticeWorker,
      }),
    runSqliteStep: (step) =>
      runSqlitePractice(step, step.content.referenceSolution, {
        wrapper,
        createWorker: createSqlitePracticeWorker,
        wasmUrl: sqliteWasmUrl,
      }),
    runRegexStep: (step) =>
      runRegexPractice(step, step.content.referenceSolution, {
        wrapper,
        createWorker: createRegexPracticeWorker,
      }),
  };
}

function practiceFailureMessage(
  result: JavascriptPracticeResult | SqlitePracticeResult | RegexPracticeResult,
): string {
  if (result.ok) {
    return 'Unexpected pass';
  }
  return `test ${result.failedTestIndex}: ${result.message}`;
}

function runtimeFailureMessage(error: unknown): string {
  if (error instanceof ExecutionTimeoutError) {
    return error.message;
  }
  if (error instanceof ExecutionProtocolError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Runtime error';
}

async function validatePracticeStep(
  step: Step,
  deps: PracticeReferenceValidationDeps,
): Promise<SemanticIssue | undefined> {
  if (step.type === 'javascript') {
    const result = await deps.runJavascriptStep(step);
    if (!result.ok) {
      return { path: '', message: practiceFailureMessage(result) };
    }
    return undefined;
  }

  if (step.type === 'sqlite') {
    const result = await deps.runSqliteStep(step);
    if (!result.ok) {
      return { path: '', message: practiceFailureMessage(result) };
    }
    return undefined;
  }

  if (step.type === 'regex') {
    const result = await deps.runRegexStep(step);
    if (!result.ok) {
      return { path: '', message: practiceFailureMessage(result) };
    }
    return undefined;
  }

  return undefined;
}

/**
 * Runs each javascript/sqlite/regex step with referenceSolution on both sides (dual-run self-check).
 * Collects all step failures; does not stop at the first failure.
 */
export async function validatePracticeReferences(
  course: Course,
  deps: PracticeReferenceValidationDeps,
): Promise<readonly SemanticIssue[]> {
  const issues: SemanticIssue[] = [];

  for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex += 1) {
    const module = course.modules[moduleIndex];
    for (let stepIndex = 0; stepIndex < module.steps.length; stepIndex += 1) {
      const step = module.steps[stepIndex];
      if (step.type !== 'javascript' && step.type !== 'sqlite' && step.type !== 'regex') {
        continue;
      }

      const path = `modules[${moduleIndex}].steps[${stepIndex}]`;
      try {
        const stepIssue = await validatePracticeStep(step, deps);
        if (stepIssue !== undefined) {
          issues.push({ path, message: stepIssue.message });
        }
      } catch (error: unknown) {
        issues.push({ path, message: runtimeFailureMessage(error) });
      }
    }
  }

  return issues;
}
