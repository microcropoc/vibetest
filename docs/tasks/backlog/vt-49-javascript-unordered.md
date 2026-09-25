# vt-49 — JavaScript: `unordered` (порядок не важен)

## Контекст

Задачи вроде threeSum / combinations возвращают набор коллекций, где **порядок групп и порядок внутри группы** по условию не важен. Точный `jsonCompatibleEqual` требует, чтобы ученик сортировал так же, как эталон — несправедливо.

## Цель

Опциональный флаг **`tests[].unordered: true`**: перед equal нормализовать значения (рекурсивная сортировка массивов по стабильному ключу). Default / отсутствие = текущее поведение (порядок важен).

## Требования

### Схема и спека

- `tests[].items.properties.unordered`: boolean, default false.
- SPEC: применяется к значениям, участвующим в сравнении после `structure`-serialize и с учётом `resultMode` (return и/или args).
- Правило нормализации **одно**, зафиксировать:
  - массивы: каждый элемент нормализовать, затем sort по `JSON.stringify` (или эквивалент стабильный для JSON-compatible);
  - plain objects: ключи уже сортируются в equal — дополнительно нормализовать values;
  - примитивы без изменений.
- Ограничение: не использовать для структур, где порядок **внутри** части ответа семантически важен, а снаружи нет — тогда vt-50 `checker`. Зафиксировать в description поля.

### Граничные тесты (checklist)

- [ ] без флага: `[[1,2],[3]]` vs `[[3],[1,2]]` → fail
- [ ] `unordered: true`: те же → pass
- [ ] внутри тройки `[-1,0,1]` vs `[0,-1,1]` → pass при unordered
- [ ] разный multiset → fail
- [ ] `unordered` + `structure.result: "list"` — list serialize **до** unordered (не сортировать узлы как raw object)
- [ ] регрессия кейсов без флага

## Технические заметки

- Зависимости: **vt-47** (нормализация после serialize / resultMode).
- Pure `sortUnordered` + unit; wiring в `run-javascript-case`.

## План работ

- [ ] SPEC + schema + zod
- [ ] `sortUnordered` + unit
- [ ] Integrate compare path
- [ ] Checklist; `ng test --watch=false`; REPORT

## Критерии готовности (Definition of Done)

- [ ] Checklist зелёный; default path без регрессий

## Вне рамок задачи

- Частичный unordered (только верхний уровень) — не вводить второй флаг
- `checker` (vt-50)
