# vt-17 — Страница списка курсов

## Контекст

Вкладка **Курсы**: карточки с названием, прогрессом (модули / пройдено), **Пройти**, удаление курса.

## Цель

Smart page: загрузка курсов и прогресса, агрегация через **vt-13**, переход к модулям по «Пройти»; empty state.

## Требования

- Карточка: title, progress summary, Пройти, удалить (confirm через общий компонент).
- Создать dumb **`ConfirmDialogComponent`** (или аналог) в `shared/ui/` — переиспользуемый confirm/cancel; покрыть тестами open/confirm/cancel.
- Прогресс: число модулей и сколько модулей полностью пройдено (спецификация).
- Signals + `@if` / `@for`; TestBed для page, domain mocked.
- Route внутри shell (vt-16).

## Технические заметки

- Зависимости: **vt-12**, **vt-13**, **vt-14**, **vt-16**.

## План работ

- [ ] `ConfirmDialogComponent` in `shared/ui/`
- [ ] Course list page + dumb card component
- [ ] Wire repositories
- [ ] Tests behavior
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Соответствует разделу «Курсы» спецификации

## Вне рамок задачи

- Module list (vt-18), player
