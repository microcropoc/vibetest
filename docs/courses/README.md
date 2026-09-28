# Примеры курсов (JSON)

Флагманский курс для импорта в приложение. Формат — [course-import.schema.json](../schemas/course-import.schema.json).

| Файл | Описание |
|------|----------|
| [javascript-for-csharp.json](./javascript-for-csharp.json) | **JavaScript для C#-разработчика** — 20 модулей (theory, svg, javascript, regex, quiz) |

## Исходники и сборка

Модули лежат в [javascript-for-csharp/](./javascript-for-csharp/):

- `course.json` — заголовок и описание курса
- `NN-slug.module.json` — один модуль ([module-import.schema.json](../schemas/module-import.schema.json))

Сборка собранного курса:

```bash
cd vibetest-app
npm run build:courses
```

Перед коммитом убедитесь, что `javascript-for-csharp.json` совпадает с выводом сборки (проверяет `sample-courses.spec.ts`).

## Импорт

1. Откройте `javascript-for-csharp.json`, скопируйте целиком (или **Взять из буфера**).
2. **Импорт** → вставьте JSON → при первом импорте включите **Заменить все ID новыми UUID** → **Импортировать**.

Опционально: **Проверка js/sql/regex шагов** — dual-run эталона перед сохранением.

Отдельный модуль можно добавить через **Импорт модуля** (файл `NN-slug.module.json`).
