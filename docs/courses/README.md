# Примеры курсов (JSON)

Флагманские курсы для приложения и ручного импорта. Формат — [course-import.schema.json](../schemas/course-import.schema.json).

При сборке PWA все `*.json` из этой папки попадают в комплект приложения (`public/bundled-courses/`) с **детерминированными UUID** (хеш содержимого). При первом запуске и после обновления приложения новые встроенные курсы добавляются в IndexedDB автоматически. Удалённые пользователем встроенные курсы можно вернуть в **Настройках** («Добавить недостающие курсы»). Ручной импорт JSON по-прежнему доступен на странице **Импорт**.

| Файл | Описание |
|------|----------|
| [javascript-for-csharp.json](./javascript-for-csharp.json) | **JavaScript для C#-разработчика** — 20 модулей (theory, svg, javascript, regex, quiz) |
| [algorithms-blind-75.json](./algorithms-blind-75.json) | **Алгоритмы на JavaScript: Blind 75** — 17 модулей (theory, svg, javascript, quiz), все задачи NeetCode Blind 75 + разминки |
| [csharp-concurrency-primitives.json](./csharp-concurrency-primitives.json) | **C#: примитивы асинхронности и конкурентности** — 15 модулей (theory, svg, quiz), .NET 8, подготовка к лайвкодингу Ozon |
| [ozon-csharp-livecoding.json](./ozon-csharp-livecoding.json) | **Лайвкодинг в Ozon на C#** — 25 модулей (intro + 24 дня: Enrichment … Outbox), theory, svg, quiz, решения .NET 8 |
| [csharp-ozon-interview.json](./csharp-ozon-interview.json) | **C# для опытного разработчика: собеседование в Ozon** — 21 модуль (intro + 20 тем: CLR … архитектура), theory, svg, вопросы с собеседования, quiz, .NET 8 |

## Исходники и сборка

Каждый курс — каталог с `course.json` и модулями `NN-slug.module.json`:

- [javascript-for-csharp/](./javascript-for-csharp/)
- [algorithms-blind-75/](./algorithms-blind-75/)
- [csharp-concurrency-primitives/](./csharp-concurrency-primitives/)
- [ozon-csharp-livecoding/](./ozon-csharp-livecoding/)
- [csharp-ozon-interview/](./csharp-ozon-interview/)

- `course.json` — заголовок и описание курса
- `NN-slug.module.json` — один модуль ([module-import.schema.json](../schemas/module-import.schema.json))

Сборка всех курсов из исходников:

```bash
cd vibetest-app
npm run build:courses
npm run generate:bundled-courses   # перед ng serve / в prebuild автоматически
```

Для production-сборки используйте `npm run build` (запускает `prebuild` и генерацию bundled-курсов). Прямой `ng build` без `prebuild` **не** создаст `public/bundled-courses/` — встроенные курсы не установятся до следующей корректной сборки.

Источник правды — `NN-slug.module.json`: правьте их, затем запускайте сборку.

Перед коммитом убедитесь, что `*.json` в корне `docs/courses/` совпадают с выводом сборки (проверяет `sample-courses.spec.ts`).

## Импорт

1. Откройте нужный `*.json`, скопируйте целиком (или **Взять из буфера**).
2. **Импорт** → вставьте JSON → при первом импорте включите **Заменить все ID новыми UUID** → **Импортировать**.

Опционально: **Проверка js/sql/regex шагов** — dual-run эталона перед сохранением.

Отдельный модуль можно добавить через **Импорт модуля** (файл `NN-slug.module.json`).
