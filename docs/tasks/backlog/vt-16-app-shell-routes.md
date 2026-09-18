# vt-16 — App shell и lazy routes

## Контекст

Спецификация: верхняя навигация Курсы | Статистика | Импорт | Инфо; страницы lazy.

## Цель

Shell layout + `loadComponent` routes для четырёх вкладок и nested routes для курса/модуля/плеера (заглушки OK); default — Курсы. Без бизнес-логики списков.

## Требования

- Standalone only; pages не eager-import в `app.ts`.
- Горизонтальное меню переключает primary routes.
- Placeholder components с заголовком вкладки.
- SCSS, BEM-like.

## Технические заметки

- Зависимость: **vt-1**.
- `ng g component` для shell/pages по rule.

## План работ

- [ ] Layout + nav
- [ ] `app.routes.ts` lazy wiring
- [ ] Smoke: app boots, nav works
- [ ] Обновить scaffold **`app.spec.ts`** (убрать проверку «Hello, vibetest-app» / welcome `h1`) под новый shell
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Lazy loading соблюдён
- [ ] Четыре вкладки доступны

## Вне рамок задачи

- Реальные данные курсов, import logic, PWA (vt-27)
