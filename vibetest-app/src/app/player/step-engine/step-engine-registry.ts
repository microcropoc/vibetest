import type { Step } from '../../courses/course.model';

import { createJavascriptStepEngine } from './javascript';
import { createQuizStepEngine } from './quiz';
import { createRegexStepEngine } from './regex';
import { createSqliteStepEngine } from './sqlite';
import { createSvgStepEngine } from './svg';
import { createTheoryStepEngine } from './theory';
import type { StepType } from './step-progress-snapshot';

const theory = createTheoryStepEngine();
const quiz = createQuizStepEngine();
const svg = createSvgStepEngine();
const javascript = createJavascriptStepEngine();
const sqlite = createSqliteStepEngine();
const regex = createRegexStepEngine();

export const stepEnginesByType = {
  theory,
  quiz,
  svg,
  javascript,
  sqlite,
  regex,
} as const;

export type RegisteredStepType = keyof typeof stepEnginesByType;

export function isRegisteredStepType(type: Step['type']): type is RegisteredStepType {
  return type in stepEnginesByType;
}

export function assertRegisteredStepType(type: Step['type']): asserts type is RegisteredStepType {
  if (!isRegisteredStepType(type)) {
    throw new Error(`No step engine registered for type "${type as StepType}"`);
  }
}
