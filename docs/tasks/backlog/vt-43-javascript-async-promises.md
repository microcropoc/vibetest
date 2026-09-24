# vt-43 — JavaScript: async / promises

## Контекст

После vt-42 раннер синхронный: возврат thenable не ожидается; любой throw/reject в user-среде → fail кейса, даже если reference тоже reject. Для курса по промисам и `async/await` нужна нормализация async-результатов в рамках dual-env.

## Цель

После цепочки `args` + `calls` (vt-42) финальное значение **нормализуется**: if thenable — `await` с учётом **оставшегося** бюджета `timeoutMs` прогона шага; sync-значения сравниваются как раньше. Опционально **`rejects: true`** на кейсе: обе стороны должны reject; reason сравнивается через тот же JSON-equal (для `Error` — **`message`** string).

Oracle по-прежнему **referenceSolution**, не static `expected`.

## Требования

### Схема и спека

- `tests[].items`: опциональное **`rejects`** (`boolean`, default false при отсутствии).
- SPEC: await thenables на каждом шаге `calls` (если шаг возвращает thenable — await перед следующим call); pending без settle до timeout → fail; сравнение fulfilled values; ветка `rejects`.

### Семантика

1. Выполнение кейса как vt-42 (args → calls).
2. На каждом шаге, если результат thenable (`typeof then === 'function'`), **await** в Worker (async handler внутри message loop или dedicated async run — без блокировки UI; таймаут через vt-7 на весь прогон).
3. Финальные значения: если `rejects: true` — обе стороны должны reject; сравнить reasons; иначе обе fulfill → `jsonCompatibleEqual`.
4. User reject + ref fulfill (и наоборот) → fail.
5. Sync throw в call chain → fail (если не `rejects` и ref не throw symetrically — уточнить в SPEC: sync throw user vs sync throw ref с одинаким message при `rejects` — по желанию только Promise reject в v1; зафиксировать в REPORT).

### Протокол

- При необходимости расширить `javascriptCaseResult` (например флаг async error vs mismatch) — только если нужно UI; иначе достаточно `pass` + `message`.
- Runner: передача `rejects` в `javascriptRunCase`.

### Граничные тесты (обязательный checklist)

- [ ] sync `return 42` vs `return Promise.resolve(42)` → pass (await на ref/user)
- [ ] оба `Promise.resolve(1)` → pass
- [ ] user `new Promise(() => {})` до исчерпания timeout → fail (timeout)
- [ ] `rejects: true`, оба reject с reason `"err"` (string) → pass
- [ ] `rejects: true`, оба reject с `Error('x')` → pass по message
- [ ] оба reject, **`rejects` не задан** → fail
- [ ] user fulfill / ref reject → fail
- [ ] async + `calls`: шаг 1 возвращает Promise fn, шаг 2 вызывает resolved fn
- [ ] mixed: первый call sync callable, второй returns Promise
- [ ] `timeoutMs` — общий бюджет на все кейсы шага (регрессия vt-8)
- [ ] fail-fast: pending кейс не блокирует следующий кейс после fail предыдущего (второй не запускается)
- [ ] регрессия: все sync-only vt-42 кейсы без изменений

## Технические заметки

- Зависимости: **vt-42**, **vt-7**, **vt-8**.
- Thenable detection: минимально `then` callable; не требовать нативный `Promise`.

## План работ

- [ ] SPEC + schema + `generate:zod`
- [ ] Async execution path в Worker
- [ ] Runner + messages
- [ ] Checklist specs
- [ ] `ng test --watch=false` зелёный; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Все пункты checklist покрыты
- [ ] SPEC обновлён; sync-курсы и vt-42 сценарии зелёные

## Вне рамок задачи

- Fake timers, spy (`vt-44`)
- Проверка порядка microtasks vs macrotasks (vt-44)
- `fetch` / реальный I/O
- `checkScript`
