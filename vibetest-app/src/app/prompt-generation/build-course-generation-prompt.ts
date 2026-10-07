const INSTRUCTION_HEADER = `Сгенерируй JSON курса для импорта в приложение VibeTest.`;

export const INSTRUCTION_SEMANTICS = `Семантика полей и шагов:
- В приложенной JSON Schema у свойств и $defs есть поле description на русском — основной источник смысла полей, типов шагов и practice-кейсов.
- Явные инструкции ниже (язык, обязательные типы шагов, формат json, экранирование) дополняют схему; при конфликте приоритет у инструкций ниже.
- Не выдумывай поля, типы content и правила проверки, которых нет в схеме или в инструкциях ниже.`;

const INSTRUCTION_CONTENT = `Требования к содержанию:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.`;

export const INSTRUCTION_MARKDOWN = `Markdown в текстовых полях шагов (как в theory; fenced blocks внутри JSON-строк — экранируй обратные кавычки; отдельный уровень от внешней обёртки \`\`\`json):
- theory (поле content): заголовки (## / ###), абзацы, списки; многострочный код — fenced-блок с языком (javascript, sql, html и т.д.); короткие фрагменты — inline code.
- javascript / sqlite / regex (поле content.description): то же — условие задачи с fenced-блоками для примеров кода.
- quiz (content.question): Markdown с fenced-блоками при необходимости; content.options[] — только inline Markdown (inline code, **жирный**), без fenced-блоков.
- svg (content.description): Markdown с fenced-блоками; content.caption — только inline Markdown, без fenced-блоков.
- Не смешивай код и обычный текст в одном неразмеченном фрагменте.
- Не вставляй сырой HTML в Markdown-поля: литеральные угловые скобки и HTML-теги — только внутри inline code или fenced-блоков.
- Regex-паттерны, SQL, фрагменты с символами *, _, \\ — оборачивай в inline code или fenced-блок, иначе Markdown изменит текст (например a\\.b без backticks станет a.b).`;

export const INSTRUCTION_SQLITE_PRACTICE = `SQL-практика (шаги sqlite; движок — SQLite в браузере, не MySQL):
- SQL в диалекте SQLite: strftime/date вместо DATE_FORMAT, IFNULL/COALESCE, || или concat; целочисленное деление 5/2 = 2 — для дробей умножай на 1.0.
- setup — только CREATE TABLE; данные — в tests[].seed каждого кейса; первый кейс — пример из условия, далее граничные случаи (пустые таблицы, NULL, дубликаты, ничьи).
- orderMatters: true только если условие требует порядок (ORDER BY); имена колонок важны (AS из условия) — checkColumnNames: true; AVG, деление, ROUND — floatTolerance (например 0.00001); задачи DELETE/UPDATE/INSERT — checkQuery: SELECT изменённой таблицы с ORDER BY.
- Задача-«функция» с параметром (N-й по величине и т.п.): таблица params(n INT) в setup, INSERT INTO params в seed кейса, запрос читает (SELECT n FROM params).
- starterCode — заготовка, которая не проходит тесты; referenceSolution проходит все tests.`;

/** `objectLabel` names the expected JSON object, e.g. `import-DTO`. */
export function outputFormatInstruction(objectLabel: string, structuredOutput: boolean): string {
  if (structuredOutput) {
    return `Формат вывода (обязательно):
- Весь ответ — ровно один JSON-объект ${objectLabel}, без fenced-блока, комментариев и текста до или после объекта.`;
  }
  return `Формат вывода (обязательно):
- Весь ответ — один fenced-блок с идентификатором json.
- Первая строка ответа: \`\`\`json
- Последняя строка ответа: \`\`\`
- Внутри блока — ровно один JSON-объект ${objectLabel}, без комментариев и без текста до или после блока.`;
}

const JSON_SYNTAX_RULES = `Требования к синтаксису JSON (строго):
- Все строковые значения — корректный JSON: экранируй символы " и \\, управляющие символы; переносы строк внутри строк только как \\n (при необходимости \\r, \\t). Не вставляй буквальные переводы строк внутрь JSON-строк.
- Особенно проверь экранирование в полях content (theory, practice description, quiz question, svg description/caption — обратные кавычки в Markdown), svg, starterCode, referenceSolution, setup, reset и в SQL/regex-текстах practice-шагов.`;

const JSON_LITERAL_RULES = `- В JSON нельзя писать литералы undefined, NaN, Infinity, -0, 123n. В javascript-шагах для tests[].args и calls[].args используй теги: {\"$js\": \"undefined\"}, {\"$js\": \"NaN\"}, {\"$js\": \"Infinity\"}, {\"$js\": \"-Infinity\"}, {\"$js\": \"-0\"}, {\"$js\": \"bigint\", \"value\": \"123\"}. Для функций без return (in-place) задавай resultMode: \"args\".`;

export function jsonForbiddenSyntaxRule(structuredOutput: boolean): string {
  return structuredOutput
    ? '- Запрещено: комментарии в JSON, trailing commas после последнего элемента, любой текст вне JSON-объекта.'
    : '- Запрещено: комментарии в JSON, trailing commas после последнего элемента, любой текст вне единственного ```json-блока.';
}

export function jsonSyntaxInstruction(structuredOutput: boolean): string {
  return `${JSON_SYNTAX_RULES}
${jsonForbiddenSyntaxRule(structuredOutput)}
${JSON_LITERAL_RULES}`;
}

export function selfCheckInstruction(schemaFileName: string, structuredOutput: boolean): string {
  if (structuredOutput) {
    return `Перед ответом (обязательно):
- Убедись, что ответ успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (${schemaFileName}).
- Если есть ошибка — исправь JSON и верни только исправленный объект.`;
  }
  return `Перед ответом (обязательно):
- Убедись, что содержимое внутри \`\`\`json-блока успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (${schemaFileName}).
- Если есть ошибка — исправь JSON и верни только исправленный вариант в том же формате (\`\`\`json … \`\`\`).`;
}

/** Last line of the user message: survives truncation of the prompt start. */
export function finalUserReminder(objectLabel: string, structuredOutput: boolean): string {
  return structuredOutput
    ? `Выведи только JSON-объект ${objectLabel}, без пояснений, пересказа схемы и текста на других языках. Весь курс — на русском.`
    : `Выведи только JSON ${objectLabel} (допускается один блок \`\`\`json … \`\`\`), без пояснений, пересказа схемы и текста на других языках. Весь курс — на русском.`;
}

export function authorDescriptionBlock(courseDescription: string): string {
  const trimmedDescription = courseDescription.trim();
  return trimmedDescription.length > 0
    ? trimmedDescription
    : '(описание не указано — придумай тему курса по смыслу задания)';
}

export function buildCourseGenerationPrompt(
  courseDescription: string,
  schemaJsonText: string,
): string {
  const instructions = [
    INSTRUCTION_HEADER,
    INSTRUCTION_SEMANTICS,
    INSTRUCTION_CONTENT,
    INSTRUCTION_MARKDOWN,
    INSTRUCTION_SQLITE_PRACTICE,
    outputFormatInstruction('import-DTO', false),
    jsonSyntaxInstruction(false),
    selfCheckInstruction('course-import.schema.json', false),
  ].join('\n\n');

  return `${instructions}

Описание курса от автора:
${authorDescriptionBlock(courseDescription)}

JSON Schema (course-import.schema.json):
${schemaJsonText}`;
}
