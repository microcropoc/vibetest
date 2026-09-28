# Примеры курсов (JSON)

Флагманские курсы для импорта в приложение. Формат — [course-import.schema.json](../schemas/course-import.schema.json).

| Файл | Описание |
|------|----------|
| [javascript-for-csharp.json](./javascript-for-csharp.json) | **JavaScript для C#-разработчика** — 20 модулей (theory, svg, javascript, regex, quiz) |
| [algorithms-blind-75.json](./algorithms-blind-75.json) | **Алгоритмы на JavaScript: Blind 75** — 17 модулей (theory, svg, javascript, quiz), все задачи NeetCode Blind 75 + разминки |

## Исходники и сборка

Каждый курс — каталог с `course.json` и модулями `NN-slug.module.json`:

- [javascript-for-csharp/](./javascript-for-csharp/)
- [algorithms-blind-75/](./algorithms-blind-75/)

- `course.json` — заголовок и описание курса
- `NN-slug.module.json` — один модуль ([module-import.schema.json](../schemas/module-import.schema.json))

Сборка всех курсов из исходников:

```bash
cd vibetest-app
npm run build:courses
```

Источник правды — `NN-slug.module.json`: правьте их, затем запускайте сборку.

Перед коммитом убедитесь, что `*.json` в корне `docs/courses/` совпадают с выводом сборки (проверяет `sample-courses.spec.ts`).

## Импорт

1. Откройте нужный `*.json`, скопируйте целиком (или **Взять из буфера**).
2. **Импорт** → вставьте JSON → при первом импорте включите **Заменить все ID новыми UUID** → **Импортировать**.

Опционально: **Проверка js/sql/regex шагов** — dual-run эталона перед сохранением.

Отдельный модуль можно добавить через **Импорт модуля** (файл `NN-slug.module.json`).
