# vt-20 — Player navigation UI

## Контекст

Плеер: квадратики шагов (tap/клик), Назад/Далее/Выход, **Повторить**; приоритет цветов из спецификации; **mobile/touch-first**, без горячих клавиш стрелок.

## Цель

Dumb/smart split: step indicator bar, footer nav (кнопки); binds to orchestrator **vt-19**.

## Требования

- Клик по квадратику → jump step (orchestrator).
- Last step: «Выход» вместо «Далее» → modules.
- Кнопка **Повторить** → `orchestrator.retry()` (quiz/практика/theory/svg по контракту vt-3); не дублировать retry в vt-21–23.
- Indicator colors via vt-13 `stepIndicatorState`.
- a11y: labels on indicators/touch targets (без keyboard shortcuts навигации по шагам).

## Технические заметки

- Зависимости: **vt-13**, **vt-19**.

## План работ

- [x] StepIndicatorComponent, PlayerNavComponent (incl. Повторить)
- [x] Component tests + whenStable
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] Навигация и индикаторы по спецификации

## Вне рамок задачи

- Theory/quiz/practice content (vt-21–23)
