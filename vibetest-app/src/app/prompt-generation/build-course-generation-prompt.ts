const INSTRUCTIONS = `Сгенерируй JSON курса для импорта в приложение VibeTest.

Семантика полей и шагов:
- В приложенной JSON Schema у свойств и $defs есть поле description на русском — основной источник смысла полей, типов шагов и practice-кейсов.
- Явные инструкции ниже (язык, обязательные типы шагов, формат json, экранирование) дополняют схему; при конфликте приоритет у инструкций ниже.
- Не выдумывай поля, типы content и правила проверки, которых нет в схеме или в инструкциях ниже.

Требования к содержанию:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.

Markdown в текстовых полях шагов (как в theory; fenced blocks внутри JSON-строк — экранируй обратные кавычки; отдельный уровень от внешней обёртки \`\`\`json):
- theory (поле content): заголовки (## / ###), абзацы, списки; многострочный код — fenced-блок с языком (javascript, sql, html и т.д.); короткие фрагменты — inline code.
- javascript / sqlite / regex (поле content.description): то же — условие задачи с fenced-блоками для примеров кода.
- quiz (content.question): Markdown с fenced-блоками при необходимости; content.options[] — только inline Markdown (inline code, **жирный**), без fenced-блоков.
- svg (content.description): Markdown с fenced-блоками; content.caption — только inline Markdown, без fenced-блоков.
- Не смешивай код и обычный текст в одном неразмеченном фрагменте.
- Не вставляй сырой HTML в Markdown-поля: литеральные угловые скобки и HTML-теги — только внутри inline code или fenced-блоков.
- Regex-паттерны, SQL, фрагменты с символами *, _, \\ — оборачивай в inline code или fenced-блок, иначе Markdown изменит текст (например a\\.b без backticks станет a.b).

Формат вывода (обязательно):
- Весь ответ — один fenced-блок с идентификатором json.
- Первая строка ответа: \`\`\`json
- Последняя строка ответа: \`\`\`
- Внутри блока — ровно один JSON-объект import-DTO, без комментариев и без текста до или после блока.

Требования к синтаксису JSON (строго):
- Все строковые значения — корректный JSON: экранируй символы " и \\, управляющие символы; переносы строк внутри строк только как \\n (при необходимости \\r, \\t). Не вставляй буквальные переводы строк внутрь JSON-строк.
- Особенно проверь экранирование в полях content (theory, practice description, quiz question, svg description/caption — обратные кавычки в Markdown), svg, starterCode, referenceSolution, setup, reset и в SQL/regex-текстах practice-шагов.
- Запрещено: комментарии в JSON, trailing commas после последнего элемента, любой текст вне единственного \`\`\`json-блока.

Перед ответом (обязательно):
- Убедись, что содержимое внутри \`\`\`json-блока успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (course-import.schema.json).
- Если есть ошибка — исправь JSON и верни только исправленный вариант в том же формате (\`\`\`json … \`\`\`).`;

export function buildCourseGenerationPrompt(
  courseDescription: string,
  schemaJsonText: string,
): string {
  const trimmedDescription = courseDescription.trim();
  const descriptionBlock =
    trimmedDescription.length > 0
      ? trimmedDescription
      : '(описание не указано — придумай тему курса по смыслу задания)';

  return `${INSTRUCTIONS}

Описание курса от автора:
${descriptionBlock}

JSON Schema (course-import.schema.json):
${schemaJsonText}`;
}
