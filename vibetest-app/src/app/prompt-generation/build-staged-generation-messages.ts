import type { CourseOutline, CourseOutlineModule } from '../course-generation/course-outline.model';
import { formatImportIssue } from '../courses/import-issue-view';
import type { ImportIssue } from '../courses/import-types';

import {
  INSTRUCTION_MARKDOWN,
  INSTRUCTION_SEMANTICS,
  authorDescriptionBlock,
  finalUserReminder,
  jsonForbiddenSyntaxRule,
  jsonSyntaxInstruction,
  outputFormatInstruction,
  selfCheckInstruction,
} from './build-course-generation-prompt';

export type StagedGenerationMessages = {
  readonly system: string;
  readonly user: string;
};

export type StagedGenerationMessagesOptions = {
  /** Server enforces `response_format: json_schema`, so the answer is raw JSON without a fence. */
  readonly structuredOutput?: boolean;
  /** Issues of the previous rejected attempt; added to the user message before the reminder. */
  readonly retryIssues?: readonly ImportIssue[];
};

export const RETRY_NOTE_MAX_ISSUES = 10;

const OUTLINE_LABEL = 'плана курса';

export const OUTLINE_MODULE_EXAMPLE = `Пример одного модуля (пример структуры, не содержания):
{"title": "…", "summary": "…", "steps": [
  {"type": "theory", "title": "…", "summary": "…"},
  {"type": "svg", "title": "…", "summary": "…"},
  {"type": "theory", "title": "…", "summary": "…"},
  {"type": "quiz", "title": "…", "summary": "…"}
]}`;

export const OUTLINE_SELF_CHECK =
  'Перед ответом проверь каждый модуль: в steps есть type theory, svg и quiz.';
const COURSE_LABEL = 'import-DTO';
const MODULE_LABEL = 'module-import DTO';

export function retryNote(issues: readonly ImportIssue[]): string {
  const shown = issues.slice(0, RETRY_NOTE_MAX_ISSUES).map((issue) => `- ${formatImportIssue(issue)}`);
  const rest = issues.length - shown.length;
  const tail = rest > 0 ? [`- … и ещё ${rest}`] : [];
  return ['Предыдущий ответ отклонён. Исправь ошибки и выведи ответ заново:', ...shown, ...tail].join(
    '\n',
  );
}

/** One text for chat UIs without a system role: rules and schema first, stage data and reminder last. */
export function joinStagedMessages(messages: StagedGenerationMessages): string {
  return `${messages.system}\n\n${messages.user}`;
}

function stepLine(step: CourseOutlineModule['steps'][number], prefix: string): string {
  return `${prefix} [${step.type}] ${step.title} — ${step.summary}`;
}

/** Plain-text outline: course, then numbered modules with their steps. */
export function formatOutlineForPrompt(outline: CourseOutline): string {
  const modules = outline.modules.map((module, moduleIndex) => {
    const number = moduleIndex + 1;
    const steps = module.steps.map((step, stepIndex) =>
      stepLine(step, `   ${number}.${stepIndex + 1}`),
    );
    return [`${number}. «${module.title}» — ${module.summary}`, ...steps].join('\n');
  });
  return [`Курс: «${outline.title}»`, `Описание: ${outline.description}`, 'Модули:', ...modules].join(
    '\n',
  );
}

function moduleHeading(outline: CourseOutline, moduleIndex: number): string {
  const module = outline.modules[moduleIndex]!;
  return `модуль ${moduleIndex + 1} из ${outline.modules.length}: «${module.title}»`;
}

function moduleStepsBlock(module: CourseOutlineModule): string {
  return ['Шаги модуля по плану:', ...module.steps.map((step) => stepLine(step, '-'))].join('\n');
}

function system(blocks: readonly string[], schemaFileName: string, schemaText: string): string {
  return `${blocks.join('\n\n')}

JSON Schema (${schemaFileName}):
${schemaText}`;
}

function user(
  blocks: readonly string[],
  objectLabel: string,
  options: StagedGenerationMessagesOptions | undefined,
): string {
  const structuredOutput = options?.structuredOutput === true;
  const retry =
    options?.retryIssues !== undefined && options.retryIssues.length > 0
      ? [retryNote(options.retryIssues)]
      : [];
  return [...blocks, ...retry, finalUserReminder(objectLabel, structuredOutput)].join('\n\n');
}

