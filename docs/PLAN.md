# vibetest — план разработки

Здесь — дорожная карта и приоритеты. **Что** строим: [SPECIFICATION.md](SPECIFICATION.md). **Как** по шагам: задачи `vt-{n}` в [tasks/](tasks/) (`backlog` → `in-progress` → `done`).

## Этапы

1. **Scaffold** — `vt-1` (done): Angular CLI, сборка и тесты.
2. **Схема и типы** — `vt-2`: JSON Schema в приложении, генерация Zod, `parseCourse` / импорт-валидация.
3. **Движки шагов (домен, без UI)** — `vt-3` … `vt-9`: общий контракт, затем по типу шага (`theory`, `quiz`, `svg`, `javascript`, `sqlite`, `regex`).
4. **Дальше (не в backlog)** — хранение (Dexie), экраны и навигация, PWA, player UI, импорт UI.

## Очередь задач

| # | Задача | Зависимости |
|---|--------|-------------|
| vt-2 | [course-schema-zod](tasks/backlog/vt-2-course-schema-zod.md) | vt-1 |
| vt-3 | [step-engine-core](tasks/backlog/vt-3-step-engine-core.md) | vt-2 |
| vt-4 | [theory-step-engine](tasks/backlog/vt-4-theory-step-engine.md) | vt-3 |
| vt-5 | [quiz-step-engine](tasks/backlog/vt-5-quiz-step-engine.md) | vt-3 |
| vt-6 | [svg-step-engine](tasks/backlog/vt-6-svg-step-engine.md) | vt-3 |
| vt-7 | [javascript-step-engine](tasks/backlog/vt-7-javascript-step-engine.md) | vt-3 |
| vt-8 | [sqlite-step-engine](tasks/backlog/vt-8-sqlite-step-engine.md) | vt-3 |
| vt-9 | [regex-step-engine](tasks/backlog/vt-9-regex-step-engine.md) | vt-3 |

Практические движки (`vt-7`–`vt-9`) опираются на контракт Worker/сообщений из `execution/`; детали — в задачах.

## Решения и допущения

- Общий «базовый» движок — **контракт + чистые функции**, не абстрактный класс (см. rule).
- Источник структуры курса — [`schemas/course.schema.json`](schemas/course.schema.json); generated Zod не редактируют вручную.
- Движки шагов в этой очереди — **без UI**, без IndexedDB и без маршрутов.

## Заметки

_(свободная форма)_
