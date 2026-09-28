# vt-69 — Курс «C#: примитивы асинхронности и конкурентности»

## Цель

Третий флагманский курс в `docs/courses` для подготовки к лайвкодингу Ozon на C#: 15 модулей (theory, svg, quiz), .NET 8. Без шагов javascript — правка `sample-courses.spec.ts` (практика во всех модулях курса или ни в одном).

## Критерии готовности

- `docs/courses/csharp-concurrency-primitives/` + собранный `.json`
- `npm run generate:bundled-courses` обновляет манифест
- `ng test --watch=false` зелёный
- Примеры C# компилируются во временном проекте .NET 8 (вне репозитория)
