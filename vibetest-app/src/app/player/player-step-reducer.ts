import type { Step } from '../courses/course.model';

import type { PlayerStepCommand } from './player-step-command';
import {
  applyJavascriptPracticeResult,
  applyRegexPracticeResult,
  applySqlitePracticeResult,
  type JavascriptEngineState,
  type JavascriptPracticeResult,
  type JavascriptStepCommand,
  type QuizStepCommand,
  type RegexEngineState,
  type RegexPracticeResult,
  type RegexStepCommand,
  type SqliteEngineState,
  type SqlitePracticeResult,
  type SqliteStepCommand,
  type SvgStepCommand,
  type TheoryStepCommand,
} from './step-engine';
import { stepEnginesByType } from './step-engine/step-engine-registry';
import type { StepProgressSnapshot } from './step-engine/step-progress-snapshot';

export function reducePlayerStep(
  step: Step,
  saved: StepProgressSnapshot | undefined,
  command: PlayerStepCommand,
): StepProgressSnapshot {
  switch (step.type) {
    case 'theory': {
      const engine = stepEnginesByType.theory;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as TheoryStepCommand);
      return engine.toSnapshot(next);
    }
    case 'quiz': {
      const engine = stepEnginesByType.quiz;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as QuizStepCommand);
      return engine.toSnapshot(next);
    }
    case 'svg': {
      const engine = stepEnginesByType.svg;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as SvgStepCommand);
      return engine.toSnapshot(next);
    }
    case 'javascript': {
      const engine = stepEnginesByType.javascript;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as JavascriptStepCommand);
      return engine.toSnapshot(next);
    }
    case 'sqlite': {
      const engine = stepEnginesByType.sqlite;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as SqliteStepCommand);
      return engine.toSnapshot(next);
    }
    case 'regex': {
      const engine = stepEnginesByType.regex;
      const state = engine.createInitial(step, saved);
      const next = engine.reduce(state, command as RegexStepCommand);
      return engine.toSnapshot(next);
    }
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

export function applyPracticeResultToStep(
  step: Step,
  saved: StepProgressSnapshot | undefined,
  result: JavascriptPracticeResult | SqlitePracticeResult | RegexPracticeResult,
): StepProgressSnapshot {
  switch (step.type) {
    case 'javascript': {
      const engine = stepEnginesByType.javascript;
      const state = engine.createInitial(step, saved) as JavascriptEngineState;
      const next = applyJavascriptPracticeResult(state, result as JavascriptPracticeResult);
      return engine.toSnapshot(next);
    }
    case 'sqlite': {
      const engine = stepEnginesByType.sqlite;
      const state = engine.createInitial(step, saved) as SqliteEngineState;
      const next = applySqlitePracticeResult(state, result as SqlitePracticeResult);
      return engine.toSnapshot(next);
    }
    case 'regex': {
      const engine = stepEnginesByType.regex;
      const state = engine.createInitial(step, saved) as RegexEngineState;
      const next = applyRegexPracticeResult(state, result as RegexPracticeResult);
      return engine.toSnapshot(next);
    }
    default:
      throw new Error(`Step type "${step.type}" does not support practice runs`);
  }
}
