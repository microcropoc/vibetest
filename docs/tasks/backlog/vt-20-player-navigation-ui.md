# vt-20 — Player navigation UI

## Контекст

Плеер: квадратики шагов (tap/клик), Назад/Далее/Выход, **Повторить**; приоритет цветов из спецификации; **mobile/touch-first**, без горячих клавиш стрелок.

## Цель

Dumb/smart split: step indicator bar, footer nav (кнопки); binds to orchestrator **vt-19**.

## Требования

- Клик по квадратику → jump step (orchestrator).
- Last step: «Выход» вместо «Далее» → modules.
- Indicator colors via vt-13 `stepIndicatorState`.
- a11y: labels on indicators/touch targets (без keyboard shortcuts навигации по шагам).

## Технические заметки

- Зависимость: **vt-19**.

## План работ

- [ ] StepIndicatorComponent, PlayerNavComponent
- [ ] Component tests + whenStable
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Навигация и индикаторы по спецификации

## Вне рамок задачи

- Theory/quiz/practice content (vt-21–23)
