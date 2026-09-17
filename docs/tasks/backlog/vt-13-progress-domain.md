# vt-13 — Progress domain (pure)

## Контекст

UI и плеер показывают прогресс курса/модуля, первый непройденный шаг и цвет индикаторов — это чистая логика без Dexie.

## Цель

В `progress/`: функции агрегации (модуль completed?, курс: N модулей / M пройдено; **steps completed/total** на модуль и курс для списков и статистики), `firstIncompleteStepIndex`, `stepIndicatorState` с приоритетом **current → failed → completed → untouched** ([SPECIFICATION.md](../../SPECIFICATION.md)).

## Требования

- Вход: структура курса + map/list прогресса шагов.
- Без Angular, без storage.
- Unit-тесты на граничные случаи (пустой прогресс, все completed, failed flag).

## Технические заметки

- Зависимость: **vt-3** (контракт статусов согласован с engine).
- Не дублировать engine transitions — только read-model/aggregation.

## План работ

- [ ] Types + pure functions
- [ ] Colocated specs
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Приоритет индикаторов покрыт тестами

## Вне рамок задачи

- Dexie (vt-14), UI (vt-17+)
