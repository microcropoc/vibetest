# vt-50 — JavaScript: `checker` (escape hatch)

## Контекст

vt-47…vt-49 закрывают массовые кейсы декларативно (`resultMode`, `structure`, `construct`, `unordered`). Остаётся хвост: «любой валидный ответ», нестандартная нормализация, редкие структуры.

В PLAN исторически: dual-env **без** `checkScript`. Эта задача **осознанно** вводит узкий escape hatch — не замену флагов.

## Цель

Опциональное поле **`checker`**: JS-функция `(ctx) => boolean`, выполняется **вместо** (или после выбора — зафиксировать: **вместо**) default equal, в изолированной среде с таймаутом. Dual-run по-прежнему даёт `userResult` / `refResult` / args.

## Требования

### Схема и спека

- `checker`: string, maxLength 10000 (подобрать как у setup).
- Description: детерминизм; запрет Math.random / Date.now / I/O; не показывается ученику (как `referenceSolution`).
- При наличии `checker` — игнорировать default equal / `unordered` normalize? Зафиксировать: **checker полностью заменяет** сравнение значений; `expectInvocations` / rejects по-прежнему применяются **до** checker или параллельно — выбрать одно правило в SPEC (рекомендация: rejects/spies сначала; checker только на fulfilled path).

### Раннер

- Изолированный sandbox (отдельный context), timeout ~100–500 ms (константа в SPEC).
- В ctx: `userResult`, `refResult`, `userArgs`, `refArgs`, плюс хелперы: `deepEqual` (= `jsonCompatibleEqual`), `serializeList`, `serializeTree`, `sortUnordered` (из vt-47/49).
- Return строго `boolean`; иначе fail «checker must return boolean».
- Throw / timeout → fail с message.
- Результаты уже после `structure` serialize (если задан), чтобы checker не обязан был знать про ListNode — **или** сырые значения + хелперы; зафиксировать одно (рекомендация: сырые + хелперы, serialize* в ctx).

### Граничные тесты (checklist)

- [x] без checker — регрессия
- [x] in-place через checker: сравнение `userArgs[0]` (дубль vt-47 path)
- [x] «any permutation»: checker валидирует vs ref или независимо
- [x] non-boolean return → fail
- [x] throw → fail
- [x] infinite loop → timeout fail (не зависание шага)
- [x] checker не виден в player UI / не уходит в feedback ученику

## Технические заметки

- Зависимости: **vt-47**, **vt-49** (хелперы); **vt-48** желателен, не обязателен.
- Пересмотреть формулировку в PLAN про «без checkScript» → «без checkScript по умолчанию; опциональный `checker`».
- Не делать checker основным путём в демо-курсе (vt-51).

## План работ

- [x] SPEC + schema + zod
- [x] Sandbox runner + helpers injection
- [x] Checklist specs
- [x] `ng test --watch=false`; REPORT

## Критерии готовности (Definition of Done)

- [x] Checklist зелёный; флаги vt-47…49 остаются предпочтительным путём в docs

## Вне рамок задачи

- UI-шаблоны чекеров для автора
- Проверка O(n)
- Редактор курса
