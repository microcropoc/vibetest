const INSTRUCTION_HEADER = `Сгенерируй JSON курса для импорта в приложение VibeTest.`;

const INSTRUCTION_SEMANTICS = `Семантика полей и шагов:
- В приложенной JSON Schema у свойств и $defs есть поле description на русском — основной источник смысла полей, типов шагов и practice-кейсов.
- Явные инструкции ниже (язык, обязательные типы шагов, формат json, экранирование) дополняют схему; при конфликте приоритет у инструкций ниже.
- Не выдумывай поля, типы content и правила проверки, которых нет в схеме или в инструкциях ниже.`;

const INSTRUCTION_CONTENT = `Требования к содержанию:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.`;

const INSTRUCTION_MARKDOWN = `Markdown в текстовых полях шагов (как в theory; fenced blocks внутри JSON-строк — экранируй обратные кавычки; отдельный уровень от внешней обёртки \`\`\`json):
- theory (поле content): заголовки (## / ###), абзацы, списки; многострочный код — fenced-блок с языком (javascript, sql, html и т.д.); короткие фрагменты — inline code.
- javascript / sqlite / regex (поле content.description): то же — условие задачи с fenced-блоками для примеров кода.
- quiz (content.question): Markdown с fenced-блоками при необходимости; content.options[] — только inline Markdown (inline code, **жирный**), без fenced-блоков.
- svg (content.description): Markdown с fenced-блоками; content.caption — только inline Markdown, без fenced-блоков.
- Не смешивай код и обычный текст в одном неразмеченном фрагменте.
- Не вставляй сырой HTML в Markdown-поля: литеральные угловые скобки и HTML-теги — только внутри inline code или fenced-блоков.
- Regex-паттерны, SQL, фрагменты с символами *, _, \\ — оборачивай в inline code или fenced-блок, иначе Markdown изменит текст (например a\\.b без backticks станет a.b).`;

const INSTRUCTION_OUTPUT_FORMAT = `Формат вывода (обязательно):
- Весь ответ — один fenced-блок с идентификатором json.
- Первая строка ответа: \`\`\`json
- Последняя строка ответа: \`\`\`
- Внутри блока — ровно один JSON-объект import-DTO, без комментариев и без текста до или после блока.`;

const INSTRUCTION_OUTPUT_FORMAT_STRUCTURED = `Формат вывода (обязательно):
- Весь ответ — ровно один JSON-объект import-DTO, без fenced-блока, комментариев и текста до или после объекта.`;

const JSON_SYNTAX_RULES = `Требования к синтаксису JSON (строго):
- Все строковые значения — корректный JSON: экранируй символы " и \\, управляющие символы; переносы строк внутри строк только как \\n (при необходимости \\r, \\t). Не вставляй буквальные переводы строк внутрь JSON-строк.
- Особенно проверь экранирование в полях content (theory, practice description, quiz question, svg description/caption — обратные кавычки в Markdown), svg, starterCode, referenceSolution, setup, reset и в SQL/regex-текстах practice-шагов.`;

const JSON_LITERAL_RULES = `- В JSON нельзя писать литералы undefined, NaN, Infinity, -0, 123n. В javascript-шагах для tests[].args и calls[].args используй теги: {\"$js\": \"undefined\"}, {\"$js\": \"NaN\"}, {\"$js\": \"Infinity\"}, {\"$js\": \"-Infinity\"}, {\"$js\": \"-0\"}, {\"$js\": \"bigint\", \"value\": \"123\"}. Для функций без return (in-place) задавай resultMode: \"args\".`;

const INSTRUCTION_JSON_SYNTAX = `${JSON_SYNTAX_RULES}
- Запрещено: комментарии в JSON, trailing commas после последнего элемента, любой текст вне единственного \`\`\`json-блока.
${JSON_LITERAL_RULES}`;

const INSTRUCTION_JSON_SYNTAX_STRUCTURED = `${JSON_SYNTAX_RULES}
- Запрещено: комментарии в JSON, trailing commas после последнего элемента, любой текст вне JSON-объекта.
${JSON_LITERAL_RULES}`;

const INSTRUCTION_SELF_CHECK = `Перед ответом (обязательно):
- Убедись, что содержимое внутри \`\`\`json-блока успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (course-import.schema.json).
- Если есть ошибка — исправь JSON и верни только исправленный вариант в том же формате (\`\`\`json … \`\`\`).`;

const INSTRUCTION_SELF_CHECK_STRUCTURED = `Перед ответом (обязательно):
- Убедись, что ответ успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (course-import.schema.json).
- Если есть ошибка — исправь JSON и верни только исправленный объект.`;

function instructions(structuredOutput: boolean): string {
  return [
    INSTRUCTION_HEADER,
    INSTRUCTION_SEMANTICS,
    INSTRUCTION_CONTENT,
    INSTRUCTION_MARKDOWN,
    structuredOutput ? INSTRUCTION_OUTPUT_FORMAT_STRUCTURED : INSTRUCTION_OUTPUT_FORMAT,
    structuredOutput ? INSTRUCTION_JSON_SYNTAX_STRUCTURED : INSTRUCTION_JSON_SYNTAX,
    structuredOutput ? INSTRUCTION_SELF_CHECK_STRUCTURED : INSTRUCTION_SELF_CHECK,
  ].join('\n\n');
}

export const FINAL_USER_REMINDER = `Выведи только JSON import-DTO (допускается один блок \`\`\`json … \`\`\`), без пояснений, пересказа схемы и текста на других языках. Весь курс — на русском.`;

export const FINAL_USER_REMINDER_STRUCTURED = `Выведи только JSON-объект import-DTO, без пояснений, пересказа схемы и текста на других языках. Весь курс — на русском.`;

export type CourseGenerationMessages = {
  readonly system: string;
  readonly user: string;
};

export type CourseGenerationMessagesOptions = {
  /** Server enforces `response_format: json_schema`, so the answer is raw JSON without a fence. */
  readonly structuredOutput?: boolean;
};

function authorDescriptionBlock(courseDescription: string): string {
  const trimmedDescription = courseDescription.trim();
  return trimmedDescription.length > 0
    ? trimmedDescription
    : '(описание не указано — придумай тему курса по смыслу задания)';
}

export function buildCourseGenerationMessages(
  courseDescription: string,
  schemaJsonText: string,
  options?: CourseGenerationMessagesOptions,
): CourseGenerationMessages {
  const structuredOutput = options?.structuredOutput === true;
  const descriptionBlock = authorDescriptionBlock(courseDescription);
  return {
    system: `${instructions(structuredOutput)}

JSON Schema (course-import.schema.json):
${schemaJsonText}`,
    user: `Описание курса от автора:
${descriptionBlock}

${structuredOutput ? FINAL_USER_REMINDER_STRUCTURED : FINAL_USER_REMINDER}`,
  };
}

export function buildCourseGenerationPrompt(
  courseDescription: string,
  schemaJsonText: string,
): string {
  const descriptionBlock = authorDescriptionBlock(courseDescription);

  return `${instructions(false)}

Описание курса от автора:
${descriptionBlock}

JSON Schema (course-import.schema.json):
${schemaJsonText}`;
}
