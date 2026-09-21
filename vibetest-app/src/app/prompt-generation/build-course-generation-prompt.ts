const INSTRUCTIONS = `Сгенерируй JSON курса для импорта в приложение VibeTest.

Требования к содержанию:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.

Шаги theory (поле content — Markdown):
- Если в теории есть программный или технический код (JavaScript, SQL, HTML, CSS и т.д.), многострочный код оформляй fenced Markdown-блоком с обязательным идентификатором языка (например javascript, sql, html).
- Структурируй теорию: заголовки (## / ###), абзацы, списки; перед и после примера — краткое пояснение на русском.
- Не смешивай код и обычный текст в одном неразмеченном фрагменте; короткие фрагменты допустимы в inline code (одинарные обратные кавычки).
- Fenced blocks внутри строки content для theory — часть JSON-строки (экранируй обратные кавычки); это отдельный уровень, не путать с внешней обёрткой ответа.

Формат вывода (обязательно):
- Весь ответ — один fenced-блок с идентификатором json.
- Первая строка ответа: \`\`\`json
- Последняя строка ответа: \`\`\`
- Внутри блока — ровно один JSON-объект import-DTO, без комментариев и без текста до или после блока.

Требования к синтаксису JSON (строго):
- Все строковые значения — корректный JSON: экранируй символы " и \\, управляющие символы; переносы строк внутри строк только как \\n (при необходимости \\r, \\t). Не вставляй буквальные переводы строк внутрь JSON-строк.
- Особенно проверь экранирование в полях content (theory, включая обратные кавычки в Markdown), svg, starterCode, referenceSolution, setup, reset и в SQL/regex-текстах practice-шагов.
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
