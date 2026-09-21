const INSTRUCTIONS = `Сгенерируй JSON курса для импорта в приложение VibeTest.

Требования к содержанию:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.

Требования к синтаксису JSON (строго):
- Все строковые значения — корректный JSON: экранируй символы " и \\, управляющие символы; переносы строк внутри строк только как \\n (при необходимости \\r, \\t). Не вставляй буквальные переводы строк внутрь JSON-строк.
- Особенно проверь экранирование в полях content (theory), svg, starterCode, referenceSolution, setup, reset и в SQL/regex-текстах practice-шагов.
- Запрещено: комментарии в JSON, trailing commas после последнего элемента, обёртки markdown (три обратных кавычки), любой текст до или после корневого объекта { ... }.

Перед ответом (обязательно):
- Убедись, что весь ответ успешно проходит JSON.parse.
- Убедись, что результат соответствует приложенной JSON Schema (course-import.schema.json).
- Если есть ошибка — исправь JSON и верни только исправленный вариант.

Верни только один JSON-объект без пояснений.`;

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
