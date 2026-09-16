# vt-20 — Player navigation UI

## Контекст

Плеер: квадратики шагов, Назад/Далее/Выход, клавиши, **Повторить**; приоритет цветов из спецификации.

## Цель

Dumb/smart split: step indicator bar, footer nav, keyboard handlers; binds to orchestrator **vt-19**.

## Требования

- Клик по квадратику → jump step (orchestrator).
- Last step: «Выход» вместо «Далее» → modules.
- Keyboard forward/back.
- Indicator colors via vt-13 `stepIndicatorState`.
- a11y: focus, labels on indicators.

## Технические заметки

- Зависимость: **vt-19**.

## План работ

- [ ] StepIndicatorComponent, PlayerNavComponent
- [ ] Keyboard listener (host/page)
- [ ] Component tests + whenStable
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Навигация и индикаторы по спецификации

## Вне рамок задачи

- Theory/quiz/practice content (vt-21–23)
