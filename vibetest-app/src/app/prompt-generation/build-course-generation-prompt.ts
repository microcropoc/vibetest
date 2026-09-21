const INSTRUCTIONS = `Сгенерируй JSON курса для импорта в приложение VibeTest.

Требования:
- Весь курс на русском языке: title, description, названия модулей и шагов, контент шагов.
- В каждом модуле обязательно должны быть шаги типов theory, svg и quiz (минимум по одному шагу каждого типа в каждом модуле).
- Формат — import-DTO: schemaVersion равен 1, без полей courseId, moduleId, stepId и createdAt.
- Верни только валидный JSON без пояснений, markdown и обёрток.`;

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
