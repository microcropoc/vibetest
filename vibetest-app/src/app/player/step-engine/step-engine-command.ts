import type { Step } from '../../courses/course.model';

/** Commands every step engine must handle. */
export type CoreStepCommand =
  | { readonly kind: 'advance' }
  | { readonly kind: 'retry' };

/**
 * Type-specific commands (e.g. `submitAnswer`, `runCheck`) are added in vt-4…vt-10
 * as `CoreStepCommand | TypeCommand` per engine.
 */
export type StepEngineCommandFor<TType extends Step['type']> = CoreStepCommand;

export function isCoreStepCommand(command: { readonly kind: string }): command is CoreStepCommand {
  return command.kind === 'advance' || command.kind === 'retry';
}