/** Stage 1: modules and steps without step content. */
export function buildOutlineMessages(
  courseDescription: string,
  outlineSchemaText: string,
  options?: StagedGenerationMessagesOptions,
): StagedGenerationMessages {
  const structuredOutput = options?.structuredOutput === true;
  return {
    system: system(
      [
        'Составь план курса для приложения VibeTest: модули и шаги без содержимого шагов. По этому плану затем будет сгенерирован каждый модуль.',
        INSTRUCTION_SEMANTICS,
        `Требования к плану:
- Весь план на русском языке: title и description курса, названия и summary модулей и шагов.
- В каждом модуле минимум по одному шагу типов theory, svg и quiz; практика (javascript, sqlite, regex) — только если подходит теме.
- Размер: обычно 3–8 модулей и 4–10 шагов в модуле, если автор не просит иначе; каждый модуль потом генерируется одним ответом модели, поэтому не перегружай модуль.
- Модули идут от простого к сложному; шаги внутри модуля — в порядке прохождения.
- summary шага — о чём шаг, без самого содержимого: без текста теории, кода и вариантов ответа.`,
        OUTLINE_MODULE_EXAMPLE,
        outputFormatInstruction(OUTLINE_LABEL, structuredOutput),
        `Требования к синтаксису JSON (строго):
- Все строки — корректный JSON: экранируй символы " и \\; без буквальных переводов строк внутри строк.
${jsonForbiddenSyntaxRule(structuredOutput)}`,
        selfCheckInstruction('course-outline.schema.json', structuredOutput),
      ],
      'course-outline.schema.json',
      outlineSchemaText,
    ),
    user: user(
      [`Описание курса от автора:\n${authorDescriptionBlock(courseDescription)}`, OUTLINE_SELF_CHECK],
      OUTLINE_LABEL,
      options,
    ),
  };
}

/** Stage 2: course import-DTO with exactly the first module of the outline. */
export function buildFirstModuleCourseMessages(
  courseDescription: string,
  outline: CourseOutline,
  courseImportSchemaText: string,
  options?: StagedGenerationMessagesOptions,
): StagedGenerationMessages {
  const structuredOutput = options?.structuredOutput === true;
  return {
    system: system(
      [
        'Сгенерируй JSON курса для импорта в приложение VibeTest. Курс генерируется по частям: сейчас нужен курс только с первым модулем плана.',
        INSTRUCTION_SEMANTICS,
        `Требования к содержанию:
- Весь курс на русском языке: title, description, название модуля, названия и контент шагов.
- title и description курса — из плана.
- В modules ровно один модуль — первый модуль плана; его title и шаги (типы, названия, порядок) — по плану.
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.`,
        INSTRUCTION_MARKDOWN,
        outputFormatInstruction(COURSE_LABEL, structuredOutput),
        jsonSyntaxInstruction(structuredOutput),
        selfCheckInstruction('course-import.schema.json', structuredOutput),
      ],
      'course-import.schema.json',
      courseImportSchemaText,
    ),
    user: user(
      [
        `Описание курса от автора:\n${authorDescriptionBlock(courseDescription)}`,
        `План курса:\n${formatOutlineForPrompt(outline)}`,
        `Сгенерируй курс, в котором только ${moduleHeading(outline, 0)}.\n${moduleStepsBlock(outline.modules[0]!)}`,
      ],
      COURSE_LABEL,
      options,
    ),
  };
}

/** Stage 3: one module-import DTO for `moduleIndex` (0-based) of the outline. */
export function buildModuleMessages(
  outline: CourseOutline,
  moduleIndex: number,
  moduleImportSchemaText: string,
  options?: StagedGenerationMessagesOptions,
): StagedGenerationMessages {
  const structuredOutput = options?.structuredOutput === true;
  return {
    system: system(
      [
        'Сгенерируй JSON одного модуля для добавления в конец существующего курса в приложении VibeTest.',
        INSTRUCTION_SEMANTICS,
        `Требования к содержанию:
- Весь модуль на русском языке: title, названия и контент шагов.
- title модуля и шаги (типы, названия, порядок) — строго по плану для указанного модуля.
- Не повторяй материал других модулей плана.
- Формат — module-import DTO: schemaVersion равен 1, без полей moduleId и stepId.`,
        INSTRUCTION_MARKDOWN,
        outputFormatInstruction(MODULE_LABEL, structuredOutput),
        jsonSyntaxInstruction(structuredOutput),
        selfCheckInstruction('module-import.schema.json', structuredOutput),
      ],
      'module-import.schema.json',
      moduleImportSchemaText,
    ),
    user: user(
      [
        `План курса:\n${formatOutlineForPrompt(outline)}`,
        `Сгенерируй ${moduleHeading(outline, moduleIndex)}.\n${moduleStepsBlock(outline.modules[moduleIndex]!)}`,
      ],
      MODULE_LABEL,
      options,
    ),
  };
}
