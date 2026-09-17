# vt-25 — Statistics page

## Контекст

Вкладка **Статистика**: сводка по курсам — прогресс, модули/шаги.

## Цель

Page loads all courses + progress aggregates via **vt-13** + repositories; read-only display.

## Требования

- Per course: title, modules completed/total, steps completed/total — через **vt-13** (не дублировать агрегацию на странице).
- Empty state when no courses.
- Signals; lazy route.

## Технические заметки

- Зависимости: **vt-12**, **vt-13**, **vt-14**, **vt-16**.

## План работ

- [ ] StatisticsPage
- [ ] Aggregate helpers reuse vt-13
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Показывает осмысленные агрегаты из stepProgress

## Вне рамок задачи

- Charts, export
