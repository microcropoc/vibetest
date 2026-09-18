# vt-4 — Движок шага `theory` (без UI)

## Контекст

Шаг theory — markdown-строка в `content`; прогресс `completed` по явному переходу («Далее»). Нужна доменная логика без рендера.

## Цель

Реализовать движок `theory`, подключаемый к контракту vt-3: хранение «просмотрено», команда завершения, retry для тренировки; тесты поведения.

## Требования

- Соответствие `$defs/theoryContent` (строка markdown).
- `completed` только после явной команды advance/complete (не автоматически при открытии).
- Retry: сброс локального состояния попытки, повторное прохождение без снятия `completed`, если уже был успех (спецификация плеера).
- Тесты: happy path, повтор после completed; engine реализует контракт vt-3 (без central registry).

## Технические заметки

- Зависимости: **vt-3**, типы курса из **vt-2**.
- Домен: `player/` или `courses/` — рядом с core engine.
- Без markdown-рендера (UI позже).

## План работ

- [x] `TheoryStepEngine` как functions + types
- [x] Экспорт factory/create для theory по контракту vt-3
- [x] `*.spec.ts` colocated
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] Все требования покрыты тестами
- [x] Нет компонентов и TestBed для домена

## Вне рамок задачи

- Markdown-компонент, стили
- SVG, quiz, practice
