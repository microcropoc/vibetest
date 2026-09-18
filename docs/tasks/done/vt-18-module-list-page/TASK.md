# vt-18 — Страница модулей курса

## Контекст

После «Пройти» на курсе — список модулей с прогрессом по шагам и **Пройти** → плеер; **Выход** → курсы.

## Цель

Page для `:courseId/modules`: карточки модулей, progress per module, navigation to player entry (route params), exit to course list.

## Требования

- Прогресс модуля: шаги completed / total (vt-13).
- «Пройти» → route плеера (orchestration vt-19 может быть stub route до готовности).
- Кнопка **Выход** → список курсов.
- Lazy route; signals.

## Технические заметки

- Зависимости: **vt-12**, **vt-13**, **vt-14**, **vt-16**.

## План работ

- [x] Module list page + card
- [x] Routing from vt-17
- [x] Tests
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] Exit и карточки по спецификации

## Вне рамок задачи

- Player orchestration (vt-19)
