---
branch: feature/vt-16-app-shell-routes
---

# Отчёт vt-16 — App shell и lazy routes

## Что сделано

- `AppShell` с горизонтальной навигацией (Курсы | Статистика | Импорт | Инфо) и `router-outlet` для дочерних страниц.
- `app.routes.ts`: lazy `loadComponent` для shell и всех primary/nested маршрутов; редирект `''` → `courses`.
- Placeholder-страницы: курсы, модули курса (`courseId`), плеер (`courseId` + `moduleId`), статистика, импорт, инфо.
- Корневой `App` — только `router-outlet`; `withComponentInputBinding()` для route params → inputs.
- Обновлены `app.spec.ts` и добавлен `app-shell.spec.ts`.

## Изменённые файлы

- `vibetest-app/src/app/app.routes.ts`, `app.html`, `app.ts`, `app.config.ts`, `app.spec.ts`
- `vibetest-app/src/app/shared/ui/app-shell/*`
- `vibetest-app/src/app/shared/ui/page-placeholder/*`
- `vibetest-app/src/app/courses/pages/*`, `player/pages/*`, `statistics/pages/*`, `import/pages/*`, `info/pages/*`

## Тесты

- `ng test --watch=false`: зелёный (101)
- `ng build`: зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
