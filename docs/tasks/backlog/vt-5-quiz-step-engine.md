# vt-5 — Движок шага `quiz` (без UI)

## Контекст

Quiz — локальная проверка ответа по `correctIndices`; один индекс → radio, несколько → checkbox. Успех → `completed`; ошибка → флаг для красного индикатора и retry.

## Цель

Доменный движок quiz: выбор ответа(ов), submit, сравнение с `correctIndices` (порядок индексов нормализовать), success/failure, retry; тесты single/multiple choice и граничных кейсов.

## Требования

- Соответствие `$defs/quizContent`.
- Сравнение множеств индексов (не порядок в массиве ответа пользователя).
- Невалидный выбор (пустой, индекс вне диапазона) — ошибка без `completed`.
- Успешная проверка → `completed`; неудача → `lastCheckFailed` (или эквивалент контракта vt-3).
- Retry сбрасывает выбор и флаг неудачи.
- Тесты без TestBed.

## Технические заметки

- Зависимости: **vt-3**, **vt-2**.
- Без UI radio/checkbox.

## План работ

- [ ] Логика submit и normalize indices
- [ ] Интеграция в registry
- [ ] Тесты: single, multi, wrong, retry
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Поведение совпадает со [SPECIFICATION.md](../../SPECIFICATION.md) (quiz)

## Вне рамок задачи

- Компоненты вопроса и вариантов
- Сохранение черновика в Dexie
