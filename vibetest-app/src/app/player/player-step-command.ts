import type { CoreStepCommand } from './step-engine/step-engine-command';
import type { JavascriptStepCommand } from './step-engine/javascript/javascript-step-engine';
import type { QuizStepCommand } from './step-engine/quiz/quiz-step-engine';
import type { RegexStepCommand } from './step-engine/regex/regex-step-engine';
import type { SqliteStepCommand } from './step-engine/sqlite/sqlite-step-engine';
import type { SvgStepCommand } from './step-engine/svg/svg-step-engine';
import type { TheoryStepCommand } from './step-engine/theory/theory-step-engine';

/** Commands the player orchestrator accepts from step UI (vt-21–23). */
export type PlayerStepCommand =
  | TheoryStepCommand
  | QuizStepCommand
  | SvgStepCommand
  | JavascriptStepCommand
  | SqliteStepCommand
  | RegexStepCommand;

export type { CoreStepCommand };
